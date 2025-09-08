
const email = localStorage.getItem('ff_email');
if(!email){ window.location.href = 'login.html'; }

const usedKey = 'ff_used_' + email;
const used = parseInt(localStorage.getItem(usedKey) || '0', 10);
const remaining = Math.max(0, 1 - used);

document.getElementById('userBadge').textContent = email;
document.getElementById('used').textContent = used;
document.getElementById('remaining').textContent = remaining;

const go = document.getElementById('goOptimize');
if(remaining <= 0){
  go.classList.add('disabled');
  go.style.opacity = .6;
  go.style.pointerEvents = 'none';
  document.getElementById('limitBadge').textContent = 'Limit erreicht';
}
go.addEventListener('click', () => window.location.href = 'optimize.html');

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('ff_email');
  window.location.href = 'login.html';
});
