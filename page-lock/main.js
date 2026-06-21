chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get-page-url') {
    sendResponse({ success: true, url: window.location.href });
  }
  return true;
});
