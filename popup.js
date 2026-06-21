import { isPageLockEnabled } from './page-lock/toggle.js';

document.addEventListener('DOMContentLoaded', async () => {
  const views = {
    token: document.getElementById('token-view'),
    modules: document.getElementById('modules-view')
  };
  const ui = {
    tokenInput: document.getElementById('token-input'),
    tokenStatus: document.getElementById('token-status'),
    togglePageLock: document.getElementById('toggle-page-lock')
  };

  const showView = (name) => {
    Object.entries(views).forEach(([key, view]) => {
      view.style.display = key === name ? 'block' : 'none';
    });
  };

  // Init
  const { notionToken } = await chrome.storage.local.get(['notionToken']);
  if (notionToken) {
    ui.tokenInput.value = notionToken;
    showView('modules');
  } else {
    showView('token');
  }

  ui.togglePageLock.checked = await isPageLockEnabled();

  // Events
  document.getElementById('save-token').addEventListener('click', async () => {
    const token = ui.tokenInput.value.trim();
    if (token) {
      await chrome.storage.local.set({ notionToken: token });
      ui.tokenStatus.textContent = 'Saved!';
      setTimeout(() => {
        ui.tokenStatus.textContent = '';
        showView('modules');
      }, 1000);
    }
  });

  document.getElementById('edit-token-btn').addEventListener('click', () => showView('token'));

  ui.togglePageLock.addEventListener('change', async (e) => {
    const { modules = {} } = await chrome.storage.local.get(['modules']);
    modules.pageLock = e.target.checked;
    await chrome.storage.local.set({ modules });
  });
});
