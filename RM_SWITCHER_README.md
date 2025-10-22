# Advanced RM Switcher - Implementation Guide

## Overview

The Advanced RM Switcher is a transverse navigation bar that lets users search, filter, and jump between Raw Materials (RM) without leaving the detail view. It provides a persistent top bar with command palette, keyboard shortcuts, saved views, and more.

## Features

### 1. **Pinned Top Bar (RMTopBar)**
- Always visible at the top of the RM detail view
- Shows current RM summary: Name • INCI • Status • Site • Supplier • Last Updated
- Height: 58px, sticky, z-index: 40
- Responsive: collapses on mobile with truncation and tooltips

**Key Controls:**
- ◀ ▶ Buttons: Navigate prev/next through current search results
- ⌘K Button: Open command palette
- ⭐ Button: Toggle favorite status
- History Button: Show recents & favorites popup
- Views Dropdown: Apply or manage saved views
- Compare Button: Quick compare with another RM
- Density Toggle: Switch between comfortable/compact display

### 2. **Command Palette (RMCommand)**
- Opens with **Cmd/Ctrl-K** globally
- Multi-criteria search with token-based filtering
- Features:
  - Free text fuzzy search
  - Field tokens (e.g., `inci:tocopherol`, `cas:10191-41-0`, `fourn:BASF`)
  - Facets for quick filtering (Status, Site, Supplier, Grade, Origin)
  - Virtualized result list (>200 items)
  - Live preview pane (spacebar to peek)
  - Keyboard navigation (↑/↓, Tab, Enter, ⌘Enter for new tab)
  - Recents & Favorites quick access

**Supported Field Tokens:**
```
inci: / ingredient:     - Search by INCI name
cas:                    - Search by CAS number
ec: / einecs:           - Search by EINECS/EC number
code: / mp:             - Search by MP code
fourn: / fournisseur:   - Search by supplier
site:                   - Search by production site
statut: / status:       - Filter by status
origine: / pays:        - Filter by origin country
grade:                  - Filter by grade
favorite: / favoris:    - Filter favorites
```

**Query Examples:**
```
tocopherol
inci:tocopherol cas:10191-41-0
fourn:BASF site:FR-LYO statut:approuvé
"geraniol" OR code:BER-2025-110
-statut:arrêté tocopherol
```

### 3. **Query Pills (RMQueryPills)**
- Shows active filter tokens as removable pills below the bar
- Remove a pill to update query and refresh results
- Scrollable horizontally; shows +N if many pills

### 4. **Recents & Favorites (RMRecentFavorites)**
- Popover triggered by "History" button on the bar
- Displays:
  - 5 most recent RMs visited
  - Favorite RMs (user-reorderable)
- Click to navigate; removes from recents with Backspace
- Favorites can be reordered via drag-and-drop

### 5. **Saved Views**
- Create named views from current query: "Save current query as view..."
- Views persist in localStorage
- Apply a view: fills in query and refreshes results
- Delete views from dropdown

### 6. **Peek Mode**
- Press **Spacebar** in command palette to peek at highlighted RM
- Temporarily updates top bar preview without navigating
- Press Spacebar again to cancel peek

### 7. **Keyboard Shortcuts**
| Key | Action |
|-----|--------|
| Cmd/Ctrl-K | Open command palette |
| ↑/↓ | Navigate results in palette |
| Enter | Navigate to selected RM |
| Cmd/Ctrl-Enter | Open selected RM in new tab |
| Space | Peek at highlighted RM (in palette) |
| Esc | Close palette |
| ← / → | Prev/Next RM (in top bar) |
| Backspace | Remove recent (in recents popover) |

### 8. **Analytics**
All interactions emit custom events:
```javascript
window.dispatchEvent(new CustomEvent('rm:analytics', {
  detail: { event: 'navigate_next', from: 'rm-1', to: 'rm-2' }
}))
```

Events tracked:
- `open_palette` - Command palette opened
- `execute_query` - Search executed
- `navigate_prev`, `navigate_next` - Top bar navigation
- `toggle_favorite` - Favorite toggled
- `open_recent`, `open_favorite` - Bookmark navigation
- `save_view`, `open_view`, `delete_view` - Saved view actions
- `toggle_density` - Density changed
- `peek_item` - Peek mode activated
- `compare_click` - Compare clicked

## File Structure

### Components
- **`components/rm/RMTopBar.tsx`** - Main pinned bar (client component)
- **`components/rm/RMCommand.tsx`** - Command palette overlay
- **`components/rm/RMQueryPills.tsx`** - Filter pills display
- **`components/rm/RMRecentFavorites.tsx`** - Recents/Favorites popover
- **`components/rm/RMDetailClient.tsx`** - Client wrapper for detail page (state & handlers)

### Utilities
- **`lib/rm-search.ts`** - Query parsing, tokenization, and search logic
- **`lib/rm-store.ts`** - State persistence (recents, favorites, views, density)
- **`lib/validators.ts`** - CAS/EC validation with Zod schemas

### Pages
- **`app/(protected)/raw-materials/[id]/page.tsx`** - Server component (async, fetches initial data)

## Data Flow

```
Page (Server)
├── Fetch material by ID
├── Parse query from URL (?q=...)
├── Compute initial search results
└── Pass to RMDetailClient

RMDetailClient (Client)
├── Render RMTopBar with initial state
├── Render RMCommand (hidden until opened)
├── Manage state: currentQuery, currentOrder, activeMaterial
└── Handle navigation: update URL, refresh search

User Interactions
├── Cmd/Ctrl-K → Open RMCommand
├── Type query → Real-time filtering & preview
├── Enter → Navigate & update URL with new query
├── Prev/Next → Compute neighbor from order, preserve query
└── Favorites/Views → Update state & localStorage
```

## URL Contract

All RM detail URLs preserve the search query:
```
/raw-materials/rm-20?q=inci:tocopherol cas:10191-41-0
/raw-materials/rm-1?q=fourn:BASF site:FR-LYO statut:approuvé
/raw-materials/rm-5  (no query = show all)
```

When navigating prev/next or from recents/favorites, the query parameter `?q=...` is preserved.

## Installation & Setup

### 1. Install Dependencies
All required packages should already be installed:
```bash
npm install sonner fuse.js @tanstack/react-table @tanstack/react-virtual
```

### 2. Verify Types
Ensure `@/shared/types` exports these types:
```typescript
type RawMaterial = {
  id: string
  commercialName: string
  code: string
  inci: string
  supplier: string
  site: string
  status: RMStatus
  updatedAt: string
  casEcPairs: CasEcPair[]
  favorite?: boolean
  // ... other optional fields
}

type RawMaterialBookmark = { id: string; title: string; timestamp: string }
type RawMaterialSavedView = { id: string; name: string; q: string }
```

### 3. Mock Data
The system uses in-memory mock data from `lib/rm-store.ts`:
- Seed data includes TOCOPHEROL, GERANIOL, and ~20 other RMs
- All validations work against mock data
- To integrate real API: update `listRawMaterials()` and other store functions

## Testing Guide

### Test 1: Basic Navigation
1. Go to `/raw-materials/rm-20`
2. Click Prev/Next buttons
3. Verify you stay on page but ID changes in URL

### Test 2: Command Palette Search
1. Press **Cmd/Ctrl-K**
2. Type `inci:tocopherol`
3. See filtered results with CAS/EC info
4. Press **Enter** to navigate
5. URL should update with `?q=inci:tocopherol`

### Test 3: Multi-Criteria Query
1. Open palette with **Cmd/Ctrl-K**
2. Type `fourn:BASF site:FR-LYO statut:approuvé`
3. Results filter in real-time
4. Facets toggle on/off
5. Navigate with arrow keys, press **Enter**

### Test 4: Favorites
1. Click ⭐ on top bar to add to favorites
2. Click History button, scroll to Favorites
3. Favorites list shows the item
4. Click to navigate back
5. Reload page; favorite persists

### Test 5: Saved Views
1. Type a query in the palette (e.g., `statut:approuvé`)
2. Click "Save current query as view..."
3. Enter a name (e.g., "Approved Materials")
4. Click Views dropdown on bar
5. Select the saved view
6. Query re-applies, results refresh
7. Reload page; view still available

### Test 6: Recents
1. Navigate to 3 different RMs using prev/next or search
2. Click History button
3. Recents section shows last 3 visited
4. Click one to navigate
5. Close popover; recents persist

### Test 7: Peek Mode
1. Open palette with **Cmd/Ctrl-K**
2. Type a query
3. Highlight a result
4. Press **Spacebar**
5. Top bar shows that RM's info temporarily
6. Press **Spacebar** again to cancel
7. Verify you're still on original RM

### Test 8: Query Pills
1. Search for `inci:tocopherol cas:10191-41-0`
2. Pills appear below bar showing both filters
3. Click X on one pill
4. Query updates, results refresh
5. Pills update dynamically

### Test 9: Keyboard Accessibility
1. Open palette with **Cmd/Ctrl-K**
2. Tab to facets section
3. Tab/Shift-Tab navigate facets
4. Enter toggles facet
5. Tab back to results
6. Arrow keys navigate
7. Screen reader announces counts and selections

### Test 10: Density Toggle
1. Click density toggle icon (list/filter icon)
2. Display switches between comfortable/compact
3. Reload page
4. Preference persists

### Test 11: Compare Button
1. Click "Comparer" button
2. (For now, opens second RM in new tab if `/raw-materials/compare` doesn't exist)
3. Preview shows comparison info

### Test 12: Mobile Responsive
1. Shrink viewport to <640px
2. Bar collapses; name truncates with tooltip
3. Some buttons hide on mobile
4. Palette still works
5. Verify touch-friendly sizes (44px minimum)

## Performance Optimization

### Virtualization
- Results list uses @tanstack/react-virtual
- Only renders visible rows (~10 per page)
- Handles 1000+ results smoothly

### Debouncing
- Search input debounced 150ms
- Prevents excessive re-renders while typing

### Caching
- Last search result cached by query string
- Subsequent search for same query returns cached result

### Code Splitting
- Command palette module can lazy-load on requestIdleCallback
- Optional: `/raw-materials/page.tsx` imports dynamically

## Accessibility (A11y)

### ARIA Labels & Roles
- Top bar buttons: `aria-label` ("Matière précédente", "Matière suivante", etc.)
- Command palette: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Results list: `role="listbox"`, children `role="option"`, `aria-selected`
- Pills: `role="button"`, `aria-pressed` when toggled

### Keyboard Navigation
- Global Cmd/Ctrl-K to open
- Roving tabindex in results (only highlighted item in tab order)
- Focus trap in modal
- Escape closes without saving temp state

### Screen Reader Support
- Dynamic aria-live announcements
  - "24 results for `inci:tocopherol`"
  - "Result 5 of 24: TOCOPHEROL • INCI • Approuvé"
- Semantic HTML (no divs pretending to be buttons)
- All form fields labeled

## Browser Support

- Chrome 120+
- Firefox 115+
- Safari 17+
- Edge 120+
- Mobile browsers (iOS Safari, Chrome Android)

## Troubleshooting

### Palette doesn't open
- Check browser console for errors
- Verify Cmd/Ctrl-K is not captured by browser/extension
- Try refreshing page

### Search not working
- Verify mock data loaded (`listRawMaterials()` returns array)
- Check query syntax (field tokens case-insensitive)
- Inspect Network tab if API involved

### Favorites not persisting
- Check localStorage is not blocked
- Browser DevTools → Application → Local Storage → check `rm:favorites`
- Clear cache and retry

### Results show incorrect order
- Verify `applySearch()` is returning correct order
- Check query parsing for typos
- Inspect ParsedQuery structure in console

## Future Enhancements

1. **API Integration**
   - Replace `lib/rm-store.ts` with API calls
   - Add `GET /api/raw-materials/search?q=...`
   - Add `PATCH /api/raw-materials/:id` for favorite toggle

2. **Advanced Filtering**
   - Date range filters: `updated:[2024-01-01..2024-12-31]`
   - Numeric ranges: `price:[100..1000]`
   - Regex support: `code:/^BER-.*$/`

3. **Export/Print**
   - Export search results as CSV/Excel
   - Print filtered list
   - Share query as URL/QR code

4. **Collaborative Features**
   - Share saved views with team
   - Synchronized favorites across sessions
   - Activity log of who viewed what

5. **ML-Powered Search**
   - Semantic search (vector embeddings)
   - Auto-complete suggestions
   - Typo correction

6. **Advanced Analytics**
   - Track most popular RMs
   - Trending searches
   - User search patterns

## Support

For issues or feature requests, contact the frontend team or file an issue in the project repository.

---

**Last Updated:** 2025-10-22
**Implementation Status:** ✅ Complete (Mock data / Local state)
**Ready for API Integration:** Yes
