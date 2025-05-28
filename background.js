function getSavedTexts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['savedTexts'], (result) => {
      resolve(result.savedTexts || []);
    });
  });
}

function setSavedTexts(texts) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ savedTexts: texts }, () => {
      resolve();
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "addText",
      title: "Добавить в сохранения",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "downloadTexts",
      title: "Скачать сохранения",
      contexts: ["page", "frame", "link", "image", "video", "audio"]
    });
  });
});

chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "add_selected_text":
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selection = window.getSelection().toString().trim();
          if (selection) {
            chrome.runtime.sendMessage({ action: "saveText", text: selection });
          }
        }
      });
      break;

    case "download_saved_texts":
      chrome.runtime.sendMessage({ action: "download" });
      break;
  }
});


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addText" && info.selectionText) {
    let savedTexts = await getSavedTexts();
    savedTexts.push(info.selectionText.trim());
    await setSavedTexts(savedTexts);
  } else if (info.menuItemId === "downloadTexts") {

    const savedTexts = await getSavedTexts();
    if (savedTexts.length === 0) return;

    const textToSave = savedTexts.join('\n\n');
    const url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToSave);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    chrome.downloads.download({
      url: url,
      filename: `saved-text-${timestamp}.txt`,
      saveAs: true
    }, async () => {
      await setSavedTexts([]);
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    let savedTexts = await getSavedTexts();
    switch (request.action) {
      case "saveText":
        savedTexts.push(request.text);
        await setSavedTexts(savedTexts);
        sendResponse({ status: "success" });
        break;

      case "getSavedTexts":
        sendResponse({ texts: savedTexts });
        break

      case "clearSavedTexts":
        await setSavedTexts([]);
        sendResponse({ status: "cleared" });
        break;

      case "overwriteSavedTexts":
        await setSavedTexts(request.texts);
        sendResponse({ status: "overwritten" });
        break;

      case "download":
        if (savedTexts.length === 0) {
          sendResponse({ status: "empty" });
          return;
        }
        const textToSave = savedTexts.join('\n\n');
        const url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToSave);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        chrome.downloads.download({
          url: url,
          filename: `saved-text-${timestamp}.txt`,
          saveAs: true
        }, async () => {
          await setSavedTexts([]);
          sendResponse({ status: "downloaded" });
        });
        return true;
    }
  })();
  return true;
});
