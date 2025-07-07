// Background service worker for the Chrome extension
// This file can be used for background processing and extension lifecycle management

chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Manager extension installed');
});

// You can add other background functionality here as needed
