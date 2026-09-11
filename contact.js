(() => {
  const config = window.portfolioContact || {};
  const details = Object.fromEntries(['email','discord','telegram','whatsapp'].map(k=>[k,String(config[k]||'').trim()]));
  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email);
  const placeholders = {email:'Your email address',discord:'Your Discord username',telegram:'@yourusername',whatsapp:'Your WhatsApp number'};
  const dialog = document.querySelector('#contact-dialog');
  const status = document.querySelector('#contact-status');
  const submit = document.querySelector('#contact-send');
  const form = document.querySelector('#contact-form');
  const notice = document.querySelector('#contact-feedback');
  for(const button of document.querySelectorAll('[data-contact-open]')) button.addEventListener('click',()=>dialog.showModal());
  document.querySelector('#contact-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  for(const button of document.querySelectorAll('[data-contact-kind]')) {
    const kind=button.dataset.contactKind;
    const value=details[kind];
    const isValid=kind==='email'?emailReady:kind==='telegram'?/^@?[A-Za-z0-9_]+$/.test(value):kind==='whatsapp'?/^\+?[\d\s()-]{7,25}$/.test(value):Boolean(value);
    button.querySelector('[data-contact-value]').textContent=value||placeholders[kind];
    button.disabled=!isValid;
    if(!isValid){button.title='Contact detail has not been added yet';continue;}
    button.addEventListener('click',async()=>{
      if(kind==='email'){location.href='mailto:'+details.email;return;}
      if(kind==='telegram'){window.open('https://t.me/'+encodeURIComponent(value.replace(/^@/,'')),'_blank','noopener,noreferrer');return;}
      if(kind==='whatsapp'){window.open('https://wa.me/'+value.replace(/\D/g,''),'_blank','noopener,noreferrer');return;}
      try {await navigator.clipboard.writeText(value);notice.textContent='Discord username copied.';}
      catch {notice.textContent='Discord username: '+value;}
    });
  }
  submit.disabled=!emailReady;
  status.textContent=emailReady?'This opens your email app with the message filled in. Review it there and send.':'Email contact is coming soon. Messages cannot be sent yet.';
  document.querySelector('#contact-intro').textContent=emailReady?'Share your project, preferred style, and timeline. The form prepares an email you can review and send.':'Share your project, preferred style, and timeline. Contact details will be available here soon.';
  document.querySelector('#contact-summary').textContent=emailReady?'Tell me about your project and let’s plan the next step.':'Have a project in mind? My contact details will be added here soon.';
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!emailReady||!form.reportValidity())return;
    const data=new FormData(form);
    const body=['Name: '+data.get('name'),'Email: '+data.get('email'),'Company / Brand: '+(data.get('company')||'Not specified'),'Project type: '+data.get('projectType'),'','Message:',data.get('message')].join('\n');
    location.href='mailto:'+details.email+'?subject='+encodeURIComponent('Portfolio inquiry — '+data.get('projectType'))+'&body='+encodeURIComponent(body);
    status.textContent='Your email draft was requested. Complete sending in your email app; nothing has been sent by this website.';
  });
})();
