chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get-page-id') {
    const url = window.location.href;
    const match = url.match(/([a-f0-9]{32})(?:\?.*)?$/i);
    
    if (match && match[1]) {
      const rawId = match[1];
      const formattedId = `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(12, 16)}-${rawId.slice(16, 20)}-${rawId.slice(20)}`;
      sendResponse({ success: true, pageId: formattedId });
    } else {
      sendResponse({ success: false, error: 'Could not find Page ID in URL' });
    }
  }
  return true;
});
