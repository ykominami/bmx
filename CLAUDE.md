# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bmx72MV3D** is a Chrome browser extension (Manifest V3) that provides powerful bookmark management functionality. It allows users to quickly save and organize bookmarks into predefined folders through a popup interface.

## Development

No build process. To test changes:
1. Edit JS/HTML/CSS files directly
2. Go to `chrome://extensions/` in Chrome
3. Click "Reload" on the extension card

To generate CSS grid positioning classes (`popupy.css`):
```
node makesettings.js <output.css>
```
Note: `makesettings.js` is referenced here but not currently present in the repository.

There are no automated tests. The `.cursor/rules/test-ts.mdc` file is from an unrelated React/TypeScript project and does not apply here.

## Architecture

### Startup Sequence (`PopupManager.start()`)

Order matters — `data` singleton must be populated before UI renders:
1. `Globalx.initSettings_a()` — seed Settings from Keyvalues defaults
2. `Globalx.initSettings_all()` — overwrite from `chrome.storage.local`
3. `loadItems1()` — fetch `config/items1.json` as JSON
4. `get_bookmarks()` — walk Chrome bookmark tree, populate `data` singleton
5. `make_popup_ui()` — render upper and lower UI areas

### Core Data Model

**`Data`** (js/data.js) is a module-level singleton (`export { data }`) with two hash maps built during startup:
- `ItemHash`: bookmark ID → `Item`
- `ItemHashByHier`: hierarchical path string (e.g. `/Y1/ChatGPT/0`) → `Item`

**`Item`** (js/item.js) classifies each Chrome bookmark node:
- `ROOT`: parentId is non-numeric (−1 after parse)
- `TOP`: parentId === 0 (direct children of Chrome's virtual root; `hier` stays `''`)
- `FOLDER`: all other folders; `hier` = `parent.hier + '/' + title`
- `ITEM`: has a `url` — stored in `ItemHash` only, not `ItemHashByHier`

`hier` for TOP-level folders starts with `/` (e.g. `/Y1`, `/0`). Root is Chrome's bookmark bar (`id: '1'`).

**`ItemGroup`** (js/itemgroup.js) walks the Chrome bookmark tree recursively via `add_to_itemgroup()`, calling `data.addItem()` for every non-ITEM node.

### Storage

**`Globalx`** (js/globalx.js) — all Chrome storage is kept under a single `chrome.storage.local` key `all`, containing four sub-keys:
- `Options` — recently used folder history (array of `{value, text}`)
- `Selected` — last selected folder per category key
- `Hiers` — snapshot of `ItemHashByHier` keys
- `Misc` — miscellaneous settings

`ANOTHER_FOLDER = -1` is a sentinel value used in selects to mean "pick a different folder."

### Configuration Files

**`config/items1.json`** — the bookmark category list, a plain JSON array of `["Label", "/hierarchical/path"]` pairs. Loaded at runtime via `fetch()` with `cache: 'no-cache'` in `loadItems1()`. **Must be a raw JSON array** — not a JS module. The static `import {items1} from '../config/items1.js'` at the top of `popupx.js` is dead code; the actual data comes from `loadItems1()`.

**`config/settings3.js`** — exports `getNumOfRows()` (5 columns), `getMax()` (400 items), `getKeys()`, `getPrefix()`, `getFoldersFromPrefixes()`, `getFoldersFromDayPrefixes()`. Also defines `folderPrefixes` (e.g. `/0/Kindle` → `K`) and `folderDayPrefixes` for auto-folder creation. The `keys` array (e.g. `['/0/0-etc/1']`) drives the `zinp` source folder dropdown in move mode.

> **Note**: the file currently present in the repo is `config/settings2.js` (same content). All JS imports reference `config/settings3.js`. If the extension fails to load, ensure `settings3.js` exists.

### Folder Management

**`AddFolder`** (js/addfolder.js):
- `getOrCreateFolder(hier)` — recursively creates folder hierarchy by splitting `hier` into segments, then calling `makeAndRegisterBookmarkFolder()` for any missing segment
- `addFolderx()` — creates next-month folders under each `folderPrefixes` path (e.g. `K-202501`)
- `addDayFolderx()` — creates `Year/YYYYMM/YYYYMMDD` hierarchy under each `folderDayPrefixes` path

`getBookmarkTitle()` uses the older callback-style Chrome API — inconsistent with the rest of the codebase.

### Auto-Routing (Movergroup)

**`Movergroup`** (js/movegroup.js) is a singleton with hardcoded domain → folder path rules:
```
www.youtube.com   → /Video
www.nicovideo.jp  → /Video-nico
www.bilibili.com  → /Video-bili
www.amazon.co.jp  → /Amazon
note.com          → /Note.com
```
Triggered by the `BX` / `BX2` buttons in the popup. `BX` scans from the bookmark bar root (`id: '1'`); `BX2` scans from `/0/0-etc/0`.

### Popup UI

**`PopupManager`** (js/popupx.js) — two modes toggled by clicking `#add-mode` / `#move-mode` labels:

**Add mode**: radio `s` (single tab) | `m-r` (tabs to the right) | `m-l` (tabs to the left) | `x` (no-op). Category buttons call `createOrMoveBKItem()` which calls `chrome.bookmarks.create()`.

**Move mode**: `#zinp` (source folder, populated from `getKeys()`) → `#yinp` (bookmarks in that folder) → `#oname`/`#ourl`/`#oid` (selected bookmark info) → category button calls `moveBKItem()` → `chrome.bookmarks.move()`.

`#rinp` is the recently-used folder select, persisted via `Globalx.StorageOptions`.

CSS layout uses three files: `popupy.css` (grid positioning, auto-generated), `popupx.css` (component styles), `popup.css`. Grid classes follow the pattern `g-<row>-<col>` with 5 columns.

### Migration Status

`Util` (js/util.js) still imports `addRecentlyItemX` and `getStorageOptions` from the legacy `js/global.js`. New code should use `Globalx` (js/globalx.js) instead.

## Code Style

- ES6 modules with explicit imports/exports
- JSDoc comments for all classes and methods (written in Japanese)
- jQuery for DOM manipulation; bundled locally in `outerjs/` (jQuery 3.7.1, jQuery UI, day.js)
- Hierarchical paths use forward slashes (e.g. `/Y1/ChatGPT/Agent/Agent-1`)
- Prettier config (`js/.prettierrc`): 2-space indent, no tabs, single quotes

## Important Constraints

- `config/items1.json` must be a raw JSON array (not `export const items1 = [...]`)
- Duplicate keys in `ItemHash` / `ItemHashByHier` are silently ignored (`setItem` / `setItemByHier` return null without overwriting)
- Empty/null/whitespace-only keys are rejected in both setters
- `data` singleton must be fully populated before `make_popup_ui()` runs
- All Chrome API calls use Promises (MV3) — do not introduce callback style except where already present

## Common Tasks

**Add bookmark categories:**
1. Edit `config/items1.json` — raw JSON array of `["Label", "/path"]` pairs
2. Reopen popup (fetched with `no-cache` each time)

**Change monthly folder prefixes:**
- Edit `folderPrefixes` in `config/settings3.js`

**Change date-based folder root:**
- Edit `folderDayPrefixes` in `config/settings3.js`

**Add auto-routing rule (domain → folder):**
- Edit `Movergroup.get_mover_group()` in `js/movegroup.js`
