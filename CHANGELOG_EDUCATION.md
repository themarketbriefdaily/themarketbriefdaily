# Education Changelog

## Added
- Rebuilt `/education.html` as a dedicated Education hub with:
  - section coverage summary
  - usage guidance
  - beginner/exam/practitioner study paths
  - direct Unit 1 / Unit 2 entry points
- Added `/education-unit-1.html` for full Unit 1 structured delivery.
- Added `/education-unit-2.html` for full Unit 2 structured delivery.
- Added shared content model:
  - `/assets/data/education-units.js`
- Added shared education rendering and UX logic:
  - `/assets/education-units.js`
- Added shared long-form education styles:
  - `/assets/education-units.css`

## UX components implemented
- Sticky chapter navigation
- Per-unit progress indicator
- Expandable Exam Tip callouts
- Highlighted “In practice” cards
- Terminology tooltips / glossary-linked definitions
- End-of-chapter question accordion with model answers
- Mobile-friendly long-form reading layout

## Cross-unit continuity implemented
- Explicit Unit 1 → Unit 2 bridge section
- Shared glossary entries
- Dependency map (mastery order)

## Documentation added
- `CONTENT_MAP.md`
- `STYLE_GUIDE_EDUCATION.md`
- `CHANGELOG_EDUCATION.md`
