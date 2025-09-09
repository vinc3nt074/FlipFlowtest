(function(){
  const statusEl  = document.getElementById('status') || (() => {
    const p = document.createElement('p'); p.id='status'; p.className='status';
    (document.querySelector('#flipForm')||document.body).appendChild(p); return p;
  })();

  function msg(text, cls){
    console.log('[FlipFlow]', text);
    statusEl.textContent = text;
    statusEl.className = 'status ' + (cls||'');
  }

  msg('optimize.js geladen ✅', 'ok');
  if(!window.API_URL){ msg('API_URL fehlt! (window.API_URL ist undefined)', 'error'); return; }
  msg('API_URL ok: ' + window.API_URL);

  const email = localStorage.getItem('ff_email');
  if(!email){ msg('Kein Login gefunden → weiterleiten …', 'error'); return location.href='login.html'; }

  document.getElementById('userBadge') && (document.getElementById('userBadge').textContent = email);

  const usedKey = 'ff_used_' + email;
  let used = parseInt(localStorage.getItem(usedKey) || '0', 10);

  const quotaInfo = document.getElementById('quotaInfo');
  const form      = document.getElementById('flipForm');
  const submitBtn = document.getElementById('submitBtn');

  if(!form){ msg('Formular #flipForm nicht gefunden!', 'error'); return; }

  function updateQuota(){
    if(quotaInfo) quotaInfo.textContent = 'Verbleibende Optimierungen: ' + Math.max(0, 1 - used);
    if(submitBtn && used >= 1){ submitBtn.disabled = true; submitBtn.style.opacity = .6; }
  }
  updateQuota();

  async function parseMaybeJson(res){
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if(ct.includes('application/json')) return await res.json();
    const text = await res.text();
    return { ok:false, error: 'Non-JSON ('+res.status+'): '+ text.slice(0,200) +'…' };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(used >= 1){ msg('Limit erreicht.', 'error'); return; }

    msg('Sende Daten …');
    const payload = {
      productName: document.getElementById('productName').value,
      category:    document.getElementById('category').value,
      targetPrice: parseFloat(document.getElementById('targetPrice').value) || 0,
      description: document.getElementById('description').value,
      email
    };

    try{
      const res  = await fetch(window.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const data = await parseMaybeJson(res);

      if(res.ok && data && data.ok){
        used++; localStorage.setItem(usedKey, String(used)); updateQuota();
        msg('Ergebnis wird per E-Mail gesendet.', 'ok');
        form.reset();
      }else{
        const m = (data && data.error) ? data.error : ('HTTP '+res.status+' '+res.statusText);
        throw new Error(m);
      }
    }catch(err){
      msg('Fehler: ' + err.message, 'error');
    }
  });
})();
