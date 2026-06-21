# Goal: Setup Manifest, Icons, and Documentation

## Context
We are building a Chrome extension to toggle Notion page lock using the Notion Public API.
This is Phase 1 (Setup), which involves configuring the extension skeleton so that other modules can just add their logic.

## Tasks
1. **manifest.json**: Create `manifest.json` (Manifest V3) with:
   - `permissions`: `scripting`, `tabs`, `storage`
   - `host_permissions`: `*://app.notion.com/*`
   - `commands`: Register `Ctrl+L` (or `MacCtrl+L`/`Command+L` for Mac) to toggle lock. Command name: `toggle-lock`
   - `background`: Register `background.js` as service worker
   - `options_page`: `options.html`
   - `content_scripts`: Register `page-lock/main.js` targeting `*://app.notion.com/*`
   - `web_accessible_resources`: Allow `page-lock/config.json`
2. **Icons**: Use the `generate-icons.py` script from `.agents/skills/chrome-extension/scripts/generate-icons.py` to generate default icons in the `icons/` folder.
3. **Docs**: Update `README.md` (copy from template `templates/installation-guide.md`) and sync with `AGENTS` / `SKILL` if necessary.
4. **Git Commit**: Commit these changes with a clear message.
