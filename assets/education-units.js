(function () {
  const data = window.EDUCATION_UNITS;
  if (!data) return;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function withTooltips(text) {
    if (!text) return '';
    return text.replace(/\[\[(.+?)::(.+?)\]\]/g, (_, term, def) =>
      `<span class="edu-tooltip" tabindex="0" title="${escapeHtml(def)}" data-tip="${escapeHtml(def)}" aria-label="${escapeHtml(term)}: ${escapeHtml(def)}">${escapeHtml(term)}<span class="edu-visually-hidden">: ${escapeHtml(def)}</span></span>`
    );
  }

  function li(items) {
    return (items || []).map((item) => `<li>${withTooltips(item)}</li>`).join('');
  }

  function qaHtml(questions) {
    return (questions || [])
      .map((q, index) => {
        const alphaLabel = (i) => (i < 26 ? String.fromCharCode(65 + i) : `Option ${i + 1}`);
        const options = q.options
          .map((opt, i) => `<li>${alphaLabel(i)}. ${withTooltips(opt)}</li>`)
          .join('');
        const wrong = (q.wrongReasons || []).map((r) => `<li>${withTooltips(r)}</li>`).join('');
        return `
          <details>
            <summary>Question ${index + 1}: ${withTooltips(q.question)}</summary>
            <ol>${options}</ol>
            <div class="edu-qa-answer">
              <strong>Answer:</strong> ${alphaLabel(q.answerIndex)}
              <p>${withTooltips(q.reasoning)}</p>
              <strong>Why alternatives are weaker</strong>
              <ul>${wrong}</ul>
            </div>
          </details>
        `;
      })
      .join('');
  }

  function scenarioHtml(scenarios) {
    return (scenarios || [])
      .map(
        (s, index) => `
          <article class="edu-box scenario-set">
            <h4>Scenario ${index + 1}: ${withTooltips(s.title)}</h4>
            <p>${withTooltips(s.summary)}</p>
            <p><strong>Decision focus:</strong> ${withTooltips(s.decisionFocus)}</p>
          </article>
        `
      )
      .join('');
  }

  function chapterHtml(chapter, idx) {
    const core = (chapter.coreConcepts || [])
      .map(
        (c) => `
        <article>
          <h4>${withTooltips(c.heading)}</h4>
          <p><strong>Plain-language:</strong> ${withTooltips(c.plain)}</p>
          <p><strong>Technical:</strong> ${withTooltips(c.technical)}</p>
          <p><strong>Application:</strong> ${withTooltips(c.application)}</p>
          <p><strong>Risk/compliance caveat:</strong> ${withTooltips(c.caveats)}</p>
        </article>
      `
      )
      .join('');

    return `
      <section class="edu-chapter" id="${chapter.id}" data-chapter>
        <div class="edu-pill-row"><span class="edu-pill">Chapter ${idx + 1}</span></div>
        <h2>${withTooltips(chapter.title)}</h2>
        <p>${withTooltips(chapter.intro)}</p>

        <h3 class="edu-subhead">Why this matters</h3>
        <p>${withTooltips(chapter.whyThisMatters)}</p>

        <h3 class="edu-subhead">Learning outcomes</h3>
        <ul>${li(chapter.learningOutcomes)}</ul>

        <h3 class="edu-subhead">Core concepts (progressive depth)</h3>
        <div class="edu-core">${core}</div>

        <div class="edu-box in-practice">
          <h4>In practice: ${withTooltips(chapter.inPractice.title)}</h4>
          <p>${withTooltips(chapter.inPractice.body)}</p>
        </div>

        <div class="edu-box case-study">
          <h4>${withTooltips(chapter.caseStudy.title)}</h4>
          <p>${withTooltips(chapter.caseStudy.summary)}</p>
        </div>

        <h3 class="edu-subhead">Scenario set</h3>
        ${scenarioHtml(chapter.scenarioSets)}

        <details class="edu-box exam-tip">
          <summary><strong>Exam Tip (expand)</strong></summary>
          <p>${withTooltips(chapter.examTip)}</p>
        </details>

        <h3 class="edu-subhead">Common misunderstandings</h3>
        <ul>${li(chapter.commonMisunderstandings)}</ul>

        <h3 class="edu-subhead">Practical checklist</h3>
        <ul>${li(chapter.practicalChecklist)}</ul>

        <h3 class="edu-subhead">Chapter roundup</h3>
        <ul>${li(chapter.roundup)}</ul>

        <h3 class="edu-subhead">Knowledge-check questions</h3>
        <div class="edu-accordion">${qaHtml(chapter.questions)}</div>
      </section>
    `;
  }

  function renderUnit(unitKey) {
    const unit = data.units[unitKey];
    if (!unit) return;

    const heading = document.getElementById('unitHeading');
    const subtitle = document.getElementById('unitSubtitle');
    const framing = document.getElementById('unitFraming');
    const chapters = document.getElementById('chapterList');
    const chapterNav = document.getElementById('chapterNav');
    const bridge = document.getElementById('bridgeText');
    const reading = document.getElementById('unitReading');
    const difficulty = document.getElementById('unitDifficulty');
    const chapterCount = document.getElementById('unitChapterCount');

    heading.textContent = unit.title;
    subtitle.textContent = unit.subtitle;
    framing.textContent = unit.framing;
    bridge.textContent = unit.bridgeToNextUnit;
    reading.textContent = unit.estimatedReadingTime;
    difficulty.textContent = unit.difficulty;
    chapterCount.textContent = String(unit.chapters.length);

    chapters.innerHTML = unit.chapters.map(chapterHtml).join('');
    chapterNav.innerHTML = unit.chapters
      .map((c, i) => `<a href="#${c.id}">${i + 1}. ${c.title}</a>`)
      .join('');

    const glossary = document.getElementById('glossaryList');
    if (glossary) {
      glossary.innerHTML = data.sharedGlossary
        .map((item) => `<li><strong>${item.term}:</strong> ${item.definition}</li>`)
        .join('');
    }

    const dep = document.getElementById('dependencyList');
    if (dep) {
      dep.innerHTML = data.dependencyMap
        .map((row) => `<li><strong>${row.stage}</strong><ul>${li(row.items)}</ul></li>`)
        .join('');
    }

    const progressMeter = document.getElementById('chapterProgress');
    const progressText = document.getElementById('chapterProgressText');
    const navLinks = [...document.querySelectorAll('#chapterNav a')];
    const chaptersNode = [...document.querySelectorAll('[data-chapter]')];

    function setProgress(active) {
      const value = active ? Math.round((active / unit.chapters.length) * 100) : 0;
      if (progressMeter) progressMeter.value = value;
      if (progressText) progressText.textContent = `${active}/${unit.chapters.length} chapters viewed`;
    }

    if ('IntersectionObserver' in window) {
      const seen = new Set();
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              seen.add(entry.target.id);
              navLinks.forEach((a) => a.classList.remove('active'));
              const activeLink = chapterNav.querySelector(`a[href="#${entry.target.id}"]`);
              if (activeLink) activeLink.classList.add('active');
              setProgress(seen.size);
            }
          });
        },
        { rootMargin: '-15% 0px -70% 0px' }
      );
      chaptersNode.forEach((node) => obs.observe(node));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const key = document.body.getAttribute('data-unit-key');
    if (key) {
      renderUnit(key);
    } else if (document.getElementById('chapterList')) {
      console.warn('data-unit-key attribute missing on <body> tag. Cannot render education unit content.');
    }

    document.querySelectorAll('.nav-dropdown').forEach((dd) => {
      const toggle = dd.querySelector('.nav-drop-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = dd.classList.contains('open');
        document.querySelectorAll('.nav-dropdown.open').forEach((o) => o.classList.remove('open'));
        if (!open) dd.classList.add('open');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.nav-dropdown.open').forEach((o) => o.classList.remove('open'));
    });
  });
})();
