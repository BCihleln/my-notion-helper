document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('notionToken');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Load saved token
    chrome.storage.local.get(['notionToken'], (result) => {
        if (result.notionToken) {
            tokenInput.value = result.notionToken;
        }
    });

    // Save token
    saveBtn.addEventListener('click', () => {
        const token = tokenInput.value.trim();
        chrome.storage.local.set({ notionToken: token }, () => {
            statusDiv.textContent = 'Saved!';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 2000);
        });
    });
});
