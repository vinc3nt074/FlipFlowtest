
const email = localStorage.getItem('ff_email');
if(!email){ window.location.href = 'login.html'; }

document.getElementById('userBadge').textContent = email;

const usedKey = 'ff_used_' + email;
let used = parseInt(localStorage.getItem(usedKey) || '0', 10);
const quotaInfo = document.getElementById('quotaInfo');
const form = document.getElementById('flipForm');
const statusEl = document.getElementById('status');
const submitBtn = document.getElementById('submitBtn');

function updateQuota(){
  quotaInfo.textContent = 'Verbleibende Optimierungen: ' + Math.max(0, 1 - used);
  if(used >= 1){
    submitBtn.disabled = true;
    submitBtn.style.opacity = .6;
  }
}
updateQuota();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if(used >= 1) return;

  statusEl.textContent = 'Sende Daten …';
  statusEl.classList.remove('error');
  statusEl.classList.remove('ok');

  const payload = {
    productName: document.getElementById('productName').value,
    category: document.getElementById('category').value,
    targetPrice: parseFloat(document.getElementById('targetPrice').value) || 0,
    description: document.getElementById('description').value,
    email,
  };

  try{
    const res = await fetch(window.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if(data.ok){
      used++;
      localStorage.setItem(usedKey, String(used));
      updateQuota();
      statusEl.textContent = 'Ergebnis wird per E‑Mail gesendet.';
      statusEl.classList.add('ok');
      form.reset();
    }else{
      throw new Error(data.error || 'Unbekannter Fehler');
    }
  }catch(err){
    statusEl.textContent = 'Fehler: ' + err.message;
    statusEl.classList.add('error');
  }
});
