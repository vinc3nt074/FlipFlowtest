const API = window.API_URL;
const token = localStorage.getItem('ff_token');
const email = localStorage.getItem('ff_email');
if(!token || !email){ location.href = 'login.html'; }

document.getElementById('userBadge').textContent = email;
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('ff_token');
  localStorage.removeItem('ff_email');
  location.href='login.html';
});

async function api(action, payload){
  const res = await fetch(API, {
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({ action, token, ...payload })
  });
  const ct = (res.headers.get('content-type')||'').toLowerCase();
  return ct.includes('application/json') ? await res.json() : { ok:false, error:'Non-JSON ('+res.status+')' };
}

/** Optimize form */
document.getElementById('optForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const productName = document.getElementById('productName').value;
  const category = document.getElementById('category').value;
  const targetPrice = parseFloat(document.getElementById('targetPrice').value)||0;
  const description = document.getElementById('description').value;
  const optStatus = document.getElementById('optStatus');
  optStatus.textContent = 'Sende ...';
  try{
    const data = await api('optimize', { productName, category, targetPrice, description, email });
    if(data.ok){
      optStatus.textContent = 'Ergebnisse werden per E-Mail gesendet.';
      optStatus.classList.add('ok');
      e.target.reset();
    } else {
      optStatus.textContent = 'Fehler: ' + (data.error||'Unbekannt');
      optStatus.classList.add('error');
    }
  }catch(err){
    optStatus.textContent = 'Fetch-Fehler: ' + err.message;
    optStatus.classList.add('error');
  }
});

/** Links */
const linksGrid = document.getElementById('linksGrid');
const linksStatus = document.getElementById('linksStatus');
const linkUrl = document.getElementById('linkUrl');
const saveLinkBtn = document.getElementById('saveLinkBtn');
const search = document.getElementById('search');
const statusFilter = document.getElementById('statusFilter');
const sortBy = document.getElementById('sortBy');

let LINKS = [];

function renderLinks(){
  const q = (search.value||'').toLowerCase();
  const st = statusFilter.value||'';
  let arr = LINKS.slice();
  if(q){
    arr = arr.filter(x => (x.title||'').toLowerCase().includes(q) || (x.url||'').toLowerCase().includes(q) || (x.location||'').toLowerCase().includes(q));
  }
  if(st){ arr = arr.filter(x => (x.status||'') === st); }
  if(sortBy.value === 'price'){
    arr.sort((a,b)=> (parseFloat(a.price)||0) - (parseFloat(b.price)||0));
  } else if (sortBy.value === 'title'){
    arr.sort((a,b)=> (a.title||'').localeCompare(b.title||''));
  } else {
    arr.sort((a,b)=> (b.created_at||'').localeCompare(a.created_at||''));
  }

  linksGrid.innerHTML = '';
  if(!arr.length){
    linksGrid.innerHTML = '<p class="status">Keine Einträge.</p>';
    return;
  }
  for(const it of arr){
    const card = document.createElement('div');
    card.className = 'card listing';

    const img = document.createElement('img');
    img.className = 'img';
    img.src = it.image || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="180"><rect width="100%" height="100%" fill="#0f1424"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9FB3C8" font-family="system-ui" font-size="12">keine Vorschau</text></svg>');
    img.alt = 'Bild';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.style.lineHeight = '1.2';
    title.style.display = '-webkit-box';
    title.style.webkitLineClamp = '2';
    title.style.webkitBoxOrient = 'vertical';
    title.style.overflow = 'hidden';
    title.textContent = it.title || it.url;

    const row1 = document.createElement('div');
    row1.className = 'row';
    const price = document.createElement('span'); price.className='pill'; price.textContent = it.price ? (it.price+' €') : 'Preis –';
    const loc = document.createElement('span'); loc.className='pill'; loc.textContent = it.location || 'Ort –';
    row1.append(price, loc);

    const actions = document.createElement('div');
    actions.className = 'row';
    const openBtn = document.createElement('a'); openBtn.className='btn'; openBtn.textContent = 'Öffnen'; openBtn.href = it.url; openBtn.target='_blank';
    const copyBtn = document.createElement('button'); copyBtn.className='btn'; copyBtn.textContent='Kopieren';
    copyBtn.onclick = async ()=>{ await navigator.clipboard.writeText(it.url); copyBtn.textContent='Kopiert'; setTimeout(()=>copyBtn.textContent='Kopieren',1000); };
    const delBtn = document.createElement('button'); delBtn.className='btn'; delBtn.textContent='Löschen';
    delBtn.onclick = async ()=>{
      if(!confirm('Eintrag löschen?')) return;
      const data = await api('deleteLink', { id: it.id });
      if(data.ok){ LINKS = LINKS.filter(x=>x.id!==it.id); renderLinks(); }
    };

    const sel = document.createElement('select');
    ['saved','contacted','visited','bought','archived'].forEach(s=>{
      const o = document.createElement('option'); o.value=s; o.textContent=s; if((it.status||'')===s) o.selected=true; sel.appendChild(o);
    });
    sel.onchange = async ()=>{
      await api('updateLink', { id: it.id, status: sel.value });
      it.status = sel.value;
    };

    const rating = document.createElement('div'); rating.className='rating';
    for(let i=1;i<=5;i++){
      const star = document.createElement('span'); star.textContent='★'; star.className='star' + (i <= (parseInt(it.rating)||0) ? ' active' : '');
      star.onclick = async ()=>{
        await api('updateLink', { id: it.id, rating: i });
        it.rating = i; renderLinks();
      };
      rating.appendChild(star);
    }

    const note = document.createElement('textarea');
    note.placeholder = 'Notiz...';
    note.value = it.note||'';
    note.onchange = async ()=>{ await api('updateLink', { id: it.id, note: note.value }); it.note = note.value; };

    actions.append(openBtn, copyBtn, delBtn, sel, rating);
    meta.append(title, row1, actions, note);

    card.append(img, meta);
    linksGrid.appendChild(card);
  }
}

async function loadLinks(){
  linksStatus.textContent = 'Lade...';
  try{
    const data = await api('listLinks', {});
    if(data.ok){
      LINKS = data.items||[];
      linksStatus.textContent = '';
      renderLinks();
    } else {
      linksStatus.textContent = 'Fehler: ' + (data.error||'Unbekannt');
      linksStatus.classList.add('error');
    }
  }catch(err){
    linksStatus.textContent = 'Fetch-Fehler: ' + err.message;
    linksStatus.classList.add('error');
  }
}
saveLinkBtn.addEventListener('click', async ()=>{
  const url = linkUrl.value.trim();
  if(!url) return;
  saveLinkBtn.disabled = true;
  linksStatus.textContent = 'Speichere...';
  try{
    const data = await api('saveLink', { url });
    if(data.ok){
      if(!data.dedupe) LINKS.unshift(data.link);
      linksStatus.textContent = data.dedupe ? 'Schon gespeichert.' : 'Gespeichert.';
      linkUrl.value = '';
      renderLinks();
    } else {
      linksStatus.textContent = 'Fehler: ' + (data.error||'Unbekannt');
      linksStatus.classList.add('error');
    }
  }catch(err){
    linksStatus.textContent = 'Fetch-Fehler: ' + err.message;
    linksStatus.classList.add('error');
  } finally {
    saveLinkBtn.disabled = false;
  }
});

search.addEventListener('input', renderLinks);
statusFilter.addEventListener('change', renderLinks);
sortBy.addEventListener('change', renderLinks);

loadLinks();
