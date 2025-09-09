
const email = localStorage.getItem('ff_email');
if(!email){ window.location.href = 'login.html'; }
const usedKey = 'ff_used_' + email;
let used = parseInt(localStorage.getItem(usedKey) || '0', 10);
const form = document.getElementById('f');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = { productName: 'Test', category:'Elektronik', targetPrice:99, description:'', email };
  const res = await fetch(window.API_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(payload) });
  alert(await res.text());
});
