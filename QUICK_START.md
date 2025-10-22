# Advanced RM Switcher - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Start the Dev Server
```bash
npm run dev
```
Then open `http://localhost:3000`

### 2. Navigate to RM Detail Page
Go to any raw material detail page:
```
http://localhost:3000/raw-materials/rm-20
```

You should see:
- **Top Bar** with RM info (name • INCI • status • site • supplier • updated)
- **Prev/Next buttons** on the left
- **Search, History, Views, Compare buttons** on the right

### 3. Open the Command Palette
Press **Cmd/Ctrl-K** anywhere on the page.

A modal should appear with:
- Search input at the top
- Facets below (Status, Site, Supplier, Grade, Origin)
- Results list (initially showing all RMs)

### 4. Try a Search
Type one of these queries:

#### Simple Free Text
```
tocopherol
```
Results filter in real-time showing all RMs matching "tocopherol"

#### Field Token Search
```
inci:tocopherol
```
Shows only RMs where INCI contains "tocopherol"

#### Multi-Criteria
```
fourn:BASF site:FR-LYO statut:approuvé
```
Filters by supplier AND site AND status

#### CAS Number Search
```
cas:10191-41-0
```
Shows RM with that specific CAS number

#### Exact Phrase
```
"alpha tocopherol"
```
Exact match (not fuzzy)

#### Exclude Results
```
tocopherol -statut:arrêté
```
Find "tocopherol" but exclude "Arrêté" status

### 5. Navigate from Search Results
1. Type your query
2. Use **↑/↓ arrow keys** to highlight a result
3. Press **Enter** to navigate
4. URL updates to preserve your query: `/raw-materials/rm-5?q=inci:tocopherol`

### 6. Try Peek Mode
1. Open palette (**Cmd/Ctrl-K**)
2. Highlight a result
3. Press **Spacebar** to peek
4. Top bar temporarily shows that RM's info
5. Press **Spacebar** again to cancel

### 7. Navigate with Prev/Next
1. Do a search (see URL has `?q=...`)
2. Click the **◀ Previous** or **▶ Next** buttons on the top bar
3. You traverse only the results from your search
4. The query persists in the URL

### 8. Add to Favorites
1. Click the **⭐ Star** button on the top bar
2. It should fill (become gold/highlighted)
3. Click **History** button
4. See your starred RM in the "Favorites" section

### 9. Save a View
1. Do a search: `statut:approuvé`
2. In the command palette, click "Save current query as view..."
3. Name it (e.g., "Approved Only")
4. Click Views dropdown on the bar
5. Click your saved view → query re-applies

### 10. Access Recents
1. Navigate to 3 different RMs
2. Click **History** button
3. See them listed under "Recents"
4. Click one to go back (preserves current query)

---

## 🎯 Common Tasks

### Switch between RMs without closing the detail view
1. Press **Cmd/Ctrl-K**
2. Type a new query or scroll results
3. Press **Enter** to navigate
✅ You stay on the detail page, just the material changes

### Find by CAS number
```
Press Cmd/Ctrl-K
Type: cas:10191-41-0
Press Enter
```

### Filter by supplier and site
```
Press Cmd/Ctrl-K
Type: fourn:BASF site:FR-LYO
Results auto-filter
```

### See what's approved and active
```
Press Cmd/Ctrl-K
Type: statut:approuvé statut:actif
(or use facets: click Status, toggle "Approuvé" and "Actif")
```

### Quick compare two materials
1. On Material A, note its details
2. Click **Comparer** button → opens Material B
3. Now you can see both (compare in your head or use browser tabs)

---

## ⌨️ Keyboard Shortcuts

| Key | What It Does |
|-----|--------------|
| **Cmd/Ctrl-K** | Open/close command palette |
| **↑ / ↓** | Navigate results in palette |
| **Enter** | Go to highlighted RM |
| **Cmd/Ctrl-Enter** | Open in new tab |
| **Space** | Peek at highlighted RM |
| **Esc** | Close palette |
| **← / →** | Previous/Next RM (from top bar) |
| **Tab** | Move to facets/results |
| **Backspace** | Remove recent (in History popover) |

---

## 🔍 Query Language Reference

### Free Text (Fuzzy Match)
```
tocopherol
geraniol
alpha beta
```

### Field Tokens (case-insensitive)
```
inci:tocopherol       # By INCI name
cas:10191-41-0        # By CAS number
ec:233-466-0          # By EINECS number
code:BER-2025-110     # By MP code
fourn:BASF            # By supplier (or "supplier:")
fournisseur:BASF      # (French alias)
site:FR-LYO           # By production site
statut:approuvé       # By status (or "status:")
statut:actif
statut:"en revue"
origine:france        # By origin country (or "pays:", "origin:")
grade:pharmaceutical  # By grade
favorite:true         # Show only favorites
```

### Operators
```
term1 term2           # AND (both must match)
term1 OR term2        # OR (either matches)
-term                 # NOT / exclude (prefix with -)
-statut:arrêté        # Exclude archived
"exact phrase"        # Exact match (not fuzzy)
'single quotes work'  # Also for exact
```

### Example Queries
```
inci:tocopherol cas:10191-41-0
→ Find TOCOPHEROL with that specific CAS

fourn:BASF site:FR-LYO statut:approuvé
→ BASF materials from Lyon that are approved

geraniol OR code:BER-2025-110
→ Either GERANIOL OR that specific code

tocopherol -statut:arrêté
→ TOCOPHEROL but exclude archived items

"alpha tocopherol" grade:pharmaceutical
→ Exact phrase AND pharmaceutical grade
```

---

## 📊 Mock Data

The system includes ~25 pre-loaded raw materials:

- **TOCOPHEROL** - CAS 10191-41-0, EC 233-466-0
- **GERANIOL** - CAS 97-47-4, EC 960-99-5
- **CITRAL** - CAS 5392-40-5
- Plus ~22 more with various grades, suppliers, sites, and statuses

All mock data is in `lib/rm-store.ts` — you can add more there or integrate a real API.

---

## 🐛 Troubleshooting

### Q: Command palette won't open
**A:**
- Check browser console (F12) for errors
- Make sure you're pressing **Cmd** (Mac) or **Ctrl** (Windows/Linux)
- Try a page refresh

### Q: Search not working
**A:**
- Verify your query syntax (e.g., `cas:10191-41-0` not `cas: 10191-41-0`)
- Field tokens are case-insensitive but values should match data
- Try just typing a word like `tocopherol`

### Q: Favorites don't save
**A:**
- Check that localStorage is enabled in your browser
- In DevTools → Application → Local Storage → look for `rm:favorites`
- Try clearing browser cache and reloading

### Q: Prev/Next buttons are disabled
**A:**
- You're at the first or last RM in the current search results
- Do a new search and try again

### Q: URLs not preserving query
**A:**
- Check that `?q=...` appears in the URL bar after navigating
- If missing, try searching from the command palette and navigating with Enter

---

## 📚 More Information

For **comprehensive documentation**, see **`RM_SWITCHER_README.md`** in this directory.

Topics covered there:
- File structure and data flow
- All features in detail
- Performance optimization
- Accessibility (A11y)
- Full testing guide (12 test scenarios)
- Future enhancements
- API integration roadmap

---

## 🎓 What You Can Do Now

✅ Search by INCI, CAS, EC, Code, Supplier, Site, Status
✅ Fuzzy text search
✅ Multi-criteria filtering
✅ Prev/Next through search results
✅ Save favorite materials
✅ Create and apply saved views
✅ Recents history (last 5 visited)
✅ Keyboard shortcuts for power users
✅ Fully accessible (WCAG)
✅ Mobile responsive
✅ Peek mode to preview without navigating

---

## 🚀 Next Steps

1. **Try the examples above** - get familiar with queries
2. **Read the full README** - `RM_SWITCHER_README.md`
3. **Test all features** - use the 12-step testing guide
4. **Integrate your API** - replace mock data in `lib/rm-store.ts`
5. **Customize** - modify colors, labels, seeds, etc.

---

**Happy searching! 🎉**

Need help? Check the full documentation or reach out to the frontend team.
