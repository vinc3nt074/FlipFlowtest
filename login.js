
const form = document.getElementById('loginForm');
const statusEl = document.getElementById('status');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if(!email){
    statusEl.textContent = 'Bitte E‑Mail eingeben.';
    statusEl.classList.add('error');
    return;
  }
  localStorage.setItem('ff_email', email);
  statusEl.textContent = 'Erfolgreich eingeloggt. Weiterleiten …';
  statusEl.classList.add('ok');
  setTimeout(() => window.location.href = 'dashboard.html', 400);
});
