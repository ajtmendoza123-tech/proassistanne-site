# What's New — Round 2 Updates 🌸

Hi Anne! Here's what changed in this latest update.

## ✅ Issues Fixed

### 1. "View Details" stays stuck — FIXED
The View Details button opened the side drawer fine, but closing it didn't
let you go back to the sample card. Now the close button (and clicking
outside) properly returns you to whatever was open underneath — the
subcategory modal, the pillar modal, or the page itself. The scroll lock
is correctly maintained the whole way down.

### 2. File type labels removed
You no longer see "PDF", "VIDEO", "GIF", "SPREADSHEET", or "GOOGLE DOC"
badges on sample card overlays. The cards stay clean regardless of what
file format you upload.

### 3. Format-agnostic placeholders
The mock placeholder text on samples used to say things like "30+ pages",
"Vertical video", "Looping animation" — which only made sense for
specific formats. Those have been rewritten to be neutral:
- "Multi-page layout" instead of "30+ pages"
- "Mobile-friendly format" instead of "Vertical video"
- "Eye-catching motion" instead of "Looping animation"
- "Step-by-step walkthrough" instead of "Screen recording"

So when you swap a placeholder `.jpg` for an `.mp4` (or vice versa), you
don't have to change the description text. Just swap the filename.

### 4. Free Resources on home — bigger and more visible
The slim 1-row strip is gone. In its place: a proper full-width card
section with two columns:

**Left column (cream/pink):**
- 💛 emoji in a circle
- "For Fellow VAs" eyebrow tag
- Big serif headline: *Free Resources — Made by a VA, for VAs*
- **Your personal message:** "I wish I had these when I started. I know
  how hard it is to figure everything out alone — so I want to share my
  knowledge and the tools that took me years to build. **All of it, free.**"
- Three meta dots (6 resources · No email required · 100% free forever)
- Pill-shaped pink CTA button

**Right column (dark ink):**
- "What's Inside" header
- All 5 resources listed with icons + descriptions
- Subtle hover effect on each item

The floating side tab is still there for visitors browsing other pages,
so they always have one-click access to your resources.

---

## 📁 Files Updated

| File | Where it goes |
|---|---|
| `index.html` | root |
| `portfolio.html` | root |
| `main.js` | `js/` folder |

(`styles.css` did NOT change. Don't replace it.)

After uploading: hard-refresh with **Ctrl+Shift+R** (or **Cmd+Shift+R**).

---

## 📌 Quick Reminder — How to Add Your Real Files

The system supports **any** of these formats automatically — it reads the
file extension and picks the right viewer:

- Images: `.jpg` `.jpeg` `.png` `.webp` `.svg` → shows inline
- Animated: `.gif` → plays inline
- Documents: `.pdf` → opens in lightbox
- Videos: `.mp4` `.mov` `.webm` → plays inline with controls
- Cloud: Google Drive/Docs/Sheets URLs → opens in new tab

**To replace a placeholder:**
1. Drop your file in the `images/` folder (any name, any extension)
2. Open `js/main.js`, search for the sub-service ID (e.g. `smm-instagram`)
3. Find the `samples:[...]` array
4. Change `src:'images/iggrid1.jpg'` → `src:'images/whatever-you-named-it.mp4'`
5. Save, upload, hard-refresh

That's it. No other changes needed. The renderer figures out the rest.

---

Made with care 💛
