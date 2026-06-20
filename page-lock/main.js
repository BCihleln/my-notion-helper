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
  }
  return true;
});
