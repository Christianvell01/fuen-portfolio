(()=>{
  if(window.__chatgptModeInit)return;
  window.__chatgptModeInit=true;

  const $=id=>document.getElementById(id);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const STORAGE_KEY='storyboard-ai-chatgpt-product-analysis-v1';
  const LOCK_START='[CHATGPT PRODUCT LOCK START]';
  const LOCK_END='[CHATGPT PRODUCT LOCK END]';
  const STUDIO_MARKER='CHATGPT 3D PRODUCT ASSET GUIDE:';
  let analysis=null;

  const css=`
    .cgCard{margin-top:14px;border:1px solid rgba(103,215,186,.25);background:linear-gradient(145deg,rgba(103,215,186,.065),rgba(139,124,255,.045));border-radius:16px;overflow:hidden}
    .cgHead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 13px;border-bottom:1px solid var(--line)}
    .cgTitle{display:flex;gap:9px;align-items:center}.cgIcon{width:32px;height:32px;display:grid;place-items:center;border-radius:10px;background:rgba(103,215,186,.10);color:#9ee5d3}.cgIcon svg{width:17px;height:17px}.cgTitle strong{display:block;font-size:10px}.cgTitle span{display:block;font-size:8px;color:var(--muted);margin-top:2px}
    .cgBadge{font-size:7px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#9ee5d3;border:1px solid rgba(103,215,186,.22);background:rgba(103,215,186,.06);padding:5px 7px;border-radius:999px}
    .cgBody{padding:12px 13px}.cgIntro{font-size:8px;color:var(--muted);line-height:1.55;margin-bottom:10px}.cgIntro b{color:var(--text)}
    .cgActions{display:flex;gap:6px;flex-wrap:wrap}.cgBtn{border:1px solid var(--line);background:rgba(255,255,255,.035);color:#c6ceda;border-radius:9px;padding:7px 9px;font-size:8px;cursor:pointer}.cgBtn:hover{background:rgba(255,255,255,.06);color:#fff}.cgBtn.primary{background:rgba(103,215,186,.10);border-color:rgba(103,215,186,.25);color:#b7efdf}
    .cgImportWrap{display:none;margin-top:10px}.cgImportWrap.show{display:block}.cgImport{width:100%;min-height:145px;border:1px solid var(--line);background:#090d14;color:#bdc5d2;border-radius:11px;padding:10px;font-size:9px;line-height:1.5;resize:vertical;outline:0}.cgImport:focus{border-color:rgba(103,215,186,.38);box-shadow:0 0 0 3px rgba(103,215,186,.06)}
    .cgHelp{font-size:8px;color:var(--muted);line-height:1.45;margin-top:6px}.cgResult{display:none;margin-top:10px;border-top:1px solid var(--line);padding-top:10px}.cgResult.show{display:block}.cgIdentity{display:grid;grid-template-columns:1fr auto;gap:10px}.cgIdentity h5{font-size:11px;margin:0 0 3px}.cgIdentity p{font-size:8px;color:var(--muted);line-height:1.45;margin:0}.cgConfidence{padding:7px 8px;border-radius:10px;background:var(--panel3);border:1px solid var(--line);text-align:center;min-width:55px}.cgConfidence b{display:block;font-size:12px}.cgConfidence span{font-size:7px;color:var(--muted)}
    .cgPrompt{margin-top:8px;border:1px solid rgba(255,255,255,.06);background:#090d14;border-radius:10px;padding:9px}.cgPrompt b{display:block;color:#9ee5d3;font-size:7px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px}.cgPrompt pre{white-space:pre-wrap;margin:0;color:#b8c1ce;font:inherit;font-size:8px;line-height:1.5;max-height:115px;overflow:auto}
    .cgApplied{font-size:8px;color:#9ee5d3;margin-top:8px}.cgError{font-size:8px;color:#ffb4b4;margin-top:7px;display:none}.cgError.show{display:block}
    @media(max-width:720px){.cgIdentity{grid-template-columns:1fr}}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  function toast(msg,type='success'){
    const wrap=$('toastWrap');
    if(!wrap){console.log(msg);return;}
    const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=msg;wrap.appendChild(el);
    setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),180)},2200);
  }
  const safeText=v=>String(v??'').trim();
  const escapeHtml=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function productHint(surface){
    if(surface==='showcase')return safeText($('showcaseProductName')?.value);
    return [safeText($('productName')?.value),safeText($('productCategory')?.value),safeText($('productBenefits')?.value)].filter(Boolean).join(' | ');
  }

  function researchPrompt(surface){
    const hint=productHint(surface);
    return `Analyze the product image attached to this message as a product-research and CGI asset specialist.\n\nGOAL\n1. Inspect the image carefully and identify every visible product detail: brand, model/product name, variant, packaging, labels, geometry, proportions, materials, colors, finish, components, hardware and distinctive features.\n2. Search the public internet for the exact product. Prefer the official brand/manufacturer site first, then reputable retailer/product pages. Cross-check visible packaging/details against web results.\n3. Do NOT guess an exact match. If uncertain, lower confidence and clearly mark the match as likely/generic/unknown. Never invent label text, dimensions, ingredients, specifications, features or branding.\n4. Create a highly detailed prompt that recreates the SAME physical product as a photorealistic 3D/CGI product asset for commercial image/video generation. The asset must preserve the reference product exactly.\n5. Create a separate strict PRODUCT LOCK prompt that I can append to every image/video prompt to prevent geometry, packaging, color, logo, label, component or scale drift.\n\n${hint?`USER HINT (may be incomplete): ${hint}\n\n`:''}WEB RESEARCH RULES\n- Use web search for the exact product whenever possible.\n- Prefer official product pages.\n- Include source URLs you actually used.\n- Distinguish verified web facts from visual observations.\n- If the product cannot be identified exactly, the 3D prompt must rely only on visible details and explicitly avoid invented unseen details.\n\nRETURN FORMAT\nReturn ONLY one valid JSON object. No markdown fences and no text before or after it. Required keys: identified, match_status, confidence, brand, product_name, variant, category, research_summary, key_benefits, visual_observations, verified_facts, sources, three_d_asset_prompt, product_lock_prompt, negative_constraints, warnings. Ensure all quotation marks inside string values are escaped so the result parses as strict JSON.\n\nFor three_d_asset_prompt, write a production-ready photorealistic 3D CGI recreation prompt based only on supported facts. For product_lock_prompt, preserve the same exact physical product in every frame with no redesign, recolor, logo drift, label drift, extra parts, missing parts or morphing.`;
  }

  async function copy(text,msg='Copied to clipboard'){
    try{await navigator.clipboard.writeText(text);toast(msg)}
    catch{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast(msg)}
  }

  function parseImport(raw){
    let text=String(raw||'').trim();
    if(!text)throw new Error('Paste the ChatGPT JSON result first.');
    text=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
    const first=text.indexOf('{'),last=text.lastIndexOf('}');
    if(first<0||last<first)throw new Error('No JSON object was found.');
    const obj=JSON.parse(text.slice(first,last+1));
    if(!obj||typeof obj!=='object')throw new Error('The imported result is not a valid object.');
    if(!safeText(obj.three_d_asset_prompt)||!safeText(obj.product_lock_prompt))throw new Error('The JSON is missing the 3D asset prompt or product lock prompt.');
    return obj;
  }

  function lockBlock(obj){
    const negatives=Array.isArray(obj.negative_constraints)?obj.negative_constraints.filter(Boolean).join('; '):'';
    return `${LOCK_START}\n3D PRODUCT ASSET GUIDE: ${safeText(obj.three_d_asset_prompt)}\nSTRICT PRODUCT LOCK: ${safeText(obj.product_lock_prompt)}${negatives?`\nNEGATIVE PRODUCT CONSTRAINTS: ${negatives}`:''}\n${LOCK_END}`;
  }
  function replaceLockInRules(obj){
    const rules=$('rules');if(!rules)return;
    let base=rules.value||'';
    base=base.replace(/\n?\[CHATGPT PRODUCT LOCK START\][\s\S]*?\[CHATGPT PRODUCT LOCK END\]/g,'').trim();
    rules.value=[base,lockBlock(obj)].filter(Boolean).join('\n\n');
  }
  function applyAnalysis(obj){
    analysis=obj;window.__chatgptProductAnalysis=obj;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(obj))}catch{}
    replaceLockInRules(obj);
    const full=[obj.brand,obj.product_name,obj.variant].map(safeText).filter(Boolean).join(' ');
    if($('productName')&&full)$('productName').value=full;
    if($('productCategory')&&safeText(obj.category))$('productCategory').value=obj.category;
    if($('productBenefits')&&Array.isArray(obj.key_benefits)&&obj.key_benefits.length)$('productBenefits').value=obj.key_benefits.join(', ');
    if($('showcaseProductName')&&full)$('showcaseProductName').value=full;
    renderAllCards();
    scheduleStudioRelock();
    toast('ChatGPT product lock imported');
  }
  function clearAnalysis(){
    analysis=null;window.__chatgptProductAnalysis=null;localStorage.removeItem(STORAGE_KEY);
    const rules=$('rules');if(rules)rules.value=rules.value.replace(/\n?\[CHATGPT PRODUCT LOCK START\][\s\S]*?\[CHATGPT PRODUCT LOCK END\]/g,'').trim();
    renderAllCards();toast('Imported product lock cleared');
  }

  function cardMarkup(surface){return `
    <div class="cgCard" data-cg-card="${surface}">
      <div class="cgHead"><div class="cgTitle"><div class="cgIcon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 5h14v11H9l-4 3V5Z"/><path d="M9 9h6M9 12h4"/></svg></div><div><strong>ChatGPT Mode · no API key</strong><span>Research in this chat, then import the product lock</span></div></div><span class="cgBadge">Manual handoff</span></div>
      <div class="cgBody">
        <div class="cgIntro"><b>1.</b> Upload the product here. <b>2.</b> Click Prepare for ChatGPT and paste the copied instruction into this chat with the same product image. <b>3.</b> Paste my JSON result back below.</div>
        <div class="cgActions"><button type="button" class="cgBtn primary" data-cg-action="prepare">Prepare for ChatGPT</button><button type="button" class="cgBtn" data-cg-action="toggle">Import ChatGPT result</button><button type="button" class="cgBtn" data-cg-action="clear">Clear imported lock</button></div>
        <div class="cgImportWrap"><textarea class="cgImport" placeholder="Paste the JSON result from ChatGPT here..."></textarea><div class="cgActions" style="margin-top:7px"><button type="button" class="cgBtn primary" data-cg-action="import">Import + apply product lock</button></div><div class="cgHelp">Imported product identity is reused in Product and Studio Reel prompts.</div><div class="cgError"></div></div>
        <div class="cgResult"></div>
      </div>
    </div>`}

  function insertCards(){
    const product=$('productMode');
    if(product&&!product.querySelector('[data-cg-card="product"]'))product.insertAdjacentHTML('beforeend',cardMarkup('product'));
    const showcase=$('showcaseMode');
    if(showcase&&!showcase.querySelector('[data-cg-card="showcase"]'))showcase.insertAdjacentHTML('beforeend',cardMarkup('showcase'));
    bindCards();renderAllCards();
  }
  function bindCards(){
    qa('[data-cg-card]').forEach(card=>{
      if(card.dataset.bound)return;card.dataset.bound='1';
      const surface=card.dataset.cgCard;
      card.addEventListener('click',e=>{
        const btn=e.target.closest('[data-cg-action]');if(!btn)return;
        const action=btn.dataset.cgAction,wrap=card.querySelector('.cgImportWrap'),err=card.querySelector('.cgError');
        if(action==='prepare')copy(researchPrompt(surface),'ChatGPT instruction copied');
        if(action==='toggle')wrap.classList.toggle('show');
        if(action==='clear')clearAnalysis();
        if(action==='import'){
          try{err.classList.remove('show');applyAnalysis(parseImport(card.querySelector('.cgImport').value));wrap.classList.remove('show')}
          catch(ex){err.textContent=ex.message||'Could not import that result.';err.classList.add('show')}
        }
      });
    });
  }
  function renderAllCards(){qa('[data-cg-card]').forEach(renderCard)}
  function renderCard(card){
    const out=card.querySelector('.cgResult');if(!out)return;
    if(!analysis){out.classList.remove('show');out.innerHTML='';return;}
    const full=[analysis.brand,analysis.product_name,analysis.variant].map(safeText).filter(Boolean).join(' ')||'Imported product';
    const confidence=Number.isFinite(Number(analysis.confidence))?Math.max(0,Math.min(100,Number(analysis.confidence))):0;
    out.innerHTML=`<div class="cgIdentity"><div><h5>${escapeHtml(full)}</h5><p>${escapeHtml(analysis.category||analysis.research_summary||'Product analysis imported')}</p></div><div class="cgConfidence"><b>${confidence}%</b><span>${escapeHtml(analysis.match_status||'match')}</span></div></div><div class="cgPrompt"><b>3D asset prompt</b><pre>${escapeHtml(analysis.three_d_asset_prompt)}</pre></div><div class="cgPrompt"><b>Strict product lock</b><pre>${escapeHtml(analysis.product_lock_prompt)}</pre></div><div class="cgApplied">✓ Imported lock is active for new storyboard generations.</div>`;
    out.classList.add('show');
  }

  function studioActive(){return !!$('showcaseMode')?.classList.contains('active')}
  function studioSuffix(){
    if(!analysis)return'';
    const negatives=Array.isArray(analysis.negative_constraints)&&analysis.negative_constraints.length?`\n\nNEGATIVE PRODUCT CONSTRAINTS:\n${analysis.negative_constraints.filter(Boolean).join('; ')}`:'';
    return `\n\n${STUDIO_MARKER}\n${safeText(analysis.three_d_asset_prompt)}\n\nCHATGPT STRICT PRODUCT LOCK:\n${safeText(analysis.product_lock_prompt)}${negatives}`;
  }
  function relockStudioPromptBoxes(){
    if(!analysis||!studioActive())return;
    const suffix=studioSuffix();if(!suffix)return;
    qa('#resultsArea .promptBox').forEach(box=>{
      const current=box.textContent||'';
      if(current.includes(STUDIO_MARKER))return;
      box.textContent=current+suffix;
    });
  }
  let relockTimer=0;
  function scheduleStudioRelock(delay=40){
    clearTimeout(relockTimer);
    relockTimer=setTimeout(relockStudioPromptBoxes,delay);
  }

  const results=$('resultsArea');
  if(results){
    const observer=new MutationObserver(()=>{if(analysis&&studioActive())scheduleStudioRelock(25)});
    observer.observe(results,{childList:true,subtree:true});
  }

  document.addEventListener('click',e=>{
    const tab=e.target.closest('.promptTab');
    if(tab&&analysis&&studioActive())scheduleStudioRelock(0);
  });
  const studioInput=$('showcaseImageFile');
  if(studioInput)studioInput.addEventListener('change',()=>{if(analysis)scheduleStudioRelock(260)});
  const generateBtn=$('generateBtn');
  if(generateBtn)generateBtn.addEventListener('click',()=>{if(analysis&&studioActive())scheduleStudioRelock(220)});

  async function readCardPrompt(card,index){
    const tabs=qa('.promptTab',card),box=card.querySelector('.promptBox');
    if(!box)return'';
    if(tabs[index])tabs[index].click();
    await new Promise(r=>setTimeout(r,0));
    relockStudioPromptBoxes();
    return box.textContent||'';
  }

  document.addEventListener('click',async e=>{
    if(!analysis||!studioActive())return;
    const btn=e.target.closest('button');if(!btn)return;
    if(btn.id==='copyAllBtn'){
      e.preventDefault();e.stopImmediatePropagation();
      const parts=[];
      for(const card of qa('#resultsArea .shotCard')){
        const title=card.querySelector('.shotTop strong')?.textContent||'Shot';
        const image=await readCardPrompt(card,0),video=await readCardPrompt(card,1);await readCardPrompt(card,0);
        parts.push(`${title}\n\nIMAGE PROMPT\n${image}\n\nVIDEO PROMPT\n${video}`);
      }
      copy(parts.join('\n\n==============================\n\n'));
    }
    if(btn.closest('.promptActions')&&btn.textContent.trim()==='Copy both'){
      e.preventDefault();e.stopImmediatePropagation();
      const card=btn.closest('.shotCard');
      const image=await readCardPrompt(card,0),video=await readCardPrompt(card,1);await readCardPrompt(card,0);
      copy(`IMAGE PROMPT\n${image}\n\nVIDEO PROMPT\n${video}`);
    }
    if(btn.id==='exportBtn'){
      e.preventDefault();e.stopImmediatePropagation();
      const shots=[];let i=0;
      for(const card of qa('#resultsArea .shotCard')){
        i++;const title=card.querySelector('.shotTop strong')?.textContent||`Shot ${i}`;
        const imagePrompt=await readCardPrompt(card,0),videoPrompt=await readCardPrompt(card,1);await readCardPrompt(card,0);
        shots.push({shot:i,title,imagePrompt,videoPrompt});
      }
      const blob=new Blob([JSON.stringify({project:$('showcaseProductName')?.value||'Studio Product Reel',chatgpt_product_analysis:analysis,shots},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='studio-product-reel-chatgpt-lock.json';a.click();URL.revokeObjectURL(url);toast('Studio Reel JSON exported with ChatGPT lock');
    }
  },true);

  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(saved&&saved.product_lock_prompt&&saved.three_d_asset_prompt){analysis=saved;window.__chatgptProductAnalysis=saved;replaceLockInRules(saved)}
  }catch{}

  let tries=0;
  const timer=setInterval(()=>{tries++;insertCards();if($('showcaseMode')||tries>40)clearInterval(timer)},100);
  insertCards();
})();
