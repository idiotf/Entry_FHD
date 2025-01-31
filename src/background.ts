const execute = (id: number) => chrome.scripting.executeScript({
  target: { tabId: id },
  files: ['content.js'],
  world: 'MAIN',
})
chrome.tabs.onCreated.addListener(({ id }) => id && execute(id).catch(() => {}))
chrome.tabs.onUpdated.addListener(id => execute(id).catch(() => {}))
