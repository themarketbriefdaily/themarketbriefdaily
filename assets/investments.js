const FUNDS = [
  {
    id:"f1", code:"F1", name:"Fund I — Active", stage:"Active Rotation",
    desc:"Dynamic sector rotation across precious metals, ESG, and consumer staples driven by macro risk signals.",
    allocation:["GLD","ESGU","XLP"],
    r1y:12.45, bench:"XLP", benchR:9.15, color:"#60a5fa", scene:"gold",
    thesis:["Macro regime shifts alter sector leadership.","Precious metals hedge inflation + real rate compression.","Staples for defense during liquidity stress."]
  },
  {
    id:"f2", code:"F2", name:"Fund II — Tracker", stage:"Market-Cap Weighted",
    desc:"Broad market-cap weighted tracking via total market exposure (not SPY directly).",
    allocation:["VTI"],
    r1y:8.32, bench:"SPY", benchR:8.32, color:"#a78bfa", scene:"tracker",
    thesis:["Systematic broad-beta exposure.","Low-friction implementation.","Acts as core comparator sleeve."]
  },
  {
    id:"f3", code:"F3", name:"Fund III — Fama-French", stage:"Factor Tilt",
    desc:"Small-cap value tilt using classic factor premia and cyclical mean reversion.",
    allocation:["VBR","IJS"],
    r1y:15.67, bench:"SPY", benchR:8.32, color:"#f472b6", scene:"rocket",
    thesis:["Small/value premia can persist over long horizons.","Cyclical rebounds create asymmetric upside.","Diversifies large-cap growth concentration."]
  },
  {
    id:"f4", code:"F4", name:"Fund IV — ESG", stage:"Sustainability",
    desc:"Sustainability-screened multi-region sleeve across US and emerging exposures.",
    allocation:["ESGU","ESGV","ESGE"],
    r1y:9.18, bench:"ESGU", benchR:7.85, color:"#34d399", scene:"esg",
    thesis:["Quality/governance bias through ESG filters.","Secular transition themes with risk discipline.","Balanced developed + emerging opportunity set."]
  }
];

const charts = {};
const visLoops = new Map();

const fmtPct = n => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

function renderFunds(){
  const wrap = document.getElementById('fundsGrid');
  wrap.innerHTML = FUNDS.map(f=>{
    const rel = f.r1y - f.benchR;
    return `
      <article class="fund">
        <div class="visual-scene fund${f.id.slice(1)}">
          <div class="scene-inner" id="scene-${f.id}"></div>
        </div>
        <div class="panel">
          <div class="fund-top">
            <div>
              <div class="fund-code" style="color:${f.color}">${f.code}</div>
              <div class="fund-name">${f.name}</div>
              <div class="fund-stage">${f.stage}</div>
            </div>
          </div>

          <p class="desc">${f.desc}</p>

          <div class="stats">
            <div>
              <div class="stat-label">1Y Return</div>
              <div class="stat-value ${f.r1y>=0?'pos':'neg'}">
                <span class="dot" style="background:${f.r1y>=0?'var(--green)':'var(--red)'}"></span>${fmtPct(f.r1y)}
              </div>
            </div>
            <div>
              <div class="stat-label">vs ${f.bench}</div>
              <div class="stat-value ${rel>=0?'pos':'neg'}">
                <span class="dot" style="background:${rel>=0?'var(--green)':'var(--red)'}"></span>${fmtPct(rel)}
              </div>
            </div>
          </div>

          <div class="alloc">${f.allocation.map(t=>`<span class="tag">${t}</span>`).join('')}</div>

          <div class="mini">
            <div class="mini-title">Performance vs Benchmark</div>
            <div class="mini-sub">${f.code} (solid) vs ${f.bench} (dashed)</div>
            <div class="mini-chart-wrap"><canvas id="chart-${f.id}"></canvas></div>
            <div class="legend">
              <span><i style="background:${f.color}"></i>${f.code}</span>
              <span><i style="background:rgba(148,163,184,.7)"></i>${f.bench}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderThesis(){
  const wrap = document.getElementById('thesisGrid');
  wrap.innerHTML = FUNDS.map(f=>`
    <article class="thesis">
      <h3>${f.name}</h3>
      <ul>${f.thesis.map(x=>`<li>${x}</li>`).join('')}</ul>
    </article>
  `).join('');
}

// ---------- Rich SVG scenes ----------
function sceneGold(){
  return `
  <svg viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cf" cx="30%" cy="25%"><stop offset="0%" stop-color="#fff4c2"/><stop offset="45%" stop-color="#f7b733"/><stop offset="100%" stop-color="#9f5c00"/></radialGradient>
      <linearGradient id="ce" x1="0" x2="1"><stop offset="0" stop-color="#7a4300"/><stop offset=".5" stop-color="#d98a16"/><stop offset="1" stop-color="#6f3c00"/></linearGradient>
    </defs>
    <ellipse cx="450" cy="470" rx="260" ry="24" fill="rgba(0,0,0,.35)"/>
    <g class="c1"><ellipse cx="350" cy="360" rx="96" ry="32" fill="url(#ce)"/><circle cx="350" cy="330" r="94" fill="url(#cf)"/><circle cx="320" cy="300" r="18" fill="rgba(255,255,255,.42)"/></g>
    <g class="c2"><ellipse cx="560" cy="390" rx="108" ry="34" fill="url(#ce)"/><circle cx="560" cy="355" r="106" fill="url(#cf)"/><circle cx="525" cy="322" r="20" fill="rgba(255,255,255,.45)"/></g>
    <g class="c3"><ellipse cx="455" cy="250" rx="118" ry="38" fill="url(#ce)"/><circle cx="455" cy="210" r="116" fill="url(#cf)"/><circle cx="415" cy="175" r="24" fill="rgba(255,255,255,.5)"/></g>
    <rect x="-300" y="0" width="180" height="520" fill="rgba(255,255,255,.16)" transform="skewX(-25)" class="shine"/>
    <style>
      .c1{animation:f1 6s ease-in-out infinite}.c2{animation:f2 7s ease-in-out infinite}.c3{animation:f3 8s ease-in-out infinite}
      @keyframes f1{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}
      @keyframes f2{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
      @keyframes f3{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      .shine{animation:sweep 3.6s linear infinite}
      @keyframes sweep{from{transform:translateX(0) skewX(-25deg)}to{transform:translateX(1400px) skewX(-25deg)}}
    </style>
  </svg>`;
}

function sceneTracker(){
  return `
  <svg viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bar" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="#5b21b6"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs>
    <g opacity=".22">${Array.from({length:120}).map((_,i)=>`<circle cx="${80+(i*53)%740}" cy="${70+(i*37)%300}" r="${(i%3)+1.2}" fill="#c4b5fd"/>`).join("")}</g>
    <g transform="translate(180,110)">
      <rect x="0" y="210" width="90" height="170" fill="url(#bar)" class="b1"/>
      <rect x="120" y="140" width="90" height="240" fill="url(#bar)" class="b2"/>
      <rect x="240" y="90" width="90" height="290" fill="url(#bar)" class="b3"/>
      <rect x="360" y="40" width="90" height="340" fill="url(#bar)" class="b4"/>
      <polyline points="45,210 165,140 285,90 405,40" fill="none" stroke="#ddd6fe" stroke-width="5" class="trend"/>
    </g>
    <style>
      .b1,.b2,.b3,.b4{transform-origin:bottom;animation:grow .9s cubic-bezier(.2,.9,.2,1) both}
      .b2{animation-delay:.08s}.b3{animation-delay:.16s}.b4{animation-delay:.24s}
      @keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
      .trend{stroke-dasharray:900;stroke-dashoffset:900;animation:draw 1.4s ease .35s forwards}
      @keyframes draw{to{stroke-dashoffset:0}}
    </style>
  </svg>`;
}

function sceneRocket(){
  return `
  <svg viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7ab6"/><stop offset=".55" stop-color="#ec4899"/><stop offset="1" stop-color="#9d174d"/></linearGradient></defs>
    ${Array.from({length:50}).map((_,i)=>`<circle cx="${(i*71)%860+20}" cy="${(i*41)%220+20}" r="${(i%2)+1}" fill="#93c5fd" opacity=".45"/>`).join("")}
    <g transform="translate(460,220)" class="rw">
      <ellipse cx="0" cy="0" rx="62" ry="92" fill="url(#rb)"/>
      <circle cx="0" cy="-34" r="18" fill="#60a5fa"/>
      <polygon points="-62,35 -105,72 -55,58" fill="#be185d"/>
      <polygon points="62,35 105,72 55,58" fill="#be185d"/>
      <path d="M-22,95 Q0,190 22,95 Z" fill="#f59e0b" class="f1"/>
      <path d="M-12,95 Q0,165 12,95 Z" fill="#fbbf24" class="f2"/>
    </g>
    <style>
      .rw{animation:bob 2.6s ease-in-out infinite}
      @keyframes bob{0%,100%{transform:translate(460px,220px)}50%{transform:translate(460px,196px)}}
      .f1{animation:ff1 .22s ease-in-out infinite}.f2{animation:ff2 .18s ease-in-out infinite}
      @keyframes ff1{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.3)}}
      @keyframes ff2{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.7)}}
    </style>
  </svg>`;
}

function sceneESG(){
  return `
  <svg viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="sun" cx="50%" cy="50%"><stop offset="0" stop-color="#fff59d"/><stop offset=".5" stop-color="#facc15"/><stop offset="1" stop-color="#ca8a04"/></radialGradient></defs>
    <circle cx="720" cy="90" r="44" fill="url(#sun)" class="sun"/>
    <g class="tree">
      <rect x="418" y="260" width="64" height="170" fill="#92400e"/>
      <circle cx="450" cy="170" r="96" fill="#10b981"/>
      <circle cx="372" cy="220" r="72" fill="#0d9488"/>
      <circle cx="528" cy="220" r="72" fill="#0d9488"/>
    </g>
    <g class="leaves">${Array.from({length:14}).map((_,i)=>`<ellipse cx="${360+i*18}" cy="${150+(i%4)*18}" rx="5" ry="8" fill="#34d399" class="leaf l${i}"/>`).join("")}</g>
    <g class="squirrel">
      <ellipse cx="560" cy="360" rx="26" ry="18" fill="#a16207"/>
      <circle cx="586" cy="350" r="12" fill="#b45309"/>
      <circle cx="592" cy="348" r="2.4" fill="#111827"/>
      <path d="M540,350 C515,320 530,280 565,292" stroke="#92400e" stroke-width="11" fill="none" stroke-linecap="round"/>
    </g>
    <style>
      .tree{transform-origin:450px 430px;animation:sway 3.8s ease-in-out infinite}
      @keyframes sway{0%,100%{transform:rotate(0)}50%{transform:rotate(2.2deg)}}
      .sun{opacity:.35;transition:.35s}.leaf{opacity:0}.squirrel{opacity:0;transition:.25s}
    </style>
  </svg>`;
}

function attachScenes(){
  FUNDS.forEach(f=>{
    const target = document.getElementById(`scene-${f.id}`);
    if(!target) return;
    if(f.scene==="gold") target.innerHTML = sceneGold();
    if(f.scene==="tracker") target.innerHTML = sceneTracker();
    if(f.scene==="rocket") target.innerHTML = sceneRocket();
    if(f.scene==="esg") target.innerHTML = sceneESG();

    if(f.scene==="esg"){
      const scene = target.closest('.visual-scene');
      scene.addEventListener('mouseenter', ()=>{
        const sun = target.querySelector('.sun');
        const sq = target.querySelector('.squirrel');
        sun.style.opacity = "1"; sun.style.transform = "scale(1.06)";
        sq.style.opacity = "1";
        target.querySelectorAll('.leaf').forEach((leaf,i)=>{
          leaf.style.animation = `fall 2.1s linear ${i*0.05}s forwards`;
        });
      });
      scene.addEventListener('mouseleave', ()=>{
        const sun = target.querySelector('.sun');
        const sq = target.querySelector('.squirrel');
        sun.style.opacity = ".35"; sun.style.transform = "scale(1)";
        sq.style.opacity = "0";
        target.querySelectorAll('.leaf').forEach((leaf)=>{
          leaf.style.animation = "none";
        });
      });
      // inject keyframes once
      if(!document.getElementById('leaf-fall-style')){
        const st=document.createElement('style');
        st.id='leaf-fall-style';
        st.textContent='@keyframes fall{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(30px,220px) rotate(220deg)}}';
        document.head.appendChild(st);
      }
    }
  });
}

// charts
function makeSeries(seed=1, drift=0.001, vol=0.008, n=64){
  let v=100, out=[];
  for(let i=0;i<n;i++){
    const noise=(Math.sin((i+seed)*1.13)+Math.cos((i+seed)*0.73))*0.5;
    v*=(1+drift+noise*vol*0.2);
    out.push(v);
  }
  return out;
}
function renderMiniChart(f){
  const ctx=document.getElementById(`chart-${f.id}`).getContext('2d');
  const labels=Array.from({length:64},(_,i)=>i+1);
  const a=makeSeries(f.id.charCodeAt(1),0.0015,0.012);
  const b=makeSeries(f.id.charCodeAt(1)+11,0.0011,0.009);

  if(charts[f.id]) charts[f.id].destroy();
  charts[f.id]=new Chart(ctx,{
    type:'line',
    data:{labels,datasets:[
      {data:a,borderColor:f.color,backgroundColor:f.color+'22',borderWidth:2,pointRadius:0,tension:.35,fill:true},
      {data:b,borderColor:'rgba(148,163,184,.75)',borderDash:[6,5],borderWidth:1.6,pointRadius:0,tension:.35,fill:false}
    ]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{enabled:false}},
      scales:{x:{display:false},y:{display:false}}
    }
  });
}

function init(){
  renderFunds();
  renderThesis();
  attachScenes();
  FUNDS.forEach(renderMiniChart);
}
document.addEventListener('DOMContentLoaded', init);
