(()=>{
  if(window.__productResearchInit)return;
  window.__productResearchInit=true;

  const $=id=>document.getElementById(id);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  let activeAnalysis=null;
  let lastFile=null;
  let activeSurface='product';
  let analysisRunId=0;

  const css=`
    .aiResearchCard{margin:14px 0 2px;border:1px solid rgba(139,124,255,.28);background:linear-gradient(145deg,rgba(139,124,255,.085),rgba(103,215,186,.035));border-radius:16px;overflow:hidden}
    .aiResearchHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border-bottom:1px solid var(--line)}
    .aiResearchTitle{display:flex;align-items:center;gap:10px;min-width:0}.aiOrb{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:rgba(139,124,255,.13);color:var(--accent2);flex:0 0 auto}.aiOrb svg{width:18px;height:18px}.aiResearchTitle strong{display:block;font-size:11px}.aiResearchTitle span{display:block;margin-top:3px;color:var(--muted);font-size:8px}
    .aiStateBadge{font-size:8px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;padding:5px 7px;border-radius:999px;color:var(--muted);border:1px solid var(--line);white-space:nowrap}.aiStateBadge.live{color:#9ee5d3;border-color:rgba(103,215,186,.25);background:rgba(103,215,186,.07)}.aiStateBadge.busy{color:#d8d1ff;border-color:rgba(139,124,255,.32);background:rgba(139,124,255,.08)}.aiStateBadge.error{color:#ffc0c0;border-color:rgba(255,110,110,.28);background:rgba(255,110,110,.06)}
    .aiResearchBody{padding:13px 14px}.aiProgress{display:none;gap:7px;margin-bottom:12px}.aiProgress.show{display:grid;grid-template-columns:repeat(3,1fr)}.aiProgressStep{padding:8px;border-radius:10px;background:var(--panel3);border:1px solid var(--line);font-size:8px;color:var(--muted);text-align:center}.aiProgressStep.active{color:#d8d1ff;border-color:rgba(139,124,255,.4);background:rgba(139,124,255,.08)}.aiProgressStep.done{color:#9ee5d3;border-color:rgba(103,215,186,.22)}
    .aiEmpty{font-size:9px;line-height:1.55;color:var(--muted)}.aiEmpty b{color:var(--text)}
    .aiResult{display:none}.aiResult.show{display:block}.aiIdentity{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start;margin-bottom:10px}.aiIdentity h4{font-size:12px;margin:0 0 4px}.aiIdentity p{margin:0;color:var(--muted);font-size:8px;line-height:1.45}.aiConfidence{min-width:58px;text-align:center;padding:8px;border-radius:11px;background:var(--panel3);border:1px solid var(--line)}.aiConfidence strong{display:block;font-size:13px}.aiConfidence span{font-size:7px;color:var(--muted)}
    .aiFacts{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0}.aiFact{padding:8px;border-radius:10px;background:var(--panel3);border:1px solid var(--line)}.aiFact b{display:block;font-size:8px;color:#c9d0dc;margin-bottom:3px}.aiFact span{display:block;font-size:8px;color:var(--muted);line-height:1.4}
    .aiPromptBox{margin-top:10px;padding:10px;border-radius:11px;background:#090d14;border:1px solid rgba(255,255,255,.06)}.aiPromptBox .label{font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--accent2);margin-bottom:6px}.aiPromptText{max-height:150px;overflow:auto;white-space:pre-wrap;font-size:8px;line-height:1.55;color:#b9c1ce}
    .aiSources{display:flex;gap:5px;flex-wrap:wrap;margin-top:9px}.aiSource{font-size:8px;color:#aeb7c6;border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:999px;padding:5px 7px;text-decoration:none;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aiSource:hover{color:white;border-color:rgba(139,124,255,.35)}
    .aiActions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.aiMiniBtn{border:1px solid var(--line);background:rgba(255,255,255,.035);color:var(--muted);border-radius:9px;padding:7px 9px;font-size:8px;cursor:pointer}.aiMiniBtn:hover{color:var(--text);background:rgba(255,255,255,.06)}.aiMiniBtn.primary{background:rgba(139,124,255,.12);color:#ded8ff;border-color:rgba(139,124,255,.32)}
    .aiConfig{margin-top:10px;border-top:1px solid var(--line);padding-top:10px}.aiConfig summary{cursor:pointer;color:var(--muted);font-size:8px}.aiConfigGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}.aiConfig .input{font-size:9px;padding:9px}.aiConfig label{font-size:8px!important}.aiConnectionHint{font-size:8px;color:var(--muted);line-height:1.45;margin-top:7px}.aiConnectionHint code{color:#d7d0ff}
    .aiWarnings{margin-top:8px;color:#d9bd83;font-size:8px;line-height:1.45}.aiLockApplied{margin-top:7px;font-size:8px;color:#9ee5d3}
    @media(max-width:720px){.aiFacts,.aiConfigGrid{grid-template-columns:1fr}.aiProgress.show{grid-template-columns:1fr}}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  function endpoint(){
    const saved=localStorage.getItem('storyboard-ai-endpoint')||'';
    if(saved)return saved.replace(/\/$/,'');
    if(!location.hostname.endsWith('github.io'))return `${location.origin}/api/analyze-product`;
    return '';
  }
  function accessToken(){return sessionStorage.getItem('storyboard-ai-access-token')||''}
  function cardHtml(surface){return `
    <div class="aiResearchCard" data-ai-surface="${surface}">
      <div class="aiResearchHead">
        <div class="aiResearchTitle"><div class="aiOrb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z"/></svg></div><div><strong>AI Product Research + 3D Lock</strong><span>Visual analysis · exact-product web research · reusable 3D asset prompt</span></div></div>
        <span class="aiStateBadge" data-ai-badge>Not analyzed</span>
      </div>
      <div class="aiResearchBody">
        <div class="aiProgress" data-ai-progress><div class="aiProgressStep" data-step="vision">1 · Analyze image</div><div class="aiProgressStep" data-step="search">2 · Research product</div><div class="aiProgressStep" data-step="lock">3 · Build 3D lock</div></div>
        <div class="aiEmpty" data-ai-empty><b>Automatic workflow:</b> after a product image is uploaded, the connected AI identifies visible branding and product geometry, searches the web for the exact product, verifies details, then generates a strict 3D Product Asset Lock for your storyboard prompts.</div>
        <div class="aiResult" data-ai-result>
          <div class="aiIdentity"><div><h4 data-ai-name>Product</h4><p data-ai-summary></p></div><div class="aiConfidence"><strong data-ai-confidence>—</strong><span>match confidence</span></div></div>
          <div class="aiFacts"><div class="aiFact"><b>Match</b><span data-ai-match>—</span></div><div class="aiFact"><b>Category / variant</b><span data-ai-category>—</span></div><div class="aiFact"><b>Observed build</b><span data-ai-build>—</span></div><div class="aiFact"><b>Verified details</b><span data-ai-verified>—</span></div></div>
          <div class="aiPromptBox"><div class="label">3D product recreation prompt</div><div class="aiPromptText" data-ai-3d></div></div>
          <div class="aiPromptBox"><div class="label">Strict product lock</div><div class="aiPromptText" data-ai-lock></div></div>
          <div class="aiWarnings" data-ai-warnings></div><div class="aiSources" data-ai-sources></div>
          <div class="aiActions"><button type="button" class="aiMiniBtn primary" data-ai-copy3d>Copy 3D prompt</button><button type="button" class="aiMiniBtn" data-ai-copylock>Copy product lock</button><button type="button" class="aiMiniBtn" data-ai-apply>Apply lock to storyboard</button><button type="button" class="aiMiniBtn" data-ai-research>Research again</button></div>
          <div class="aiLockApplied" data-ai-applied></div>
        </div>
        <details class="aiConfig"><summary>AI research connection</summary><div class="aiConfigGrid"><div class="field"><label>Backend URL</label><input class="input" data-ai-endpoint placeholder="https://your-project.vercel.app"></div><div class="field"><label>Access token (optional)</label><input class="input" data-ai-token type="password" placeholder="Session only"></div></div><div class="aiActions"><button type="button" class="aiMiniBtn" data-ai-saveconnection>Save connection</button></div><div class="aiConnectionHint">GitHub Pages cannot safely hold an OpenAI API key. Connect this to the private <code>storyboard-ai-api</code> backend; the OpenAI key stays only in Vercel environment variables.</div></details>
      </div>
    </div>`}

  function injectCard(container,surface,anchor){
    if(!container||container.querySelector(`.aiResearchCard[data-ai-surface="${surface}"]`))return;
    const wrap=document.createElement('div');wrap.innerHTML=cardHtml(surface);const card=wrap.firstElementChild;
    if(anchor&&anchor.parentNode)anchor.insertAdjacentElement('afterend',card);else container.appendChild(card);
    setupCard(card,surface);
  }

  injectCard($('productMode'),'product',$('productPreviewWrap'));
  if($('showcaseMode'))injectCard($('showcaseMode'),'showcase',$('showcasePreviewWrap'));

  function setupCard(card,surface){
    const endpointInput=card.querySelector('[data-ai-endpoint]'),tokenInput=card.querySelector('[data-ai-token]');
    endpointInput.value=endpoint();tokenInput.value=accessToken();
    card.querySelector('[data-ai-saveconnection]').addEventListener('click',()=>{
      const url=endpointInput.value.trim().replace(/\/$/,'');
      if(url)localStorage.setItem('storyboard-ai-endpoint',url);else localStorage.removeItem('storyboard-ai-endpoint');
      if(tokenInput.value)sessionStorage.setItem('storyboard-ai-access-token',tokenInput.value);else sessionStorage.removeItem('storyboard-ai-access-token');
      updateConnectionState(card);notify(url?'AI research connection saved':'Backend URL removed',url?'success':'error');
      if(url&&lastFile&&surface===activeSurface)analyze(lastFile,surface);
    });
    card.querySelector('[data-ai-copy3d]').addEventListener('click',()=>activeAnalysis&&copy(activeAnalysis.three_d_asset_prompt));
    card.querySelector('[data-ai-copylock]').addEventListener('click',()=>activeAnalysis&&copy(activeAnalysis.product_lock_prompt));
    card.querySelector('[data-ai-apply]').addEventListener('click',()=>{if(activeAnalysis)applyAnalysis(activeAnalysis,surface,true)});
    card.querySelector('[data-ai-research]').addEventListener('click',()=>{if(lastFile)analyze(lastFile,surface);else notify('Upload a product image first','error')});
    updateConnectionState(card);
  }

  function updateConnectionState(card){
    const badge=card.querySelector('[data-ai-badge]');
    if(endpoint()){if(!activeAnalysis){badge.textContent='AI connected';badge.className='aiStateBadge live'}}
    else{badge.textContent='Backend needed';badge.className='aiStateBadge'}
  }
  function notify(message,type='success'){
    if($('toastWrap')){const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;$('toastWrap').appendChild(el);setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),200)},2100)}
    else console.log(message);
  }
  async function copy(text){if(!text)return;try{await navigator.clipboard.writeText(text);notify('Copied to clipboard')}catch{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();notify('Copied to clipboard')}}

  function bindUpload(inputId,surface){
    const input=$(inputId);if(!input)return;
    input.addEventListener('change',()=>{const file=input.files&&input.files[0];if(!file)return;lastFile=file;activeSurface=surface;setTimeout(()=>analyze(file,surface),120)});
  }
  bindUpload('productImageFile','product');
  bindUpload('showcaseImageFile','showcase');

  async function compressImage(file){
    const dataUrl=await readFile(file);
    return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);resolve(canvas.toDataURL('image/jpeg',.88))};img.onerror=reject;img.src=dataUrl})
  }
  function readFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=e=>resolve(e.target.result);r.onerror=reject;r.readAsDataURL(file)})}

  function getCard(surface){return document.querySelector(`.aiResearchCard[data-ai-surface="${surface}"]`)}
  function setProgress(card,stage){
    const progress=card.querySelector('[data-ai-progress]');progress.classList.add('show');
    const order=['vision','search','lock'],idx=order.indexOf(stage);
    order.forEach((name,i)=>{const el=card.querySelector(`[data-step="${name}"]`);el.className='aiProgressStep'+(i<idx?' done':i===idx?' active':'')});
  }
  function setBadge(card,text,state){const badge=card.querySelector('[data-ai-badge]');badge.textContent=text;badge.className='aiStateBadge'+(state?` ${state}`:'')}

  async function analyze(file,surface){
    const card=getCard(surface);if(!card)return;
    const api=endpoint();
    if(!api){setBadge(card,'Backend needed','');card.querySelector('.aiConfig').open=true;notify('Connect the AI research backend first','error');return;}
    const run=++analysisRunId;activeSurface=surface;lastFile=file;card.querySelector('[data-ai-empty]').style.display='none';card.querySelector('[data-ai-result]').classList.remove('show');setBadge(card,'Analyzing','busy');setProgress(card,'vision');
    try{
      const imageDataUrl=await compressImage(file);if(run!==analysisRunId)return;
      setProgress(card,'search');
      const hintName=surface==='showcase'?($('showcaseProductName')?.value||''):($('productName')?.value||'');
      const hintCategory=$('productCategory')?.value||'';
      const headers={'Content-Type':'application/json'};if(accessToken())headers['x-storyboard-token']=accessToken();
      const response=await fetch(`${api.replace(/\/$/,'')}/api/analyze-product`,{method:'POST',headers,body:JSON.stringify({imageDataUrl,hintName,hintCategory})});
      const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||`Request failed (${response.status})`);if(run!==analysisRunId)return;
      setProgress(card,'lock');activeAnalysis=body.analysis;window.__productAIAnalysis=activeAnalysis;window.__product3DLockPrompt=activeAnalysis.product_lock_prompt||'';renderAnalysis(card,activeAnalysis);applyAnalysis(activeAnalysis,surface,false);setBadge(card,'Research complete','live');qa('.aiProgressStep',card).forEach(x=>x.classList.add('done'));notify('Product analyzed and 3D lock created');
    }catch(err){console.error(err);setBadge(card,'Analysis failed','error');card.querySelector('[data-ai-empty]').style.display='block';card.querySelector('[data-ai-empty]').innerHTML=`<b>AI research failed.</b> ${escapeHtml(err.message)} Check the backend URL, access token, and Vercel environment variables.`;notify('Product research failed','error')}
  }

  function renderAnalysis(card,a){
    card.querySelector('[data-ai-result]').classList.add('show');
    const full=[a.brand,a.product_name,a.variant].filter(Boolean).join(' ');card.querySelector('[data-ai-name]').textContent=full||'Product identified';card.querySelector('[data-ai-summary]').textContent=a.research_summary||'';
    card.querySelector('[data-ai-confidence]').textContent=`${Math.round(Number(a.confidence)||0)}%`;
    card.querySelector('[data-ai-match]').textContent=(a.match_status||'unknown').replace(/_/g,' ');
    card.querySelector('[data-ai-category]').textContent=[a.category,a.variant].filter(Boolean).join(' · ')||'Not verified';
    const v=a.visual_observations||{};card.querySelector('[data-ai-build]').textContent=[v.primary_shape,v.materials,v.finish].filter(Boolean).join(' · ')||'See 3D lock';
    card.querySelector('[data-ai-verified]').textContent=(a.verified_facts||[]).slice(0,2).map(x=>x.fact).join(' · ')||'Visual analysis only';
    card.querySelector('[data-ai-3d]').textContent=a.three_d_asset_prompt||'';card.querySelector('[data-ai-lock]').textContent=a.product_lock_prompt||'';
    card.querySelector('[data-ai-warnings]').textContent=(a.warnings||[]).join(' · ');
    const sources=card.querySelector('[data-ai-sources]');sources.innerHTML='';(a.sources||[]).slice(0,5).forEach(s=>{if(!s.url)return;const link=document.createElement('a');link.className='aiSource';link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=s.title||safeHost(s.url);sources.appendChild(link)});
  }
  function safeHost(url){try{return new URL(url).hostname.replace(/^www\./,'')}catch{return'Web source'}}
  function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

  function applyAnalysis(a,surface,manual){
    const name=[a.brand,a.product_name,a.variant].filter(Boolean).join(' ').trim();
    if(surface==='product'){
      if($('productName')&&name)$('productName').value=name;if($('productCategory')&&a.category)$('productCategory').value=a.category;
      if($('productBenefits')&&Array.isArray(a.key_benefits)&&a.key_benefits.length)$('productBenefits').value=a.key_benefits.join(', ');
    }else if(surface==='showcase'&&$('showcaseProductName')&&name){$('showcaseProductName').value=name}
    const lockBlock=`3D PRODUCT ASSET LOCK — AUTO-RESEARCHED\n${a.product_lock_prompt||''}\n\n3D PRODUCT RECREATION PROMPT\n${a.three_d_asset_prompt||''}\n\nNEGATIVE PRODUCT CONSTRAINTS\n${(a.negative_constraints||[]).join('; ')}`;
    if($('rules')){
      const marker='3D PRODUCT ASSET LOCK — AUTO-RESEARCHED';let existing=$('rules').value||'';const at=existing.indexOf(marker);if(at>=0)existing=existing.slice(0,at).trim();$('rules').value=[existing,lockBlock].filter(Boolean).join('\n\n');
    }
    enhanceVisiblePrompts();
    const card=getCard(surface);if(card){card.querySelector('[data-ai-applied]').textContent='3D product lock is active and will be appended to storyboard prompts.'}
    if(manual)notify('3D product lock applied to storyboard');
  }

  function lockSuffix(){if(!activeAnalysis)return'';return `\n\n3D PRODUCT ASSET LOCK — VERIFIED / VISUALLY GROUNDED\n${activeAnalysis.product_lock_prompt||''}\n\n3D RECREATION REFERENCE\n${activeAnalysis.three_d_asset_prompt||''}\n\nNEGATIVE CONSTRAINTS\n${(activeAnalysis.negative_constraints||[]).join('; ')}`}
  function enhanceVisiblePrompts(){
    if(!activeAnalysis)return;const suffix=lockSuffix();qa('.promptBox').forEach(box=>{if(!box.textContent.includes('3D PRODUCT ASSET LOCK — VERIFIED / VISUALLY GROUNDED'))box.textContent=box.textContent+suffix})
  }
  const observer=new MutationObserver(()=>{if(activeAnalysis)requestAnimationFrame(enhanceVisiblePrompts)});if($('resultsArea'))observer.observe($('resultsArea'),{subtree:true,childList:true,characterData:true});
  if($('resultsArea'))$('resultsArea').addEventListener('click',()=>{if(activeAnalysis)setTimeout(enhanceVisiblePrompts,0)},true);

  const modeObserver=new MutationObserver(()=>{if($('showcaseMode')&&!getCard('showcase')){injectCard($('showcaseMode'),'showcase',$('showcasePreviewWrap'));bindUpload('showcaseImageFile','showcase')}});modeObserver.observe(document.body,{subtree:true,childList:true});
})();
