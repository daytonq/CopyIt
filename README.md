# CopyIt

CopyIt is a Chrome extension that allows you to easily save selected text snippets from webpages, manage them in a popup interface, and download all saved texts as a file.

---

## Features

- **Save selected text** via context menu or keyboard shortcut (`Ctrl+Shift+S` / `Cmd+Shift+S`).
- View, edit, and clear saved texts in a popup window.
- Download saved texts as a `.txt` file with a timestamped filename.
- Keyboard shortcut to download saved texts (`Ctrl+Shift+D` / `Cmd+Shift+D`).
- Context menu integration for quick saving and downloading.
- Persistent storage using Chrome's local storage API.

---

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the folder containing this project.
5. The CopyIt extension should now appear in your toolbar.

---

## Usage

- **Save selected text:**
  - Select any text on a webpage.
  - Right-click and choose **"Добавить в сохранения"** (Add to saved texts).
  - Or press the keyboard shortcut `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac).
- **Open popup:**
  - Click the CopyIt icon in the toolbar.
  - You can view, edit, save, download, or clear saved texts from here.
- **Download saved texts:**
  - Click the **Скачать** (Download) button in the popup.
  - Or use the keyboard shortcut `Ctrl+Shift+D` / `Cmd+Shift+D`.
- **Clear saved texts:**
  - Click the **Очистить** (Clear) button in the popup.

---

## File structure

- `manifest.json` - Extension manifest (MV3).
- `background.js` - Service worker handling context menus, commands, and storage.
- `popup.html` - Popup UI markup.
- `popup.js` - Popup UI logic.
- `popup.css` - Popup styling.
- `icons/` - Extension icons.

---

## Permissions

- `activeTab` — To execute scripts on the active tab for text selection.
- `downloads` — To save files to the user's device.
- `scripting` — To inject content scripts.
- `storage` — To save texts persistently.
- `contextMenus` — To add options to right-click menus.
- `tabs` — To query tabs for executing scripts.

---

## Keyboard Shortcuts

| Shortcut          | Action              |
|-------------------|---------------------|
| Ctrl+Shift+S / Cmd+Shift+S | Add selected text to saved texts |
| Ctrl+Shift+D / Cmd+Shift+D | Download saved texts as a file     |

---

## License

This project is licensed under the MIT License.

---

## Contributing

Feel free to open issues or submit pull requests for improvements!

---

## Contact

For questions or suggestions, please open an issue or contact the maintainer.

