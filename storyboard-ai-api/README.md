# Storyboard AI — Product Research Backend

This Vercel serverless backend keeps the OpenAI API key private while the public GitHub Pages storyboard app sends product images for analysis.

## What it does

1. Receives a compressed product image from the Storyboard AI website.
2. Uses OpenAI vision to inspect visible branding, labels, geometry, colors, materials, packaging, and components.
3. Forces an OpenAI hosted web search to identify/research the exact product.
4. Returns structured verified product facts, research sources, a photorealistic 3D product recreation prompt, strict product-lock prompt, and negative constraints.
5. The frontend then injects the 3D lock into storyboard prompts.

## Deploy on Vercel

Create a new Vercel project from the same GitHub repository and set **Root Directory** to `storyboard-ai-api`.

Add these Environment Variables in Vercel:

- `OPENAI_API_KEY` — required. Keep this only in Vercel; never put it in the frontend/GitHub Pages JavaScript.
- `STORYBOARD_ACCESS_TOKEN` — recommended. Choose a private random passphrase. Enter the same passphrase in the Storyboard AI website's "AI research connection" panel.
- `OPENAI_MODEL` — optional; defaults to `gpt-5.6-terra`.
- `ALLOWED_ORIGINS` — optional comma-separated extra origins. `https://christianvell01.github.io` is already allowed.

After deployment, copy the Vercel project URL, for example `https://your-project.vercel.app`, into the Storyboard AI website's Backend URL field.
