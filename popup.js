document.addEventListener('DOMContentLoaded', () => {
  const textArea = document.getElementById('textArea');
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');

  chrome.runtime.sendMessage({ action: 'getSavedTexts' }, (response) => {
    if (response && response.texts.length > 0) {
      textArea.value = response.texts.join('\n\n');
    } else {
      textArea.placeholder = 'Пока ничего не сохранено.';
    }
  });

  saveChangesBtn.addEventListener('click', () => {
    const updatedTexts = textArea.value
      .split(/\n{2,}/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    chrome.runtime.sendMessage({ action: 'overwriteSavedTexts', texts: updatedTexts }, (res) => {
      if (chrome.runtime.lastError) {
        alert('Ошибка при сохранении!');
        return;
      }
      saveChangesBtn.textContent = 'Сохранено!';
      setTimeout(() => saveChangesBtn.textContent = 'Сохранить', 1500);
    });
  });

  downloadBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'download' });
    window.close();
  });

  clearBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'clearSavedTexts' }, () => {
      textArea.value = '';
      textArea.placeholder = 'Список очищен.';
    });
  });
});
