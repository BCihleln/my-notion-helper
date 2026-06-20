# Goal: Implement Options Page

## Context
We are building a Chrome extension to toggle Notion page lock using the Notion Public API.
This is Phase 2 (Options), which involves creating the Options UI for users to input their Notion Integration Access Token.

## Tasks
1. **options.html**: Create a minimal UI with:
   - An input field for the token.
   - A save button.
   - A status message area.
2. **options.css**: Add basic styling to make it look clean.
3. **options.js**: 
   - Load the saved token from `chrome.storage.local` on initialization and populate the input.
   - Add a click event listener to the save button that reads the input and saves it to `chrome.storage.local`.
   - Show a temporary "Saved!" message.
4. **Git Commit**: Commit these changes with a clear message.
