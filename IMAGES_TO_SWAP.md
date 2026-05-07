# Image swap guide — TBP-style theme

Every image slot in the new theme is currently a placeholder block (dark
gradient with all-caps label). To swap in your own images:

1. Drop the file into `assets/images/` (create the folder if missing).
2. Replace the matching `<div class="placeholder">…</div>` with an `<img>` tag.
3. Keep the surrounding `<div class="visual">` / `<div class="frame">` wrapper —
   that's what controls the aspect ratio, rounded corners, and hover scale.

## Slots, by page

### `index.html`

**Hero carousel — 8 frames** (auto-rotates every 3.6s)
Recommended size: **1920×1080** (16:9), JPG or AVIF.
Pick imagery that reads "asset management": London/NY skyline at dawn,
trading floor stills, chart abstractions, financial press archive shots,
exchange close-ups.

```html
<!-- Was: -->
<div class="frame active"><div class="placeholder">SLIDE 1</div></div>
<!-- Replace with: -->
<div class="frame active"><img src="/assets/images/hero-1.jpg" alt="" /></div>
```
Repeat for slides 2–8. Update the file paths.

**Method cards — 3 visuals**
Recommended size: **1200×900** (4:3), JPG.
- `assets/images/method-1.jpg` — market structure (e.g. order book, depth chart)
- `assets/images/method-2.jpg` — physical tightness (e.g. warehouse, metal bars)
- `assets/images/method-3.jpg` — macro transmission (e.g. yield curve abstract, central bank)

**Learn cards — 3 visuals**
Recommended size: **1200×900** (4:3), JPG.
- `assets/images/learn-1.jpg` — financial markets (exchange floor, ticker)
- `assets/images/learn-2.jpg` — asset classes (mixed asset still life)
- `assets/images/learn-3.jpg` — UK investing (City of London, calculator)

### `posts.html`

The research grid auto-pulls thumbnails from your Substack feed, so you
don't usually need to swap anything here. If a post has no thumbnail,
the placeholder `RESEARCH` shows by default.

### `investments.html`

**Fund visuals — 4 detail cards**
Recommended size: **1200×900** (4:3), JPG. Dark imagery works best because
the card pill (e.g. `MBD-MACRO`) sits on top with a translucent background.
- `assets/images/fund-macro.jpg`
- `assets/images/fund-struct.jpg`
- `assets/images/fund-supply.jpg`
- `assets/images/fund-fact.jpg`

### `about.html`

**Founder photo / monogram**
Currently shows a giant "M" on a black-to-blue gradient. To replace with a
real photo, find this block:
```html
<div class="frame active" style="background: linear-gradient(...); ...">
  <span style="...">M</span>
</div>
```
Replace with:
```html
<div class="frame active"><img src="/assets/images/founder.jpg" alt="Author portrait" /></div>
```
Recommended size: **800×1067** (3:4), JPG.

**Pillar cards — 3 visuals**
Recommended size: **1200×900** (4:3), JPG.
- `assets/images/pillar-1.jpg`, `pillar-2.jpg`, `pillar-3.jpg`

### `methodology.html`, `contact.html`, `disclaimer.html`

No image slots — these are text-led editorial pages.

---

## File-naming convention

Stick to this and the swaps stay consistent:

```
assets/
└── images/
    ├── hero-1.jpg ... hero-8.jpg        (homepage carousel)
    ├── method-1.jpg ... method-3.jpg    (homepage method cards)
    ├── learn-1.jpg ... learn-3.jpg      (homepage learn cards)
    ├── fund-macro.jpg                   (funds page)
    ├── fund-struct.jpg
    ├── fund-supply.jpg
    ├── fund-fact.jpg
    ├── founder.jpg                      (about page)
    ├── pillar-1.jpg ... pillar-3.jpg    (about page pillars)
    └── logo.png                         (already exists, used by old pages only)
```

## Image performance tips

- Compress JPGs to ~80% quality, AVIF if you have a build pipeline.
- Each hero frame should be < 200 KB. The carousel preloads all 8.
- Cards lazy-load (`loading="lazy"`) so they don't block first paint.
- Avoid stretching: images are `object-fit: cover`, so portraits in
  landscape slots will crop to the centre. Pre-crop if you want exact framing.

## Content sources (royalty-free options)

- **Unsplash** (`unsplash.com`) — free for commercial use, attribution
  appreciated. Search: "trading floor", "London skyline", "yield curve",
  "warehouse metal".
- **Pexels** (`pexels.com`) — free, no attribution required.
- **Public-domain archives** — Federal Reserve photos, NYSE press kits,
  LSE archives.
- **Your own** — phone photos at sunrise of any City building work
  surprisingly well after a slight desaturation pass.

Avoid generic AI-generated stock unless you've verified the licence
covers commercial use.
