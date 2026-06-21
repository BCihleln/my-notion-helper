# Phase 2: Pluggable Module Architecture
**Goal**: Implement `module-manager.js` and move `page-lock` init logic to `page-lock/index.js` to decouple background script.
**Tasks**:
1. Create `module-manager.js` that exports a `setupModules(modules)` function. It should iterate over modules, check `chrome.storage.local.get(['modules'])`, and dynamically call each module's `onEnable` or `onDisable`. It must also listen to `chrome.storage.onChanged` to react to toggles.
2. Create `page-lock/index.js` exporting `{ id: 'pageLock', onEnable, onDisable }`. Move the `chrome.scripting.registerContentScripts` and `unregisterContentScripts` logic here from `background.js`'s `updateScriptState`.
3. Update `background.js` to import `module-manager.js` and `page-lock/index.js`. Remove all the old init logic and just run the manager.
4. Verify changes manually.
5. Git commit all changes with prefix `refactor: `.
