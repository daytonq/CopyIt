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

async function showToast(tabId, message = 'Saved!') {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['toast.js']
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
      await showToast(tab.id);
      break;

    case "download_saved_texts":
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


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addText" && info.selectionText) {
    let savedTexts = await getSavedTexts();
    savedTexts.push(info.selectionText.trim());
    await setSavedTexts(savedTexts);
    await showToast(tab.id);
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
      case "saveText": {
        const newText = request.text.trim();
        const existingIndex = savedTexts.findIndex(item => item.text === newText);

        if (existingIndex >= 0) {
          savedTexts[existingIndex].count += 1;
        } else {
          savedTexts.push({ text: newText, count: 1 });
        }

        await setSavedTexts(savedTexts);
        sendResponse({ status: "success" });
        break;
      }

      case "getSavedTexts":
        sendResponse({ texts: savedTexts });
        break

      case "clearSavedTexts":
        await setSavedTexts([]);
        sendResponse({ status: "cleared" });
        break;

      case "overwriteSavedTexts": {
        const flattened = request.texts.flatMap(text => {
          const match = text.match(/\s*\(×(\d+)\)$/);
          const count = match ? parseInt(match[1]) : 1;
          const cleanText = match ? text.replace(/\s*\(×\d+\)$/, '') : text;
          return [{ text: cleanText.trim(), count }];
        });

        await setSavedTexts(flattened);
        sendResponse({ status: "overwritten" });
        break;
      }


      case "download":
        if (savedTexts.length === 0) {
          sendResponse({ status: "empty" });
          return;
        }
        const textToSave = savedTexts
          .map(item => item.count > 1 ? `${item.text} (×${item.count})` : item.text)
          .join('\n\n');

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
