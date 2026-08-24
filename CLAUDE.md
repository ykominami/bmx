# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bmx72MV3D** (`manifest.json` name: `Bmx72MV3D`, description: "Powered-Bookmark7MV3D") is a Chrome browser extension (Manifest V3) for organizing bookmarks into predefined category folders from a popup UI, with automated month/day folder creation and hostname-based auto-routing of new bookmarks. Permissions: `bookmarks`, `activeTab`, `storage`, `tabs`, `unlimitedStorage`.

## Development

No package manager, build step, linter, or test suite — this is plain ES6 modules loaded directly by the browser, no bundler/transpiler involved.

To test changes:
1. Edit the `.js`/`.html`/`.css` files directly.
2. Go to `chrome://extensions/`, enable Developer Mode, and load this directory as an unpacked extension (or click "Reload" on the existing card).
3. Open the extension popup to exercise the change.

The extension's CSP (`manifest.json`: `script-src 'self'; object-src 'self'`) forbids loading scripts from a CDN, which is why jQuery/jQuery UI/day.js are vendored locally under `outerjs/` and loaded via `<script>` tags in `popup.html` rather than imported as modules.

Formatting: `js/.prettierrc` configures Prettier (`tabWidth: 2, useTabs: false, singleQuote: true`) for files under `js/`. There is no `package.json` wiring this up as a script — run it via an editor integration or `npx prettier --write js/**/*.js` if needed.

To regenerate the CSS grid positioning classes (`popupy.css`):
```
node makesettings.js <output.css>
```
`makesettings.js` is referenced here but is **not present** in the repository — this command will not currently work as-is.

There are no automated tests. `.cursor/rules/test-ts.mdc` is from an unrelated React/TypeScript project and does not apply here.

## Architecture

### Entry point and startup sequence

`popup.html` loads `js/popupx.js` as a module. That file instantiates `PopupManager` at the bottom (`new PopupManager()`), which immediately kicks off the async startup chain via `PopupManager.start()`. Order matters — the `data` singleton must be fully populated before the UI renders:
1. `Globalx.initSettings_a()` — seed `Settings` from `Keyvalues` defaults
2. `Globalx.initSettings_all()` — overwrite from `chrome.storage.local`
3. `loadItems1()` — fetch `config/items1.json` as JSON
4. `get_bookmarks()` — walk the Chrome bookmark tree, populate the `data` singleton
5. `make_popup_ui()` — render the upper and lower UI areas

### Core data model

`Data` (js/data.js) is a module-level singleton (`export { data }`) with two hash maps built during startup:
- `ItemHash`: bookmark ID → `Item`
- `ItemHashByHier`: hierarchical path string (e.g. `/Y1/ChatGPT/0`) → `Item`

`setItem`/`setItemByHier` silently return `null` (no overwrite, no throw) on a duplicate or empty/whitespace-only key — check the return value if the caller needs to know whether registration actually happened.

`Item` (js/item.js) classifies each Chrome bookmark node in its constructor:
- `ROOT`: parentId is non-numeric (`-1` after parse)
- `TOP`: parentId === 0 (direct children of Chrome's virtual root; `hier` stays `''`)
- `FOLDER`: all other folders; `hier` = `parent.hier + '/' + title`
- `ITEM`: has a `url` — stored in `ItemHash` only, not `ItemHashByHier`

`hier` for TOP-level folders starts with `/` (e.g. `/Y1`, `/0`). Root is Chrome's bookmark bar (`id: '1'`). The `Item` constructor also pushes itself into `itemGroup.RootItems`/`itemGroup.TopItems` as a side effect of construction.

`ItemGroup` (js/itemgroup.js) walks the Chrome bookmark tree recursively via `add_to_itemgroup()`, calling `data.addItem()` for every non-ITEM node.

### Storage

`Globalx` (js/globalx.js) — all Chrome storage is kept under a single `chrome.storage.local` key `all`, containing four sub-keys:
- `Options` — recently used folder history (array of `{value, text}`)
- `Selected` — last selected folder per category key
- `Hiers` — snapshot of `ItemHashByHier` keys
- `Misc` — miscellaneous settings

`Globalx.ANOTHER_FOLER` (note the typo — not `FOLDER`) is a sentinel value (`-1`) used in selects to mean "pick a different folder."

`js/global.js` is a parallel, non-class (function-based) implementation of the same storage logic — a legacy predecessor to `Globalx`. New code should use `Globalx`, not `js/global.js`.

### Configuration files

`config/items1.json` — the bookmark category list, a plain JSON array of `["Label", "/hierarchical/path"]` pairs. Loaded at runtime via `fetch()` with `cache: 'no-cache'` in `loadItems1()` (js/popupx.js). **Must be a raw JSON array**, not a JS module.

`config/settings3.js` — exports `getNumOfRows()` (5 columns), `getMax()` (400 items), `getKeys()`, `getPrefix()`, `getFoldersFromPrefixes()`, `getFoldersFromDayPrefixes()`. Also defines `folderPrefixes` (e.g. `/0/Kindle` → `K`) and `folderDayPrefixes` for auto-folder creation. The `keys` array (e.g. `['/0/0-etc/1']`) drives the `zinp` source-folder dropdown in move mode.

### Folder management

`AddFolder` (js/addfolder.js):
- `getOrCreateFolder(hier)` — recursively creates the folder hierarchy by splitting `hier` into segments, calling `makeAndRegisterBookmarkFolder()` for any missing segment
- `addFolderx()` — creates next-month folders under each `folderPrefixes` path (e.g. `K-202501`)
- `addDayFolderx()` — creates a `Year/YearMonth/YearMonthDay` hierarchy under each `folderDayPrefixes` path

### Auto-routing (Movergroup)

`Movergroup` (js/movegroup.js) is a singleton with hardcoded domain → folder path rules:
```
www.youtube.com   → /Video
www.nicovideo.jp  → /Video-nico
www.bilibili.com  → /Video-bili
www.amazon.co.jp  → /Amazon
note.com          → /Note.com
```
Triggered by the `BX`/`BX2` buttons in the popup. `BX` scans from the bookmark bar root (`id: '1'`); `BX2` scans from `/0/0-etc/0`. Add new rules via `Movergroup.get_mover_group().add(hier, hostname)`.

### Popup UI

`PopupManager` (js/popupx.js) — two modes toggled by clicking the `#add-mode`/`#move-mode` labels:

- **Add mode**: radio `s` (single tab) | `m-r` (tabs to the right) | `m-l` (tabs to the left) | `x` (no-op). Category buttons call `createOrMoveBKItem()`, which calls `chrome.bookmarks.create()`.
- **Move mode**: `#zinp` (source folder, populated from `getKeys()`) → `#yinp` (bookmarks in that folder) → `#oname`/`#ourl`/`#oid` (selected bookmark info) → category button calls `moveBKItem()` → `chrome.bookmarks.move()`.

`#rinp` is the recently-used folder select, persisted via `Globalx.StorageOptions`.

CSS layout uses three files: `popupy.css` (grid positioning, generated by `makesettings.js`), `popupx.css` (component styles), `popup.css`. Grid classes follow the pattern `g-<row>-<col>` with 5 columns.

## Code style

- ES6 modules with explicit imports/exports
- JSDoc comments for classes/methods, written in Japanese
- jQuery for DOM manipulation (see CSP note above for why it's vendored, not CDN-loaded)
- Hierarchical bookmark paths use forward slashes (e.g. `/Y1/ChatGPT/Agent/Agent-1`)
- All Chrome API calls use Promises (MV3-style `await chrome.*`) — do not introduce callback style

## Common tasks

- **Add a bookmark category**: edit `config/items1.json` (raw JSON array of `["Label", "/path"]` pairs), then reopen the popup (it's fetched with `no-cache` each time).
- **Change monthly folder prefixes**: edit `folderPrefixes` in `config/settings3.js`.
- **Change the date-based folder root**: edit `folderDayPrefixes` in `config/settings3.js`.
- **Add an auto-routing rule (domain → folder)**: edit `Movergroup.get_mover_group()` in `js/movegroup.js`.

## Reference docs

- `README.md` contains a Mermaid class diagram of the module dependency graph.
- `docs_claude_f_s/spec/internal/index.md` indexes generated per-class/per-module internal specs for everything under `js/` — check there for method-level detail on a specific class before re-reading its source. (Older, similar doc trees also exist at `docs/spec/internal/` and `docs_claude/spec/internal/`.)
