import { getNotionEntity, updateNotionEntity, extractNotionIdFromUrl } from '../notion/main.js';
import { getCurrentTab, showToast } from '../utils.js';

async function getModulesState() {
  const result = await chrome.storage.local.get(['modules']);
  return result.modules || {};
}

export async function isPageLockEnabled() {
  const modules = await getModulesState();
  return modules.pageLock !== false; // default to true
}

async function togglePageLockState(pageId, notionToken) {
  const entity = await getNotionEntity(pageId, notionToken);
  const newLockState = !entity.data.is_locked;
  
  await updateNotionEntity(pageId, entity.type, { is_locked: newLockState }, notionToken);
  
  return newLockState;
}

export async function handleToggleLockCommand() {
  try {
    if (!(await isPageLockEnabled())) {
      console.log('Page lock module is disabled.');
      return;
    }

    const { notionToken } = await chrome.storage.local.get(['notionToken']);
    if (!notionToken) return showToast('Token Missing: Please set your Notion API Token in the extension popup.');

    const tab = await getCurrentTab();
    if (!tab) return;

    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { action: 'get-page-url' });
    } catch (err) {
      return showToast('Content Script Not Ready: Please refresh this Notion page.', tab.id);
    }

    if (!response?.success || !response.url) {
      return showToast('Failed to get page URL from content script.', tab.id);
    }

    const pageId = extractNotionIdFromUrl(response.url);
    if (!pageId) {
      return showToast('Page ID Not Found: Could not detect Notion Page ID from URL.', tab.id);
    }
    
    try {
      const newLockState = await togglePageLockState(pageId, notionToken);
      await showToast(`Page is now ${newLockState ? 'locked' : 'unlocked'}.`, tab.id);
    } catch (apiError) {
      return showToast(`API Error: ${apiError.message}`, tab.id);
    }
  } catch (error) {
    console.error('Error:', error);
    await showToast('Error: An unexpected error occurred. Check console.');
  }
}