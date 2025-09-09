const API = window.API_URL;

async function api(action, payload){
  const res = await fetch(API, {
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({ action, ...payload })
  });
  return await res.json();
}

document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const status = document.getElementById('loginStatus');
  status.textContent = 'Anmelden...';
  try{
    const data = await api('login', { email, password });
    if(data.ok){
      localStorage.setItem('ff_token', data.token);
      localStorage.setItem('ff_email', email);
      status.textContent = 'Erfolgreich! Weiterleiten...';
      setTimeout(()=> location.href='dashboard.html', 300);
    } else {
      status.textContent = 'Fehler: ' + (data.error||'Unbekannt');
      status.classList.add('error');
    }
  }catch(err){
    status.textContent = 'Fetch-Fehler: ' + err.message;
    status.classList.add('error');
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const status = document.getElementById('regStatus');
  status.textContent = 'Erstelle Konto...';
  try{
    const data = await api('register', { email, password });
    if(data.ok){
      localStorage.setItem('ff_token', data.token);
      localStorage.setItem('ff_email', email);
      status.textContent = 'Konto erstellt! Weiterleiten...';
      setTimeout(()=> location.href='dashboard.html', 300);
    } else {
      status.textContent = 'Fehler: ' + (data.error||'Unbekannt');
      status.classList.add('error');
    }
  }catch(err){
    status.textContent = 'Fetch-Fehler: ' + err.message;
    status.classList.add('error');
  }
});
