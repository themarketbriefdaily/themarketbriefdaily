(function () {
  const DATA_URL = '/data/funds-history.json';
  let dataPromise;

  function fetchData() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL).then(res => res.json());
    }
    return dataPromise;
  }

  function normalizePeriod(text) {
    if (!text) return '';
    const t = text.toLowerCase().trim();
    if (t.includes('since')) return 'si';
    if (t === '5y' || t === '3y' || t === '1y') return t;
    return t;
  }

  function resolvePeriod(button) {
    return button?.dataset?.period || normalizePeriod(button?.textContent || '');
  }

  function buildOptions(config) {
    const yTickCallback = config.valueType === 'percent'
      ? (v) => `${v.toFixed(0)}%`
      : (config.yTickCallback || undefined);
    const xTickOptions = {
      color: '#5c5a56'
    };
    if (config.xTickMaxRotation !== undefined) {
      xTickOptions.maxRotation = config.xTickMaxRotation;
    }
    if (config.xTickMaxTicksLimit !== undefined) {
      xTickOptions.maxTicksLimit = config.xTickMaxTicksLimit;
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#9a9690',
            font: { size: 11 }
          }
        }
      },
      scales: {
        x: {
          ticks: xTickOptions,
          grid: { color: 'rgba(255,255,255,0.04)' }
        },
        y: {
          ticks: {
            color: '#5c5a56',
            callback: yTickCallback
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
        }
      }
    };
  }

  window.initFundChart = async function initFundChart(config) {
    const canvas = document.getElementById(config.canvasId || 'perfChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const tabs = Array.from(document.querySelectorAll(config.tabSelector || '.chart-tab'));
    const data = await fetchData();
    const fundData = data?.funds?.[config.fundId];
    if (!fundData) return;

    const availablePeriods = Object.keys(fundData.timeframes || {});
    if (availablePeriods.length === 0) return;

    const activeTab = tabs.find(tab => tab.classList.contains('active')) || tabs[0];
    let currentPeriod = resolvePeriod(activeTab) || availablePeriods[0];
    if (!fundData.timeframes[currentPeriod]) {
      currentPeriod = availablePeriods[0];
    }

    function getSeries(period) {
      return fundData.timeframes[period] || fundData.timeframes[availablePeriods[0]];
    }

    const initial = getSeries(currentPeriod);
    const chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: initial.labels,
        datasets: [
          {
            label: config.fundLabel || fundData.fundLabel,
            data: initial.fund,
            borderColor: config.fundColor,
            backgroundColor: config.fundFill,
            fill: true,
            tension: config.tension ?? 0.4,
            pointRadius: config.fundPointRadius ?? 3,
            pointBackgroundColor: config.fundColor,
            borderWidth: config.fundBorderWidth ?? 2
          },
          {
            label: config.benchmarkLabel || fundData.benchmarkLabel,
            data: initial.benchmark,
            borderColor: config.benchmarkColor,
            backgroundColor: 'transparent',
            fill: false,
            tension: config.tension ?? 0.4,
            pointRadius: config.benchmarkPointRadius ?? 0,
            borderWidth: config.benchmarkBorderWidth ?? 1,
            borderDash: config.benchmarkDash || [4, 4]
          }
        ]
      },
      options: Object.assign(buildOptions(config), config.options || {})
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(btn => btn.classList.remove('active'));
        tab.classList.add('active');
        const period = resolvePeriod(tab);
        const series = getSeries(period);
        if (!series) return;
        chart.data.labels = series.labels;
        chart.data.datasets[0].data = series.fund;
        chart.data.datasets[1].data = series.benchmark;
        chart.update();
      });
    });
  };
})();
