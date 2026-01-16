# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bmx72MV3D** is a Chrome browser extension (Manifest V3) that provides powerful bookmark management functionality. It allows users to quickly save and organize bookmarks into predefined folders through a popup interface.

## Architecture

### Core Data Management

The extension uses a dual-index data structure for bookmarks:

- **`Data` class** (js/data.js): Singleton that maintains two hash maps:
  - `ItemHash`: Maps bookmark IDs to Item objects
  - `ItemHashByHier`: Maps hierarchical paths (e.g., `/Y1/ChatGPT/0`) to Item objects

This dual indexing enables fast lookups both by Chrome's bookmark IDs and by human-readable hierarchical paths.

### Class Hierarchy

- **`Item`** (js/item.js): Represents individual bookmarks and folders
  - Determines item kind: ROOT, TOP, FOLDER, or ITEM (non-folder)
  - Maintains hierarchical path (`hier`) for folders
  - Stores metadata: id, parentId, title, url, children

- **`ItemGroup`** (js/itemgroup.js): Manages collections of Items
  - Tracks RootItems and TopItems
  - Converts Chrome bookmark tree nodes into Item objects
  - Provides batch operations for moving bookmarks

- **`PopupManager`** (js/popupx.js): Main controller for the popup UI
  - Initializes on DOMContentLoaded
  - Builds dynamic menu from settings2.js configuration
  - Handles two modes:
    - **Add mode**: Save current/multiple tabs to folders
    - **Move mode**: Move existing bookmarks between folders
  - Radio button options in add mode:
    - `s`: Single tab
    - `m-r`: Multiple tabs to the right of active tab
    - `m-l`: Multiple tabs to the left of active tab
    - `x`: Do nothing (for testing)

### Storage Management

- **`Globalx`** (js/globalx.js): Manages Chrome storage (replaces older global.js)
  - `StorageOptions`: Recently used folder history
  - `StorageSelected`: Last selected folder per category
  - `StorageHiers`: Hierarchical path mappings
  - `StorageMisc`: Miscellaneous settings
  - All data stored under `chrome.storage.local.all`

### Configuration

- **settings2.js**: Central configuration file
  - `items1` array: Defines all bookmark categories (label + hierarchical path)
  - `folderPrefixes`: Mapping for auto-folder creation (e.g., Kindle → K)
  - `folderDayPrefixes`: Paths for date-based folder organization
  - Grid layout settings: `getNumOfRows()` (5 columns), `getMax()` (400 items)

### Folder Management

- **`AddFolder`** (js/addfolder.js): Creates and organizes bookmark folders
  - `getOrCreateFolder(hier)`: Recursively creates folder hierarchy
  - `addFolderx()`: Creates monthly folders with prefixes (e.g., "K-202501")
  - `addDayFolderx()`: Creates date-based folder structure (Year/YYYYMM/YYYYMMDD)
  - Uses Promise-based Chrome Bookmarks API

### Utility Classes

- **`Util`** (js/util.js): Helper functions for UI and date manipulation
  - jQuery element creation (buttons, selects)
  - Date formatting (getMonthx, adjustAsStr)
  - URL parsing
  - Recently-used select management

## Migration Status

The codebase is currently migrating from function-based to class-based architecture:

- **Current**: `Globalx` class (js/globalx.js)
- **Legacy**: Function exports in js/global.js
- **Migration pattern**: Both files exist; new code should use Globalx

## Manifest V3 Specifics

All Chrome API calls return Promises (not callbacks). Key APIs used:
- `chrome.bookmarks.*` - Create, move, get bookmarks
- `chrome.storage.local.*` - Persist settings
- `chrome.tabs.*` - Query and manipulate tabs

## UI Structure

popup.html provides two-mode interface:
1. **Upper area** (`wrapper2`): Mode selection, current tab info, controls
2. **Lower area** (`#menu`): Dynamically generated grid of category buttons
   - Grid layout via CSS (5 columns)
   - Each category: button + dropdown select
   - Dropdowns populate with folder hierarchy when clicked

## Development Notes

### Code Style
- ES6 modules with explicit imports/exports
- JSDoc comments for all classes and methods (recently added)
- jQuery for DOM manipulation
- Hierarchical paths use forward slashes (e.g., `/Y1/ChatGPT/Agent/Agent-1`)

### Common Tasks

The extension has no build process. To test changes:
1. Edit JS/HTML/CSS files directly
2. Go to `chrome://extensions/` in Chrome
3. Click "Reload" on the extension card
4. Open the extension popup to test

To add new bookmark categories:
1. Edit `items1` array in config/settings2.js
2. Add entry: `['Label', '/hierarchical/path']`
3. Reload extension

### Key Workflows

**Saving a bookmark:**
1. User clicks category button (e.g., "ChatGPT0")
2. PopupManager calls `createOrMoveBKItem()`
3. Gets selected folder from dropdown
4. Creates bookmark via `chrome.bookmarks.create()`
5. Updates recently-used list via `Globalx.addRecentlyItem()`

**Folder hierarchy:**
- Root is Chrome's bookmark bar (id: '1')
- Hierarchical paths start with `/0/`, `/1/`, `/Y1/`, etc.
- Parent folders must exist before children (use `getOrCreateFolder()`)

## Important Constraints

- Hierarchical paths in `ItemHashByHier` are strings, not IDs
- Empty/null keys are rejected in `setItem()` and `setItemByHier()`
- Duplicate keys are silently ignored (returns null)
- The `data` singleton must be initialized before popup UI renders
