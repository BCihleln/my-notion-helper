chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-lock') {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab) return;

      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'get-page-id' });
      } catch (err) {
        console.error('Failed to communicate with content script:', err);
        return;
      }

      if (!response || !response.success) {
        console.error('Failed to get Page ID:', response?.error || 'No response');
        return;
      }

      const pageId = response.pageId;
      const { notionApiToken } = await chrome.storage.local.get('notionApiToken');
      if (!notionApiToken) {
        console.error('Notion API Token not found in storage');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${notionApiToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      };

      const getResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'GET',
        headers
      });

      if (!getResponse.ok) {
        throw new Error(`Failed to fetch page: ${getResponse.statusText}`);
      }

      const pageData = await getResponse.json();
      const currentLockedState = pageData.is_locked === true;

      const patchResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          is_locked: !currentLockedState
        })
      });

      if (!patchResponse.ok) {
        throw new Error(`Failed to update page: ${patchResponse.statusText}`);
      }

      console.log('Successfully toggled page lock state to:', !currentLockedState);
      
    } catch (error) {
      console.error('Error in toggle-lock command:', error);
    }
  }
});
