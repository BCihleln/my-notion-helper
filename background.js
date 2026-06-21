import { setupModules } from './module-manager.js';
import pageLockModule from './page-lock/index.js';
import { handleToggleLockCommand } from './page-lock/toggle.js';

setupModules([
  pageLockModule
]);

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-lock') {
    handleToggleLockCommand();
  }
});
