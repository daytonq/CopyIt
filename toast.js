function showCopyItToast(message = 'Saved!') {
  const existing = document.getElementById('copyit-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'copyit-toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#5c2d91',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
    zIndex: 9999,
    opacity: 0,
    transition: 'opacity 0.3s ease'
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = 1);

  setTimeout(() => {
    toast.style.opacity = 0;
    toast.addEventListener('transitionend', () => toast.remove());
  }, 2000);
}

showCopyItToast();
