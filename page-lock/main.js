chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get-page-id') {
    const url = window.location.href;
    let rawId = null;
    
    // First, check if there's a p=... parameter which represents a peek-view page
    try {
      const urlObj = new URL(url);
      const pParam = urlObj.searchParams.get('p');
      if (pParam && /^[a-f0-9\-]{32}$/i.test(pParam)) {
        rawId = pParam;
      }
    } catch (e) { }

    // Fallback to URL path if no p= parameter
    if (!rawId) {
      const urlWithoutQuery = url.split(/[?#]/)[0];
      // Match 32 hex chars, with optional dashes (Notion IDs can sometimes have dashes)
      const match = urlWithoutQuery.match(/([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})/i);
      if (match && match[1]) {
        rawId = match[1].replace(/-/g, '');
      } else {
        // Fallback to any 32-char hex in the path without dashes
        const anyMatch = urlWithoutQuery.match(/([a-f0-9]{32})/i);
        if (anyMatch && anyMatch[1]) {
          rawId = anyMatch[1];
        }
      }
    }

    if (rawId) {
      const formattedId = `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(12, 16)}-${rawId.slice(16, 20)}-${rawId.slice(20)}`;
      sendResponse({ success: true, pageId: formattedId });
    } else {
      sendResponse({ success: false, error: 'Could not find Page ID in URL' });
    }
  } else if (request.action === 'show-toast') {
    showToast(request.message);
    sendResponse({ success: true });
  }
  return true;
});

async function showToast(message) {
  let container = document.getElementById('notion-extension-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notion-extension-toast-container';
    try {
      const response = await fetch(chrome.runtime.getURL('utils/toast.html'));
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

  toast.style.transition = 'none';
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(-50%) translateY(10px)';

  void toast.offsetWidth; // Trigger reflow

  toast.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  if (window._notionToastTimeout) {
    clearTimeout(window._notionToastTimeout);
  }

  window._notionToastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, 3000);
}
