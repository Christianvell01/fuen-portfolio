(()=>{
  if(window.__studioProductReelInit)return;
  window.__studioProductReelInit=true;

  const $=id=>document.getElementById(id);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  let showcaseImageSource='';
  let lastShowcase=null;
  let background='boyish';
  let productLock='strict';
  let sequence='reference';

  const css=`
    .tabs.showcase-enabled{grid-template-columns:repeat(4,1fr)}
    .tab[data-mode="showcase"]{position:relative}
    .tab[data-mode="showcase"]::after{content:'NEW';font-size:7px;letter-spacing:.08em;margin-left:5px;color:var(--accent2);vertical-align:top}
    .showcaseHero{border:1px solid rgba(139,124,255,.25);background:linear-gradient(135deg,rgba(139,124,255,.09),rgba(103,215,186,.035));border-radius:16px;padding:14px;margin-bottom:14px}
    .showcaseHero .tag{display:inline-flex;padding:5px 8px;border-radius:999px;background:rgba(139,124,255,.12);color:var(--accent2);font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
    .showcaseHero h4{margin:0 0 5px;font-size:13px}.showcaseHero p{margin:0;color:var(--muted);font-size:10px;line-height:1.5}
    .showcaseDrop{border:1.5px dashed rgba(255,255,255,.14);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.022),rgba(139,124,255,.04));padding:18px;text-align:center;cursor:pointer;position:relative;transition:.18s;margin-bottom:13px}
    .showcaseDrop.drag{border-color:var(--accent);background:rgba(139,124,255,.09)}.showcaseDrop input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%}
    .showcaseDrop svg{width:23px;height:23px;color:var(--accent2);margin-bottom:8px}.showcaseDrop strong{display:block;font-size:12px}.showcaseDrop p{margin:5px 0 0;color:var(--muted);font-size:9px}
    .showcasePreview{display:none;border:1px solid var(--line);background:var(--panel3);border-radius:14px;padding:10px;grid-template-columns:76px 1fr auto;gap:11px;align-items:center;margin-bottom:14px}.showcasePreview.show{display:grid}.showcasePreview img{width:76px;height:76px;object-fit:contain;border-radius:10px;background:#fff}.showcasePreview strong{font-size:11px}.showcasePreview p{font-size:9px;color:var(--muted);margin:5px 0 0;line-height:1.4}
    .subLabel{font-size:10px;color:#c0c7d4;font-weight:700;margin:0 0 7px}.presetGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px}.presetBtn{border:1px solid var(--line);background:var(--panel3);border-radius:12px;padding:10px;text-align:left;cursor:pointer;min-height:62px}.presetBtn:hover,.presetBtn.active{border-color:rgba(139,124,255,.48);background:rgba(139,124,255,.07)}.presetBtn strong{display:block;font-size:10px;margin-bottom:4px}.presetBtn span{font-size:8px;color:var(--muted);line-height:1.35;display:block}.presetBtn.active strong{color:#d8d1ff}
    .segmented{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:14px}.segmentBtn{border:1px solid var(--line);background:var(--panel3);color:var(--muted);border-radius:10px;padding:8px 7px;cursor:pointer;font-size:9px;font-weight:700}.segmentBtn.active{background:rgba(139,124,255,.10);border-color:rgba(139,124,255,.48);color:var(--text)}
    .toggleRow{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px 11px;border:1px solid var(--line);border-radius:12px;background:var(--panel3);margin-bottom:10px}.toggleCopy strong{font-size:10px;display:block}.toggleCopy span{font-size:8px;color:var(--muted);display:block;margin-top:3px;line-height:1.4}.switch{position:relative;width:38px;height:22px;flex:0 0 auto}.switch input{opacity:0;width:0;height:0}.switch span{position:absolute;inset:0;background:#252b39;border-radius:999px;cursor:pointer;transition:.18s}.switch span::after{content:'';position:absolute;width:16px;height:16px;left:3px;top:3px;border-radius:50%;background:#8d95a5;transition:.18s}.switch input:checked+span{background:rgba(139,124,255,.45)}.switch input:checked+span::after{transform:translateX(16px);background:white}
    #showcaseCustomBgWrap{display:none}#showcaseCustomBgWrap.show{display:block}
    .showcaseReferenceNote{font-size:9px;line-height:1.5;color:var(--muted);padding:10px;border-left:2px solid rgba(139,124,255,.6);background:rgba(139,124,255,.04);border-radius:0 10px 10px 0;margin-top:4px}
    .showcaseSceneTag{display:inline-flex;font-size:8px;padding:4px 6px;border-radius:999px;background:rgba(103,215,186,.09);color:#9ee5d3;border:1px solid rgba(103,215,186,.18);margin-left:5px}
    .showcaseShotVisual{height:126px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--showcase-bg,linear-gradient(145deg,#161c29,#0e121b));border-bottom:1px solid var(--line)}.showcaseShotVisual::before{content:'';position:absolute;width:74%;height:74%;border-radius:50%;background:rgba(255,255,255,.86);box-shadow:0 0 0 3px var(--ring,rgba(92,145,255,.65)),0 0 24px var(--glow,rgba(72,117,255,.28));bottom:-18%;left:13%;filter:saturate(.9)}.showcaseShotVisual img{position:relative;z-index:2;width:72%;height:72%;object-fit:contain;border-radius:8px;filter:drop-shadow(0 10px 12px rgba(0,0,0,.35));transition:.2s}.showcaseShotVisual.angle img{transform:scale(.86) rotate(-2deg)}.showcaseShotVisual.close img{transform:scale(1.05)}.showcaseShotVisual.macro img{transform:scale(1.24)}.showcaseShotVisual.fx::after{content:'';position:absolute;z-index:3;inset:0;background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.44),transparent 55%);mix-blend-mode:screen}.showcaseShotVisual .shotNo{z-index:5}
    .showcaseProductLock{font-size:8px;color:#a9b1c0;line-height:1.4;margin-top:7px;padding-top:7px;border-top:1px solid var(--line)}
    @media(max-width:720px){.tabs.showcase-enabled{grid-template-columns:1fr 1fr}.presetGrid{grid-template-columns:1fr 1fr}.segmented{grid-template-columns:1fr}.showcasePreview{grid-template-columns:64px 1fr auto}.showcasePreview img{width:64px;height:64px}}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  const tabs=document.querySelector('.tabs');
  if(!tabs)return;
  tabs.classList.add('showcase-enabled');
  const showcaseTab=document.createElement('button');
  showcaseTab.className='tab';showcaseTab.dataset.mode='showcase';showcaseTab.textContent='Studio Reel';
  tabs.appendChild(showcaseTab);

  const productMode=$('productMode');
  const showcase=document.createElement('div');
  showcase.className='modeSection';showcase.id='showcaseMode';
  showcase.innerHTML=`
    <div class="showcaseHero">
      <span class="tag">Reference-style AI content</span>
      <h4>Studio Product Reel</h4>
      <p>A fixed-set product showcase based on your uploaded reference: same product, same background, repeatable hero angles, push-ins, detail crops and controlled light / haze effects.</p>
    </div>
    <div class="showcaseDrop" id="showcaseDropzone">
      <input id="showcaseImageFile" type="file" accept="image/*" aria-label="Upload showcase product image">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 14v5h14v-5"/></svg>
      <strong>Upload any product image</strong>
      <p>It will automatically build this reel’s shot sequence · PNG, JPG, WEBP</p>
    </div>
    <div class="showcasePreview" id="showcasePreviewWrap">
      <img id="showcasePreview" alt="Showcase product reference">
      <div><strong id="showcasePreviewName">Product reference</strong><p>Exact reference used for product-lock prompts across every shot.</p></div>
      <button class="tinyBtn" id="showcaseRemoveImage" type="button" title="Remove image">×</button>
    </div>
    <div class="field"><label for="showcaseProductName">Product / project name</label><input class="input" id="showcaseProductName" placeholder="e.g. X2 Shock Absorber Reel"></div>

    <p class="subLabel">Background family</p>
    <div class="presetGrid" id="showcaseBackgroundChoices">
      <button class="presetBtn active" type="button" data-bg="boyish"><strong>Boyish LED</strong><span>Dark charcoal set, cool blue LEDs, sporty / automotive props.</span></button>
      <button class="presetBtn" type="button" data-bg="girly"><strong>Girly Glow</strong><span>Blush / lilac set, pink glow, soft lifestyle or beauty props.</span></button>
      <button class="presetBtn" type="button" data-bg="neutral"><strong>Clean Neutral</strong><span>White / gray studio, soft diffused rim light, minimal props.</span></button>
      <button class="presetBtn" type="button" data-bg="luxury"><strong>Luxury Dark</strong><span>Deep black / espresso set, warm gold rim light, premium styling.</span></button>
      <button class="presetBtn" type="button" data-bg="custom"><strong>Custom</strong><span>Write your own locked set description.</span></button>
    </div>
    <div class="field" id="showcaseCustomBgWrap"><label for="showcaseCustomBg">Custom background</label><textarea class="textarea" id="showcaseCustomBg" placeholder="Describe one consistent set that should stay identical across every shot..."></textarea></div>

    <div class="grid2">
      <div class="field"><label for="showcaseSurface">Display surface</label><select class="select" id="showcaseSurface"><option value="plush">Round plush platform + LED ring</option><option value="pedestal">Matte round pedestal</option><option value="acrylic">Clear acrylic platform</option><option value="marble">Marble tabletop</option><option value="dark">Dark textured tabletop</option></select></div>
      <div class="field"><label for="showcaseFx">Transition / FX</label><select class="select" id="showcaseFx"><option value="haze">Soft haze + light sweep</option><option value="flash">White flash transition</option><option value="glow">Glow pulse only</option><option value="mixed">Mixed subtle FX</option><option value="none">No FX</option></select></div>
    </div>

    <p class="subLabel">Shot pattern</p>
    <div class="segmented" id="showcaseSequenceChoices">
      <button class="segmentBtn active" type="button" data-seq="reference">Reference shots</button>
      <button class="segmentBtn" type="button" data-seq="orbit">Hero orbit</button>
      <button class="segmentBtn" type="button" data-seq="macro">Macro focus</button>
    </div>
    <div class="grid2">
      <div class="field"><label for="showcaseShotCount">Number of shots</label><select class="select" id="showcaseShotCount"><option>4</option><option selected>6</option><option>8</option></select></div>
      <div class="field"><label for="showcaseDuration">Reel pace</label><select class="select" id="showcaseDuration"><option value="fast">Fast · 12–15 sec</option><option value="balanced" selected>Balanced · 15–20 sec</option><option value="slow">Premium slow · 20–30 sec</option></select></div>
    </div>

    <p class="subLabel">Product lock</p>
    <div class="segmented" id="showcaseLockChoices">
      <button class="segmentBtn active" type="button" data-lock="strict">Strict exact</button>
      <button class="segmentBtn" type="button" data-lock="balanced">Balanced</button>
      <button class="segmentBtn" type="button" data-lock="flexible">Flexible</button>
    </div>
    <div class="toggleRow"><div class="toggleCopy"><strong>Lock same background</strong><span>Keep set geometry, lighting, props and platform identical across all shots.</span></div><label class="switch"><input id="showcaseBackgroundLock" type="checkbox" checked><span></span></label></div>
    <div class="toggleRow"><div class="toggleCopy"><strong>Auto-build shots on upload</strong><span>Uploading a product image immediately creates the reference-style storyboard.</span></div><label class="switch"><input id="showcaseAutoGenerate" type="checkbox" checked><span></span></label></div>
    <div class="showcaseReferenceNote"><strong>Reference pattern:</strong> hero establishing → gentle push-in → three-quarter product focus → macro detail → controlled light / haze reveal → final hero return. Product and set remain visually locked.</div>
  `;
  productMode.insertAdjacentElement('afterend',showcase);

  function activateShowcase(){
    qa('.tab').forEach(b=>b.classList.toggle('active',b===showcaseTab));
    qa('.modeSection').forEach(s=>s.classList.remove('active'));
    showcase.classList.add('active');
    if($('modeLabel'))$('modeLabel').textContent='Studio Product Reel';
    if($('generateBtn'))$('generateBtn').textContent='Generate studio reel';
    if($('statusBox'))$('statusBox').innerHTML='<b>Studio Reel ready.</b> Upload a product image and the builder will create a fixed-set shot sequence with strict product continuity.';
  }
  showcaseTab.addEventListener('click',activateShowcase);
  qa('.tab').filter(b=>b!==showcaseTab).forEach(b=>b.addEventListener('click',()=>{if($('generateBtn'))$('generateBtn').textContent='Generate storyboard';}));

  qa('#showcaseBackgroundChoices .presetBtn').forEach(btn=>btn.addEventListener('click',()=>{
    background=btn.dataset.bg;
    qa('#showcaseBackgroundChoices .presetBtn').forEach(b=>b.classList.toggle('active',b===btn));
    $('showcaseCustomBgWrap').classList.toggle('show',background==='custom');
  }));
  qa('#showcaseSequenceChoices .segmentBtn').forEach(btn=>btn.addEventListener('click',()=>{sequence=btn.dataset.seq;qa('#showcaseSequenceChoices .segmentBtn').forEach(b=>b.classList.toggle('active',b===btn));}));
  qa('#showcaseLockChoices .segmentBtn').forEach(btn=>btn.addEventListener('click',()=>{productLock=btn.dataset.lock;qa('#showcaseLockChoices .segmentBtn').forEach(b=>b.classList.toggle('active',b===btn));}));

  const drop=$('showcaseDropzone'),file=$('showcaseImageFile');
  ['dragenter','dragover'].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.add('drag')}));
  ['dragleave','drop'].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.remove('drag')}));
  drop.addEventListener('drop',e=>{const f=e.dataTransfer.files&&e.dataTransfer.files[0];if(f)loadFile(f)});
  file.addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(f)loadFile(f)});
  $('showcaseRemoveImage').addEventListener('click',()=>{showcaseImageSource='';file.value='';$('showcasePreviewWrap').classList.remove('show');$('showcasePreview').src='';});

  function showToast(msg,type='success'){
    const wrap=$('toastWrap');if(!wrap)return;
    const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=msg;wrap.appendChild(el);setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),180)},2200);
  }
  function loadFile(f){
    if(!f.type.startsWith('image/')){showToast('Please choose an image file','error');return;}
    if(f.size>12*1024*1024){showToast('Image is too large (max 12 MB)','error');return;}
    const r=new FileReader();
    r.onload=e=>{
      showcaseImageSource=e.target.result;
      $('showcasePreview').src=showcaseImageSource;
      $('showcasePreviewName').textContent=f.name;
      $('showcasePreviewWrap').classList.add('show');
      if(!$('showcaseProductName').value.trim())$('showcaseProductName').value=f.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ');
      showToast('Product locked for Studio Reel');
      if($('showcaseAutoGenerate').checked)setTimeout(()=>generateShowcase(true),120);
    };
    r.readAsDataURL(f);
  }

  const bgPresets={
    boyish:{label:'Boyish LED',set:'the exact same dark charcoal studio set in every shot, with a centered round cream-white display surface, cool blue LED rim light around the platform, vertical cool-blue LED light bars on the back wall, and a few subtle sporty or automotive props fixed in the same positions',bg:'linear-gradient(145deg,#090c13,#161c2a)',ring:'#5f8dff',glow:'rgba(64,107,255,.34)'},
    girly:{label:'Girly Glow',set:'the exact same soft blush-pink and muted lilac studio set in every shot, with a centered cream display surface, soft pink-lilac LED rim light, vertical pastel LED bars, and small elegant beauty or lifestyle props fixed in the same positions',bg:'linear-gradient(145deg,#2a1826,#39243b)',ring:'#f68ad3',glow:'rgba(246,138,211,.30)'},
    neutral:{label:'Clean Neutral',set:'the exact same clean off-white and soft gray studio set in every shot, with a centered minimal display platform, diffused white rim lighting, soft shadows, and almost no decorative props',bg:'linear-gradient(145deg,#cfd2d7,#7f8792)',ring:'#f7f8fb',glow:'rgba(255,255,255,.25)'},
    luxury:{label:'Luxury Dark',set:'the exact same deep black and espresso luxury studio set in every shot, with a centered cream or dark premium platform, warm champagne-gold rim lighting, subtle premium decor, and controlled glossy highlights fixed in the same positions',bg:'linear-gradient(145deg,#0d0b0b,#29221d)',ring:'#deb875',glow:'rgba(222,184,117,.28)'},
    custom:{label:'Custom',set:'the exact same custom studio set in every shot',bg:'linear-gradient(145deg,#171b26,#10131b)',ring:'#8b7cff',glow:'rgba(139,124,255,.28)'}
  };
  const surfaces={plush:'a round soft plush / fuzzy display platform with a visible LED light ring around its edge',pedestal:'a clean matte round product pedestal',acrylic:'a clear acrylic display platform with controlled reflections',marble:'a refined marble tabletop display surface',dark:'a dark textured tabletop with subtle directional highlights'};
  const fxMap={haze:'a very subtle atmospheric haze and a controlled light sweep transition; haze must never cover, deform, recolor or obscure the product',flash:'a brief clean white flash transition between selected shots; the product itself remains perfectly unchanged',glow:'a subtle LED glow pulse in the environment only; no glow deformation on the product',mixed:'subtle haze, one soft light sweep and one brief flash transition, all limited to the environment and never changing the product',none:'no artificial transition effects; use only clean cuts and camera movement'};

  function exactLock(){
    if(productLock==='strict')return 'ABSOLUTE PRODUCT IDENTITY LOCK: treat the uploaded product image as the exact physical reference. Preserve every visible product and package exactly: geometry, silhouette, dimensions, proportions, component count, hardware, colors, materials, finish, logo placement, label placement, printed text layout, graphics, packaging shape and relative scale. Do not redesign, simplify, restyle, recolor, replace, invent parts, change branding, alter typography, warp labels, or mutate the product between shots. It must be the same physical product and packaging in every frame.';
    if(productLock==='balanced')return 'PRODUCT IDENTITY LOCK: strongly preserve the uploaded reference product’s silhouette, proportions, package design, colors, materials, labels and branding across every shot. Minor lighting reflections may change naturally, but the product design must not.';
    return 'PRODUCT CONSISTENCY: keep the same recognizable product, package, branding, dominant colors and core proportions across the sequence while allowing slightly more creative framing.';
  }
  function backgroundText(){
    const p=bgPresets[background]||bgPresets.boyish;
    const custom=background==='custom'&&$('showcaseCustomBg').value.trim()?$('showcaseCustomBg').value.trim():p.set;
    const lock=$('showcaseBackgroundLock').checked?'BACKGROUND LOCK: keep this set absolutely identical across every shot — same platform position, wall, LED placement, light color, decor, prop positions and overall room geography. Only camera framing, crop and controlled camera movement may change.':'Keep the same background style family and lighting palette, allowing only small set variations.';
    return `${custom}. ${lock}`;
  }
  function durations(){const pace=$('showcaseDuration').value;return pace==='fast'?['2s','2s','2s','2s','2s','3s','2s','2s']:pace==='slow'?['4s','4s','3s','4s','3s','4s','3s','4s']:['3s','3s','2s','3s','2s','3s','2s','3s']}
  function sequenceBank(){
    if(sequence==='orbit')return[
      ['Front Hero','wide-to-medium hero framing','very slow push-in','establish the complete product and packaging centered on the locked set','normal'],
      ['Three-quarter Left','three-quarter left angle','slow 10–15 degree orbit','show depth and product form without changing product placement','angle'],
      ['Three-quarter Right','three-quarter right angle','slow counter-orbit','show the opposite side while preserving the same set','angle'],
      ['Side Detail','tight side detail','micro slide','highlight construction, material or functional shape','close'],
      ['Macro Feature','macro close-up','slow macro push','highlight the most visually interesting product detail','macro'],
      ['Final Hero','clean centered hero','gentle pull-back then hold','return to a complete premium product view','normal'],
      ['Packaging Pair','product plus package composition','subtle lateral slide','show exact product-to-packaging relationship','close'],
      ['End Hold','centered final composition','locked camera','finish on the exact same product and set','normal']
    ];
    if(sequence==='macro')return[
      ['Hero Establishing','clean wide hero','slow push-in','establish product and packaging on the locked set','normal'],
      ['Brand / Label Detail','tight label detail','micro push','feature branding and printed package detail without changing text','close'],
      ['Material Detail','macro material detail','slow macro glide','show texture, finish, hardware or surface quality','macro'],
      ['Functional Detail','tight functional close-up','tiny lateral move','focus on a key functional component or construction detail','macro'],
      ['Packaging Detail','tight packaging crop','slow push','show the original package graphics and relative scale','close'],
      ['Hero Return','medium hero framing','gentle pull-back','return to the full exact product identity','normal'],
      ['Light Detail','close premium detail','small light sweep','use lighting to reveal material without altering color','close'],
      ['Final Frame','complete final hero','static hold','end with the product and package fully recognizable','normal']
    ];
    return[
      ['Hero Establishing','clean wide hero framing','very slow push-in','show the complete product and packaging together on the fixed circular display set','normal'],
      ['Closer Hero','medium product framing','gentle push-in','move closer while preserving the same placement and background','close'],
      ['Three-quarter Focus','three-quarter product angle','subtle lateral slide','create depth while keeping product and packaging exact','angle'],
      ['Macro Detail','tight macro crop','slow macro push','highlight the strongest visible product detail without changing geometry','macro'],
      ['FX Reveal','medium hero framing','short controlled push-in','add the selected atmospheric transition while the product remains physically unchanged','fx'],
      ['Final Hero Return','clean centered hero','slow pull-back then static hold','finish on the same complete product and packaging in the same set','normal'],
      ['Packaging + Product','medium pair composition','subtle side slide','feature the relationship between product and original package','close'],
      ['End Detail','tight final detail','micro push','finish with a premium detail then hold','macro']
    ];
  }

  function buildShowcase(){
    const count=Math.max(4,Math.min(8,Number($('showcaseShotCount').value)||6));
    const bank=sequenceBank().slice(0,count),durs=durations(),preset=bgPresets[background]||bgPresets.boyish;
    const productName=$('showcaseProductName').value.trim()||'the uploaded product';
    const ratio=$('ratio')?$('ratio').value:'9:16',style=$('style')?$('style').value:'Cinematic Realistic',model=$('model')?$('model').value:'Google Flow / Veo';
    const surface=surfaces[$('showcaseSurface').value]||surfaces.plush,fx=fxMap[$('showcaseFx').value]||fxMap.haze,lock=exactLock(),bg=backgroundText();
    const shots=bank.map((b,i)=>{
      const imagePrompt=`${ratio} ${style} commercial product storyboard frame optimized for ${model}. STUDIO PRODUCT REEL — Shot ${i+1}: ${b[0]}. Product: ${productName}. Framing: ${b[1]}. Scene objective: ${b[3]}. Display surface: ${surface}. Background: ${bg} ${lock} Use the uploaded product image as the direct visual reference. Do not add hands or people. Keep all existing readable packaging and product markings faithful to the reference; do not invent new text. Lighting should be realistic, polished and product-focused. Camera is ${b[2]}.`;
      const videoPrompt=`Animate the matching Studio Product Reel frame for ${durs[i]||'3s'}. Shot ${i+1}: ${b[0]}. Camera motion: ${b[2]}. Keep the uploaded product and packaging absolutely stable in identity throughout motion. ${lock} ${bg} Transition / FX rule: ${fx}. No product morphing, logo drift, label drift, color shift, extra parts, missing parts, packaging changes, random text, background jumps or sudden camera movement. Only the camera and allowed environmental FX move.`;
      return{label:`Studio Reel · Shot ${i+1}`,type:b[0],move:b[2],duration:durs[i]||'3s',purpose:b[3],visualClass:b[4],imagePrompt,videoPrompt};
    });
    return{project:$('showcaseProductName').value.trim()||'Studio Product Reel',background:preset.label,sequence,lock:productLock,shots,settings:{surface:$('showcaseSurface').value,fx:$('showcaseFx').value,backgroundLocked:$('showcaseBackgroundLock').checked,ratio,style,model},image:showcaseImageSource};
  }

  function renderShowcase(data){
    const root=$('resultsArea');if(!root)return;
    root.innerHTML='';
    const details=document.createElement('details');details.className='sceneCard';details.open=true;
    const summary=document.createElement('summary');summary.className='sceneSummary';summary.innerHTML=`<div class="sceneNum">01</div><div class="sceneMeta"><strong>Studio Product Reel <span class="showcaseSceneTag">${escapeHtml(data.background)}</span></strong><span>${data.shots.length} locked product shots · ${data.sequence} sequence · ${data.lock} product lock</span></div><div class="sceneBadges"><span class="badge">${data.shots.length} shots</span><span class="badge">${escapeHtml(data.settings.ratio)}</span></div><div class="chev">⌄</div>`;
    details.appendChild(summary);
    const body=document.createElement('div');body.className='sceneBody';const grid=document.createElement('div');grid.className='shotsGrid';
    const preset=bgPresets[background]||bgPresets.boyish;
    data.shots.forEach((shot,idx)=>{
      const card=document.createElement('article');card.className='shotCard';
      const visual=document.createElement('div');visual.className=`showcaseShotVisual ${shot.visualClass||''}`;visual.style.setProperty('--showcase-bg',preset.bg);visual.style.setProperty('--ring',preset.ring);visual.style.setProperty('--glow',preset.glow);
      if(showcaseImageSource){const img=document.createElement('img');img.src=showcaseImageSource;img.alt='Locked product reference';visual.appendChild(img)}
      else visual.appendChild(document.createTextNode('Upload product image'));
      const no=document.createElement('span');no.className='shotNo';no.textContent=`Shot ${idx+1}`;visual.appendChild(no);
      const info=document.createElement('div');info.className='shotInfo';info.innerHTML=`<div class="shotTop"><strong>${escapeHtml(shot.type)}</strong><span>${escapeHtml(shot.duration)}</span></div><div class="shotSpec">${escapeHtml(shot.move)} · ${escapeHtml(shot.purpose)}</div>`;
      const tabs=document.createElement('div');tabs.className='promptTabs';const iBtn=document.createElement('button');iBtn.className='promptTab active';iBtn.textContent='Image prompt';const vBtn=document.createElement('button');vBtn.className='promptTab';vBtn.textContent='Video prompt';tabs.append(iBtn,vBtn);
      const box=document.createElement('div');box.className='promptBox';box.textContent=shot.imagePrompt;
      iBtn.addEventListener('click',()=>{iBtn.classList.add('active');vBtn.classList.remove('active');box.textContent=shot.imagePrompt});vBtn.addEventListener('click',()=>{vBtn.classList.add('active');iBtn.classList.remove('active');box.textContent=shot.videoPrompt});
      const actions=document.createElement('div');actions.className='promptActions';const current=document.createElement('button');current.textContent='Copy current';current.addEventListener('click',()=>copyText(box.textContent));const both=document.createElement('button');both.textContent='Copy both';both.addEventListener('click',()=>copyText(`IMAGE PROMPT\n${shot.imagePrompt}\n\nVIDEO PROMPT\n${shot.videoPrompt}`));actions.append(current,both);
      const lockNote=document.createElement('div');lockNote.className='showcaseProductLock';lockNote.textContent=productLock==='strict'?'Strict product lock ON · exact geometry, package, colors, labels and branding preserved.':'Product consistency lock active.';
      info.append(tabs,box,actions,lockNote);card.append(visual,info);grid.appendChild(card);
    });
    body.appendChild(grid);details.appendChild(body);root.appendChild(details);
    lastShowcase=data;
    if($('statusBox'))$('statusBox').innerHTML=`<b>Studio Reel ready.</b> ${data.shots.length} shots created with ${data.lock} product lock and ${data.background} background.`;
    if($('step2'))$('step2').className='step done';
    if($('step3'))$('step3').className='step active';
    showToast('Studio Product Reel generated');
  }
  function generateShowcase(auto=false){
    if(!showcaseImageSource&&!auto){showToast('Upload a product image first','error');return;}
    const data=buildShowcase();renderShowcase(data);
  }
  function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  async function copyText(text){try{await navigator.clipboard.writeText(text);showToast('Copied to clipboard')}catch{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast('Copied to clipboard')}}
  function allText(){return lastShowcase.shots.map(s=>`${s.label}\n${s.type} · ${s.duration}\n\nIMAGE PROMPT\n${s.imagePrompt}\n\nVIDEO PROMPT\n${s.videoPrompt}`).join('\n\n==============================\n\n')}

  const generate=$('generateBtn');
  generate.addEventListener('click',e=>{if(showcase.classList.contains('active')){e.preventDefault();e.stopImmediatePropagation();generateShowcase(false)}},true);
  $('copyAllBtn').addEventListener('click',e=>{if(showcase.classList.contains('active')&&lastShowcase){e.preventDefault();e.stopImmediatePropagation();copyText(allText())}},true);
  $('exportBtn').addEventListener('click',e=>{if(showcase.classList.contains('active')&&lastShowcase){e.preventDefault();e.stopImmediatePropagation();const blob=new Blob([JSON.stringify(lastShowcase,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(lastShowcase.project||'studio-product-reel').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.json';a.click();URL.revokeObjectURL(url);showToast('Studio Reel JSON exported')}},true);
  $('saveBtn').addEventListener('click',e=>{if(showcase.classList.contains('active')){e.preventDefault();e.stopImmediatePropagation();const state={productName:$('showcaseProductName').value,background,productLock,sequence,surface:$('showcaseSurface').value,fx:$('showcaseFx').value,shotCount:$('showcaseShotCount').value,duration:$('showcaseDuration').value,backgroundLock:$('showcaseBackgroundLock').checked,auto:$('showcaseAutoGenerate').checked,customBg:$('showcaseCustomBg').value};localStorage.setItem('storyboard-ai-studio-reel',JSON.stringify(state));showToast('Studio Reel settings saved')}},true);

  try{
    const state=JSON.parse(localStorage.getItem('storyboard-ai-studio-reel')||'null');
    if(state){$('showcaseProductName').value=state.productName||'';background=state.background||'boyish';productLock=state.productLock||'strict';sequence=state.sequence||'reference';if(state.surface)$('showcaseSurface').value=state.surface;if(state.fx)$('showcaseFx').value=state.fx;if(state.shotCount)$('showcaseShotCount').value=state.shotCount;if(state.duration)$('showcaseDuration').value=state.duration;$('showcaseBackgroundLock').checked=state.backgroundLock!==false;$('showcaseAutoGenerate').checked=state.auto!==false;$('showcaseCustomBg').value=state.customBg||'';qa('#showcaseBackgroundChoices .presetBtn').forEach(b=>b.classList.toggle('active',b.dataset.bg===background));qa('#showcaseLockChoices .segmentBtn').forEach(b=>b.classList.toggle('active',b.dataset.lock===productLock));qa('#showcaseSequenceChoices .segmentBtn').forEach(b=>b.classList.toggle('active',b.dataset.seq===sequence));$('showcaseCustomBgWrap').classList.toggle('show',background==='custom')}
  }catch{}
})();
