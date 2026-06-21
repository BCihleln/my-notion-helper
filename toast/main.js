const toastConfig = { durationMs: 3000 };

async function showToast(message) {
  let container = document.getElementById('notion-extension-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notion-extension-toast-container';
    
    // Inject styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('toast/styles.css');
    document.head.appendChild(link);

    try {
      const response = await fetch(chrome.runtime.getURL('toast/toast.html'));
      container.innerHTML = await response.text();
      document.body.appendChild(container);
    } catch (e) {
      console.error('Failed to load toast.html', e);
      return;
    }
  }

  const toast = document.getElementById('custom-notion-toast');
  if (!toast) return;

  toast.innerText = message;

  // Reset animations
  toast.style.transition = 'none';
  toast.classList.remove('toast-visible');
  
  void toast.offsetWidth; // Trigger reflow

  toast.style.transition = ''; // restore CSS defined transition
  toast.classList.add('toast-visible');

  if (window._notionToastTimeout) {
    clearTimeout(window._notionToastTimeout);
  }

  window._notionToastTimeout = setTimeout(() => {
    toast.classList.remove('toast-visible');
  }, toastConfig.durationMs);
}

window.showToast = showToast;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'show-toast') {
    showToast(request.message);
    sendResponse({ success: true });
  }
  return true;
});
