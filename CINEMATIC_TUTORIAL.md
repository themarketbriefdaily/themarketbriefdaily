# Cinematic Asset-Management Site — Tutorial

A six-step recipe for transforming an asset-management site into a cinematic,
"unreal-looking" experience. This is the exact process applied to
`index.html` in this repo, and it is reusable for any other page.

The new system lives in two files plus markup hooks:

- `assets/cinematic.css` — depth layers, masks, vignette, grain, easings
- `assets/cinematic.js` — scroll + pointer parallax, Ken Burns, tilt, title rise
- `index.html` — page restructured into a **layered scene** with depth tiers

---

## 1. Plan scenes with photo + motion blends

Treat the page as a **camera moving through a film**. Before writing code,
write the storyboard:

| Scene | Beat | Camera move | Layers |
|------:|------|-------------|--------|
| Hero  | Open on city at dawn | slow dolly-in + sun bloom | sky · sun · haze · far skyline · mid skyline · near skyline · lens flare |
| Funds | Pull back to data | parallax up + grid fade-in | section canvas · grid cards (tilt + flip) |
| Insights | Pan across stories | Ken Burns on cards | gradient mat · card image (zoom) |
| About | Final dolly-out | mask wipe in from top | abstract atmospheric layer |

Every section is a **scene**, every visible element belongs to a **depth tier**:
`sky → haze → far → mid → near → foreground`. The tier dictates how fast it
moves on scroll and on pointer.

---

## 2. Cut out photos and layer foreground/background depth

Instead of a single hero image, the hero is now a **stack of layers** inside
`<div class="cine-stage">`:

```html
<div class="cine-stage" data-cine-stage>
  <div class="cine-layer" data-depth="sky"  data-cine-parallax data-speed="-0.05" data-pointer="0.4"></div>
  <div class="cine-layer" data-depth="haze" data-cine-parallax data-speed="0.05"  data-pointer="0.8"></div>
  <div class="cine-layer" data-depth="far"  data-cine-parallax data-speed="0.10"  data-pointer="2"><svg class="cine-skyline far"  …/></div>
  <div class="cine-layer" data-depth="mid"  data-cine-parallax data-speed="0.18"  data-pointer="4"><svg class="cine-skyline mid"  …/></div>
  <div class="cine-layer" data-depth="near" data-cine-parallax data-speed="0.30"  data-pointer="7"><svg class="cine-skyline near" …/></div>
  <div class="cine-layer" data-depth="foreground" data-pointer="-3"><div class="cine-flare"></div></div>
</div>
```

Notes:
- **SVG silhouettes** stand in for cut-out photos — vector layers stay sharp,
  weigh nothing, and parallax cleanly. Replace any layer with a PNG cut-out
  later if you want real photography (just keep the same `data-*` attributes).
- `data-depth` controls `z-index`. `data-speed` controls scroll parallax.
  `data-pointer` controls cursor parallax (higher = moves more).
- Tiny window-light dots on the mid skyline simulate a busy financial district.

---

## 3. Animate images with pan, zoom, tilt, and parallax

Three effects do all the heavy lifting:

**A. Scroll parallax** (`assets/cinematic.js`):

```js
for (const el of scrollLayers) {
  const speed  = parseFloat(el.dataset.speed || '0.15');
  const rect   = el.getBoundingClientRect();
  const offset = (rect.top + rect.height/2) - window.innerHeight/2;
  const ty     = -offset * speed;
  el.style.transform = `translate3d(0, ${ty}px, 0)`;
}
```

**B. Pointer parallax** — depth layers chase the cursor with a damped lerp
(`currX += (targetX - currX) * 0.06`) so the move feels weighty, not jittery.

**C. Ken Burns** — any image inside `.cine-kb` slowly zooms + pans once it
enters view. CSS does the work:

```css
.cine-kb > img {
  position: absolute; inset: -8%;
  transform: scale(1.04);
  transition: transform 14s cubic-bezier(.22,1,.36,1);
}
.cine-kb.in-view > img {
  transform: scale(1.18) translate(-2%, -2%);
}
```

An `IntersectionObserver` adds `.in-view` when the element scrolls into frame.

**D. 3D tilt on cards** — any element with `class="cine-tilt"` gets a
perspective tilt that follows the cursor, plus a moving specular highlight via
`--mx / --my` CSS variables.

---

## 4. Smooth masks, fades, and transitions between sections

Every section is wrapped in `cine-section` with optional mask wipes:

```html
<section class="news-section cine-section">
  <div class="cine-mask-top"></div>
  …
  <div class="cine-mask-bottom"></div>
</section>
```

The masks are simple linear gradients pinned to the top/bottom of the section
that fade content in and out — they look like cross-dissolves between scenes.

Plus a global **vignette** + **film grain** layer covering the whole page:

```html
<body>
  <div class="cine-overlay"></div>
  <div class="cine-grain"></div>
  …
```

The grain is an inline SVG `feTurbulence` noise that cycles on a 6-step
animation — cheap, no image asset required, and impossible to compress away.

---

## 5. Custom CSS for realistic movement timing

Three reusable cubic-bezier easings (declared as CSS custom properties so any
animation can opt in):

```css
--cine-ease-camera: cubic-bezier(.16,.84,.32,1);   /* dolly-in */
--cine-ease-glide:  cubic-bezier(.22,1,.36,1);     /* drifting motion */
--cine-ease-dolly:  cubic-bezier(.65,0,.35,1);     /* hard pull / push */
```

Why these matter:
- Linear movement always reads as "computer animation".
- `ease-camera` accelerates fast then settles — that's the lift of a
  Steadicam coming to rest.
- `ease-glide` is mostly slow with a long tail — that's a Ken Burns crawl.
- Combine timing differences across depth tiers (sky 9s, flare 14s, sun 9s
  alternate) so nothing ever syncs up. Asynchrony = cinema.

Title reveals are split into per-word spans with staggered delays:

```css
.cine-title .cine-word { animation: cineTitleRise 1.3s var(--cine-ease-camera) forwards; }
@keyframes cineTitleRise { to { transform: translateY(0); opacity: 1; } }
```

`cinematic.js` does the splitting at runtime — keep your HTML clean.

---

## 6. Launch a site that feels cinematic and premium

Final-pass checklist before shipping:

- [ ] **Reduced-motion**. The CSS has a `@media (prefers-reduced-motion: reduce)`
      block that disables grain, sun breath, flare drift, title rise, and Ken
      Burns. Verify by toggling OS-level reduce-motion.
- [ ] **Performance**. All transforms use `translate3d` / `scale` only, with
      `will-change: transform`. Avoid animating `top/left/width/height`.
- [ ] **Layer count**. 6 depth tiers is plenty. More layers = more paint cost.
- [ ] **Z-indices**. Hero content sits at `z-index: 10`. The site vignette sits
      at `1500`, grain at `1501`. Modals must sit above (`2200+`).
- [ ] **Mobile**. Pointer parallax silently no-ops on touch. Test on a phone
      to confirm scroll parallax still feels good and skylines aren't crushed.
- [ ] **Accessibility**. All decorative scene layers carry `aria-hidden="true"`.
      Skyline SVGs are inline so they inherit color but contribute no a11y
      noise.

### How to apply this to other pages in the repo

For any page (e.g. `funds.html`, `posts.html`):

1. Add `<link rel="stylesheet" href="/assets/cinematic.css">` to `<head>`.
2. Add the two overlays at the top of `<body>`:
   ```html
   <div class="cine-overlay" aria-hidden="true"></div>
   <div class="cine-grain" aria-hidden="true"></div>
   ```
3. Mark hero images with `class="cine-kb"` (Ken Burns).
4. Mark cards / panels with `class="cine-tilt" data-tilt="6"` for the
   pointer-following 3D tilt, and add `<div class="cine-tilt-shine"></div>`
   inside for the moving highlight.
5. Add the script before `</body>`:
   ```html
   <script src="/assets/cinematic.js" defer></script>
   ```

That's the whole stack. Total added weight: one CSS file (~5 KB), one JS
file (~3 KB), zero new image assets.
