chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get-page-id') {
    try {
      const urlObj = new URL(window.location.href);
      // Check p= param first (peek-view), fallback to path
      const targetStr = urlObj.searchParams.get('p') || urlObj.pathname;
      
      // Look for 32 hex chars (with or without dashes)
      const match = targetStr.match(/([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})/i);
      
      if (match) {
        const rawId = match[0].replace(/-/g, '');
        const formattedId = `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(12, 16)}-${rawId.slice(16, 20)}-${rawId.slice(20)}`;
        sendResponse({ success: true, pageId: formattedId });
      } else {
        sendResponse({ success: false, error: 'Could not find Page ID in URL' });
      }
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
  }
  return true;
});
