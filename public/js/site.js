(function(){
  // Lightweight client utilities for interactivity and prototyping
  window.API_BASE = window.API_BASE || (location.hostname === 'localhost' ? 'http://localhost:3000' : '');

  function _qs(sel, ctx=document){ return ctx.querySelector(sel); }
  function _qsa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

  // Toast system
  function ensureToastContainer(){
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.style.position = 'fixed';
      c.style.right = '20px';
      c.style.bottom = '20px';
      c.style.zIndex = 99999;
      document.body.appendChild(c);
    }
    return c;
  }

  function toast(message, type='info', timeout=4000){
    const c = ensureToastContainer();
    const el = document.createElement('div');
    el.className = 'toast-item toast-' + type;
    el.style.background = type==='error'? '#ff6b6b' : (type==='success'? '#2ecc71' : '#111');
    el.style.color = '#fff';
    el.style.padding = '10px 14px';
    el.style.marginTop = '8px';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    el.style.maxWidth = '320px';
    el.innerText = message;
    c.appendChild(el);
    setTimeout(()=>{ el.style.opacity = '0'; el.style.transform='translateX(20px)'; setTimeout(()=>el.remove(),400); }, timeout);
  }

  // Simple fetch wrapper
  async function fetchJSON(path, opts={}){
    const url = (path.startsWith('http') || path.startsWith('/')) ? (path.startsWith('http')? path : (window.API_BASE ? (window.API_BASE + path) : path)) : (window.API_BASE ? (window.API_BASE + '/' + path) : path);
    const res = await fetch(url, Object.assign({credentials: 'include'}, opts));
    if (!res.ok) {
      const txt = await res.text().catch(()=>null);
      const err = new Error('Request failed: ' + res.status + ' ' + res.statusText + (txt? ' - '+txt : ''));
      err.response = res;
      throw err;
    }
    return res.json().catch(()=>null);
  }

  // Quick add features prototype: add a feature/UI card to the features grid and persist to localStorage
  const FEATURE_KEY = 'ss_feature_cards_v1';
  function loadFeatureCards(){
    try{ return JSON.parse(localStorage.getItem(FEATURE_KEY) || '[]'); }catch(e){ return []; }
  }
  function saveFeatureCards(cards){ localStorage.setItem(FEATURE_KEY, JSON.stringify(cards || [])); }

  function renderFeatureCards(){
    const container = _qs('.features-grid');
    if (!container) return;
    // remove previously added seeded cards (we'll keep original DOM then append from storage)
    const cards = loadFeatureCards();
    // Remove previously appended dynamic markers
    _qsa('.feature-card.dynamic').forEach(e=>e.remove());
    cards.forEach(c=>{
      const el = document.createElement('div');
      el.className = 'feature-card dynamic';
      el.innerHTML = `\n        <div class="feature-icon">${c.icon||'✨'}</div>\n        <h3>${escapeHtml(c.title||'Untitled')}</h3>\n        <p>${escapeHtml(c.text||'')}</p>\n      `;
      container.appendChild(el);
    });
  }

  function addFeatureCard(data){
    const cards = loadFeatureCards();
    cards.push(data);
    saveFeatureCards(cards);
    renderFeatureCards();
    toast('Added feature card', 'success');
  }

  function escapeHtml(str){ return (str+'').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  // Quick-Add UI
  function createQuickAddUI(){
    if (_qs('#quick-add-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'quick-add-btn';
    btn.title = 'Quick Add content (local)';
    btn.innerText = '+';
    Object.assign(btn.style,{
      position:'fixed',right:'18px',bottom:'80px',width:'56px',height:'56px',borderRadius:'999px',background:'#ffd700',color:'#000',border:'none',boxShadow:'0 6px 18px rgba(0,0,0,0.3)',fontSize:'28px',cursor:'pointer',zIndex:99998
    });
    document.body.appendChild(btn);
    btn.addEventListener('click', ()=>{
      showQuickAddModal();
    });
  }

  function showQuickAddModal(){
    // simple prompt chain
    const title = prompt('Feature title (short)');
    if (!title) return;
    const text = prompt('Short description');
    if (text===null) return;
    const icon = prompt('Icon (emoji or short text)', '✨');
    addFeatureCard({title,text,icon});
  }

  // Initialize interactive behaviour for pages
  function initInteractive(){
    // Inject toast container
    ensureToastContainer();
    // create quick add if features-grid exists
    if (_qs('.features-grid')) createQuickAddUI();
    // render existing saved features
    renderFeatureCards();

    // Enhance links that point to /Index.html or index.html to work from any path
    _qsa('a').forEach(a=>{
      try{
        if (!a.getAttribute('href')) return;
        const href = a.getAttribute('href');
        // normalize sibling links starting with ../index.html
        if (href.match(/index\.html$/i)) {
          a.setAttribute('href', href.replace(/\/index\.html$/i,'/Index.html'));
        }
      }catch(e){}
    });

    // Nice keyboard shortcut: Ctrl+Shift+A to open quick add
    window.addEventListener('keydown', (e)=>{
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='a'){
        if (_qs('.features-grid')) showQuickAddModal();
      }
    });
  }

  // Expose public API
  window.SS = window.SS || {};
  window.SS.apiBase = window.API_BASE;
  window.SS.fetchJSON = fetchJSON;
  window.SS.toast = toast;
  window.SS.addFeatureCard = addFeatureCard;
  window.SS.loadFeatureCards = loadFeatureCards;
  window.SS.renderFeatureCards = renderFeatureCards;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initInteractive);
  else initInteractive();
})();
