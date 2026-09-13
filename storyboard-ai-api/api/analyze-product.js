const OPENAI_URL = 'https://api.openai.com/v1/responses';

function cors(req, res) {
  const origin = req.headers.origin || '';
  const defaults = ['https://christianvell01.github.io'];
  const extra = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowed = [...defaults, ...extra];
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (ok) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-storyboard-token');
  res.setHeader('Access-Control-Max-Age', '86400');
}

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    identified: { type: 'boolean' },
    match_status: { type: 'string', enum: ['exact', 'likely', 'generic', 'unknown'] },
    confidence: { type: 'number', minimum: 0, maximum: 100 },
    brand: { type: 'string' },
    product_name: { type: 'string' },
    variant: { type: 'string' },
    category: { type: 'string' },
    research_summary: { type: 'string' },
    key_benefits: { type: 'array', items: { type: 'string' }, maxItems: 8 },
    visual_observations: {
      type: 'object',
      additionalProperties: false,
      properties: {
        primary_shape: { type: 'string' },
        proportions: { type: 'string' },
        colors: { type: 'string' },
        materials: { type: 'string' },
        finish: { type: 'string' },
        packaging: { type: 'string' },
        labels_and_markings: { type: 'string' },
        components: { type: 'string' }
      },
      required: ['primary_shape', 'proportions', 'colors', 'materials', 'finish', 'packaging', 'labels_and_markings', 'components']
    },
    verified_facts: {
      type: 'array', maxItems: 10,
      items: { type: 'object', additionalProperties: false, properties: { fact: { type: 'string' }, source_url: { type: 'string' } }, required: ['fact', 'source_url'] }
    },
    sources: {
      type: 'array', maxItems: 8,
      items: { type: 'object', additionalProperties: false, properties: { title: { type: 'string' }, url: { type: 'string' } }, required: ['title', 'url'] }
    },
    search_queries: { type: 'array', items: { type: 'string' }, maxItems: 8 },
    three_d_asset_prompt: { type: 'string' },
    product_lock_prompt: { type: 'string' },
    negative_constraints: { type: 'array', items: { type: 'string' }, maxItems: 16 },
    warnings: { type: 'array', items: { type: 'string' }, maxItems: 10 }
  },
  required: ['identified','match_status','confidence','brand','product_name','variant','category','research_summary','key_benefits','visual_observations','verified_facts','sources','search_queries','three_d_asset_prompt','product_lock_prompt','negative_constraints','warnings']
};

function systemPrompt() {
  return `You are a product identification, product research, and CGI product-reconstruction specialist for an AI video storyboard application.

Your job is to analyze the uploaded product image, identify the exact commercial product when possible, research it on the public web, and create a reusable 3D Product Asset Lock prompt for image/video generation.

MANDATORY WORKFLOW:
1. Inspect the image carefully. Read visible brand names, model names, variant names, labels, package text, colors, geometry, materials, finish, components, closures, caps, bottles, boxes, logos, and proportions.
2. Use web search every time. Search visible brand/product/model text plus distinguishing features. Try multiple queries when necessary.
3. Prefer sources in this order: official brand/manufacturer pages; official product documentation; major authorized retailers; reputable retailers or editorial product pages.
4. Cross-check candidate matches. Do not claim an exact match unless the visual evidence and web evidence support it.
5. Never invent dimensions, ingredients, materials, features, or variant names. If not verified, leave the wording clearly visual/inferred and add a warning.
6. Separate visually observed attributes from web-verified facts.
7. Create a THREE_D_ASSET_PROMPT that can turn the uploaded product reference into a photorealistic CGI/3D-rendered version for use as a reusable video asset. It must describe exact geometry, proportions, packaging, materials, colors, finish, logo/label placement, components, scale relationships, and PBR-style material behavior. If exact dimensions are not verified, say to match the uploaded reference proportions rather than inventing measurements.
8. Create a PRODUCT_LOCK_PROMPT designed to be appended to every storyboard image/video prompt. It must demand exact product identity consistency and prohibit logo drift, label drift, color changes, geometry changes, packaging redesign, missing parts, extra parts, altered proportions, and random text.
9. If only one side is visible, explicitly say not to invent unseen branding/details; preserve visible identity and use neutral, plausible non-branded geometry for unseen surfaces.
10. The result should be useful for generators such as Veo, Kling, Runway, Hailuo, and image generators.

Return only the required structured result.`;
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });

  const requiredToken = process.env.STORYBOARD_ACCESS_TOKEN || '';
  if (requiredToken && req.headers['x-storyboard-token'] !== requiredToken) return res.status(401).json({ error: 'Invalid storyboard access token.' });

  const { imageDataUrl, hintName = '', hintCategory = '' } = req.body || {};
  if (!imageDataUrl || typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) return res.status(400).json({ error: 'A valid imageDataUrl is required.' });
  if (imageDataUrl.length > 4_000_000) return res.status(413).json({ error: 'Image payload is too large. Please use a smaller image.' });

  const userText = `Analyze and research this exact product image.\nUser hint product name: ${hintName || '(none)'}\nUser hint category: ${hintCategory || '(none)'}\nTreat user hints as clues, not verified facts. Force a real web search and prioritize the official product source when available.`;

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5.6-terra',
        reasoning: { effort: 'low' },
        tools: [{ type: 'web_search', search_context_size: 'medium' }],
        tool_choice: 'required',
        include: ['web_search_call.results'],
        input: [
          { role: 'system', content: systemPrompt() },
          { role: 'user', content: [{ type: 'input_text', text: userText }, { type: 'input_image', image_url: imageDataUrl, detail: 'high' }] }
        ],
        text: { format: { type: 'json_schema', name: 'product_research_3d_lock', strict: true, schema } },
        max_output_tokens: 5000
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'OpenAI request failed.' });
    if (!data.output_text) return res.status(502).json({ error: 'The AI returned no structured product analysis.' });

    let analysis;
    try { analysis = JSON.parse(data.output_text); }
    catch { return res.status(502).json({ error: 'The AI returned an invalid product-analysis payload.' }); }
    return res.status(200).json({ analysis });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Product analysis failed on the server.' });
  }
}
