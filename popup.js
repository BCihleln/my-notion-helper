document.addEventListener('DOMContentLoaded', () => {
  const tokenView = document.getElementById('token-view');
  const modulesView = document.getElementById('modules-view');
  const tokenInput = document.getElementById('token-input');
  const saveTokenBtn = document.getElementById('save-token');
  const tokenStatus = document.getElementById('token-status');
  const editTokenBtn = document.getElementById('edit-token-btn');
  
  const togglePageLock = document.getElementById('toggle-page-lock');

  // Initialization
  chrome.storage.local.get(['notionToken', 'modules'], (result) => {
    const token = result.notionToken;
    const modules = result.modules || { pageLock: true }; // default to true

    if (token) {
      showView('modules');
      tokenInput.value = token;
    } else {
      showView('token');
    }

    // Set toggle state
    togglePageLock.checked = modules.pageLock !== false;
  });

  // Save Token
  saveTokenBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
      chrome.storage.local.set({ notionToken: token }, () => {
        tokenStatus.textContent = 'Saved!';
        setTimeout(() => {
          tokenStatus.textContent = '';
          showView('modules');
        }, 1000);
      });
    }
  });

  // Edit Token
  editTokenBtn.addEventListener('click', () => {
    showView('token');
  });

  // Toggle Module
  togglePageLock.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.local.get(['modules'], (result) => {
      const modules = result.modules || {};
      modules.pageLock = isEnabled;
      chrome.storage.local.set({ modules });
    });
  });

  function showView(viewName) {
    if (viewName === 'token') {
      tokenView.style.display = 'block';
      modulesView.style.display = 'none';
    } else {
      tokenView.style.display = 'none';
      modulesView.style.display = 'block';
    }
  }
});
