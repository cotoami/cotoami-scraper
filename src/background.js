const DEFAULT_COTOAMI_URL = 'https://cotoa.me';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ cotoamiUrl: DEFAULT_COTOAMI_URL }, () => {
    console.log("cotoamiUrl", DEFAULT_COTOAMI_URL);
  });
});
