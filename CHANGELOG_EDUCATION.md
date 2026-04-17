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

## Batch 2 depth pass
- Expanded every Unit 1 and Unit 2 chapter with a dedicated multi-scenario set (2 scenarios per chapter).
- Increased question-bank volume to a baseline of 3 knowledge-check questions per chapter.
- Preserved model-answer reasoning and “why alternatives are weaker” explanations for all added questions.
- Updated renderer to display chapter scenario sets in the long-form reading flow.

## Batch 3 depth pass
- Expanded every Unit 1 and Unit 2 chapter scenario set from 2 to 3 applied scenarios.
- Increased per-chapter question-bank volume from 3 to 4 knowledge-check questions.
- Preserved model-answer structure for all new questions (answer key, reasoning, weaker-alternative explanations).
- Updated documentation baselines to reflect Batch 3 depth standards.
