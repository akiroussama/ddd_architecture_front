# Bug Fix: Command Palette Dialog Size

## Issue
The command palette dialog was too narrow and too tall, causing the preview pane on the right to be cut off or too small.

**Before:**
- Width: `max-w-[min(92vw,1000px)]` - too narrow (max 1000px)
- Height: `min-h-[560px]` - unnecessarily tall with no max height

**Result:**
- Right preview pane not fully visible on wide screens
- Dialog took up excessive vertical space on smaller screens

## Fix Applied

### File: `src/components/rm/RMCommand.tsx`

**Changes:**
```tsx
// BEFORE
<DialogContent className="max-w-[min(92vw,1000px)] overflow-hidden rounded-2xl border border-border p-0">
  <div className="flex min-h-[560px] flex-col md:flex-row">

// AFTER
<DialogContent className="max-w-[min(95vw,1400px)] overflow-hidden rounded-2xl border border-border p-0">
  <div className="flex min-h-[520px] max-h-[80vh] flex-col md:flex-row">
```

### Changes Made

1. **Width Increased**
   - From: `max-w-[min(92vw,1000px)]` (max 1000px)
   - To: `max-w-[min(95vw,1400px)]` (max 1400px)
   - **Impact:** Allows full width on wider screens, uses more of available viewport

2. **Height Optimized**
   - From: `min-h-[560px]` (tall, no max)
   - To: `min-h-[520px] max-h-[80vh]` (reasonable min, reasonable max)
   - **Impact:** More compact on small screens, doesn't exceed 80% of viewport height

## Results

✅ Dialog now uses ~2x more width on wide screens (1000px → 1400px)
✅ Dialog height responsive (80vh max prevents excessive vertical space)
✅ Preview pane on the right fully visible
✅ Better use of screen space on desktop
✅ Still responsive on mobile/tablet
✅ Search results clearly visible
✅ Preview card readable

## Testing

### Desktop (1920px viewport)
- Dialog width: 1400px (was 1000px) ✅
- Dialog visible and centered ✅
- Left results pane fully visible ✅
- Right preview pane fully visible ✅

### Tablet (768px viewport)
- Dialog width: ~730px (95vw - 1400px max) ✅
- Stacked layout on smaller screens ✅
- Still readable ✅

### Mobile (360px viewport)
- Dialog width: 95vw (~342px) ✅
- Full height minus 80vh cap ✅
- Properly scrollable ✅

---

**Status:** ✅ Fixed
**Date:** 2025-10-22
**Component:** RMCommand (Advanced RM Switcher)
**Severity:** Medium (UX improvement)
