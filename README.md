# AI Sidebar

A Brave browser sidebar extension that lets you chat with **Claude**, **ChatGPT**, and **Gemini** using your existing subscriptions — no API keys needed.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Brave](https://img.shields.io/badge/Browser-Brave-orange)

## Features

- **Three AI chats in one sidebar** — Switch between Claude, ChatGPT, and Gemini with tabs
- **Uses your existing sessions** — Leverages your browser cookies, no separate login required
- **Claude menu panel** — Search your conversations and navigate to Chats, Projects, Artifacts, and Code
- **Lazy loading** — Tabs only load when first activated to save resources
- **Dynamic theming** — Toolbar color matches each provider's background
- **Keyboard shortcut** — Open the sidebar with `Ctrl+L` (configurable in `brave://extensions/shortcuts`)
- **Pop-out & refresh** — Open any chat in a full tab or refresh the current one

## Install

### From .crx file
1. Download `ai-sidebar.crx` from this repo
2. Open `brave://extensions/`
3. Drag and drop the `.crx` file onto the page

### From source (development)
1. Clone this repo
2. Open `brave://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the project folder
5. Click the extension icon in the toolbar to open the sidebar

## Usage

- **Switch chats** — Click the tabs at the bottom (Claude, ChatGPT, Gemini)
- **Claude menu** — Click the hamburger icon to search conversations and navigate
- **Refresh** — Click the refresh button to reload the current chat
- **Pop out** — Click the arrow button to open the current chat in a full tab
- **Screenshot** — Use `Ctrl+Shift+S` (Brave's built-in screenshot tool) to capture the page, then paste into the chat

## How it works

The extension uses Chrome's **Side Panel API** to render a panel in Brave's sidebar. AI chat sites are loaded in iframes, and `declarativeNetRequest` rules strip `X-Frame-Options` and `Content-Security-Policy` headers (only for sub-frame requests) to allow embedding. Your browser cookies handle authentication automatically.

Claude's conversation search uses the `chrome.cookies` API to read only the `sessionKey` and `lastActiveOrg` cookies, forwarding search requests through the background service worker.

## Project structure

```
manifest.json     MV3 manifest — permissions, side panel, commands
sidebar.html      Tab UI with iframes and Claude menu panel
sidebar.js        Tab switching, menu, search, navigation
styles.css        Dark theme matching Brave's native styling
background.js     Side panel behavior, Claude search API proxy
rules.json        declarativeNetRequest rules for header removal
icons/            Extension icons (16, 48, 128px)
```

## Security notes

- Header stripping (`X-Frame-Options`, `CSP`) only applies to `sub_frame` requests for the four AI domains — regular browsing is unaffected
- Cookie access is scoped to `sessionKey` and `lastActiveOrg` on `claude.ai` only
- Host permissions are limited to the four AI chat domains
- No data is sent to any third-party servers

## License

MIT
