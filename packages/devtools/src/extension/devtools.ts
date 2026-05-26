const panelPath = '../panel/panel.html';

if (typeof chrome !== 'undefined' && chrome.devtools?.panels !== undefined) {
  chrome.devtools.panels.create('Vanrot', '', panelPath);
}
