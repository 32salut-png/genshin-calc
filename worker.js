// worker.js — モンテカルロ・最適配分探索をWebWorkerで実行

// --- 確率関数 ---
function charProb(n) {
  if (n >= 90) return 1;
  if (n >= 74) return Math.min(1, 0.006 + (n - 73) * 0.06);
  return 0.006;
}
function weapProb(n) {
  if (n >= 80) return 1;
  if (n >= 63) return Math.min(1, 0.007 + (n - 62) * 0.07);
  return 0.007;
}

// --- 1セット試行 ---
function runOneSetTrial(charPulls, weapPulls, charPity0, guaranteed0, weapPity0, fatePoint0, currentCon) {
  let pity = charPity0, guaranteed = guaranteed0;
  let copies = currentCon === -1 ? 0 : currentCon + 1;
  for (let i = 0; i < charPulls; i++) {
    pity++;
    if (Math.random() < charProb(pity)) {
      pity = 0;
      if (guaranteed) { copies++; guaranteed = false; }
      else { if (Math.random() < 0.5) copies++; else guaranteed = true; }
    }
  }
  const initialCopies = currentCon === -1 ? 0 : currentCon + 1;
  const obtained = copies - initialCopies;
  const finalCon = currentCon === -1
    ? (obtained >= 1 ? Math.min(6, obtained - 1) : -1)
    : Math.min(6, currentCon + obtained);

  let weapPity = weapPity0, fate = fatePoint0 === 1 ? 1 : 0, refines = 0;
  for (let i = 0; i < weapPulls; i++) {
    weapPity++;
    if (Math.random() < weapProb(weapPity)) {
      weapPity = 0;
      if (fate === 1) { refines++; fate = 0; }
      else { if (Math.random() < 0.375) { refines++; fate = 0; } else { fate = 1; } }
    }
  }
  return { finalCon, obtained, refines };
}

// --- 達成率推定 ---
function estimateSetRate(cp, wp, charPity0, guaranteed0, weapPity0, fatePoint0, currentCon, targetCon, targetRef, currentRef, sampleSize) {
  let ok = 0;
  for (let t = 0; t < sampleSize; t++) {
    const r = runOneSetTrial(cp, targetRef === 0 ? 0 : wp, charPity0, guaranteed0, weapPity0, fatePoint0, currentCon);
    if (targetRef === 0) {
      if (r.finalCon >= targetCon) ok++;
    } else {
      if (r.finalCon >= targetCon && r.refines + currentRef >= targetRef) ok++;
    }
  }
  return ok / sampleSize;
}

// --- キャンセルフラグ ---
let cancelled = false;

// --- メッセージハンドラ ---
onmessage = function(ev) {
  const { type, payload } = ev.data;
  if (type === 'cancel') { cancelled = true; return; }
  if (type !== 'run') return;
  cancelled = false;
  run(payload);
};

async function run(p) {
  const {
    totalPulls, charPity0, weapPity0, currentCon, targetCon,
    targetRef, currentRef, trials, mcGuaranteed, mcFatePoint
  } = p;

  // ① 最適配分探索
  let charPulls = totalPulls, weapPulls = 0;
  if (targetRef > 0) {
    let bestRate = -1, bestCp = 0;
    const COARSE = 20;
    for (let s = 0; s <= COARSE; s++) {
      if (cancelled) { postMessage({ type: 'cancelled' }); return; }
      const cp = Math.round((s / COARSE) * totalPulls);
      const rate = estimateSetRate(cp, totalPulls - cp, charPity0, mcGuaranteed, weapPity0, mcFatePoint, currentCon, targetCon, targetRef, currentRef, 2000);
      if (rate > bestRate) { bestRate = rate; bestCp = cp; }
      postMessage({ type: 'progress', pct: Math.round((s / COARSE) * 20) });
    }
    const range = Math.max(Math.round(totalPulls * 0.1), 5);
    const lo = Math.max(0, bestCp - range), hi = Math.min(totalPulls, bestCp + range);
    const FINE = 20;
    for (let s = 0; s <= FINE; s++) {
      if (cancelled) { postMessage({ type: 'cancelled' }); return; }
      const cp = Math.round(lo + (s / FINE) * (hi - lo));
      const rate = estimateSetRate(cp, totalPulls - cp, charPity0, mcGuaranteed, weapPity0, mcFatePoint, currentCon, targetCon, targetRef, currentRef, 5000);
      if (rate > bestRate) { bestRate = rate; bestCp = cp; }
      postMessage({ type: 'progress', pct: 20 + Math.round((s / FINE) * 20) });
    }
    charPulls = bestCp;
    weapPulls = totalPulls - charPulls;
  }

  postMessage({ type: 'progress', pct: 45 });

  // ② モンテカルロ本体
  const conCountGe = new Array(7).fill(0);
  let weapReachCnt = 0, setReachCnt = 0, charObtainedSum = 0;
  const MEDIAN_CAP = 50000;
  const charSample = [];
  const BATCH = Math.max(500, Math.ceil(trials / 100));
  for (let i = 0; i < trials; i += BATCH) {
    if (cancelled) { postMessage({ type: 'cancelled' }); return; }
    const batchEnd = Math.min(i + BATCH, trials);
    for (let t = i; t < batchEnd; t++) {
      const r = runOneSetTrial(charPulls, targetRef > 0 ? weapPulls : 0,
        charPity0, mcGuaranteed, weapPity0, mcFatePoint, currentCon);
      for (let c = 0; c <= 6; c++) { if (r.finalCon >= c) conCountGe[c]++; }
      if (targetRef > 0 && r.refines + currentRef >= targetRef) weapReachCnt++;
      if (r.finalCon >= targetCon && (targetRef === 0 || r.refines + currentRef >= targetRef)) setReachCnt++;
      charObtainedSum += r.obtained;
      if (charSample.length < MEDIAN_CAP) charSample.push(r.obtained);
    }
    postMessage({ type: 'progress', pct: 45 + Math.round((Math.min(i + BATCH, trials) / trials) * 35) });
  }

  // ③ 集計
  const conRates = {};
  for (let c = 0; c <= 6; c++) {
    if (currentCon !== -1 && c <= currentCon) continue;
    conRates[c] = conCountGe[c] / trials * 100;
  }
  const targetReachRate = (currentCon !== -1 && targetCon <= currentCon) ? 100 : (conRates[targetCon] ?? 0);
  const weapReachRate   = targetRef > 0 ? weapReachCnt / trials * 100 : null;
  const setReachRate    = targetRef > 0 ? setReachCnt / trials * 100 : null;
  const sortedChar = charSample.slice().sort((a, b) => a - b);
  const meanChar   = charObtainedSum / trials;
  const p50Char    = sortedChar[Math.floor((sortedChar.length - 1) * 0.5)];

  postMessage({ type: 'progress', pct: 82 });

  // ④ lineChart用シミュレーション
  const lineTrials = Math.min(trials, 50000);
  const STEPS = 10;
  const lineXLabels = [], lineCharRates = [], lineWeapRates = [], lineSetRates = [];
  for (let step = 0; step <= STEPS; step++) {
    if (cancelled) { postMessage({ type: 'cancelled' }); return; }
    const cp = Math.round((step / STEPS) * totalPulls);
    const wp = totalPulls - cp;
    lineXLabels.push(`C${cp}/W${wp}`);
    let cR = 0, wR = 0, sR = 0;
    for (let t = 0; t < lineTrials; t++) {
      const r   = runOneSetTrial(cp, targetRef > 0 ? wp : 0, charPity0, mcGuaranteed, weapPity0, mcFatePoint, currentCon);
      const cOk = r.finalCon >= targetCon;
      const wOk = targetRef === 0 ? true : r.refines + currentRef >= targetRef;
      if (cOk) cR++; if (wOk) wR++; if (cOk && wOk) sR++;
    }
    lineCharRates.push(parseFloat((cR / lineTrials * 100).toFixed(1)));
    lineWeapRates.push(parseFloat((wR / lineTrials * 100).toFixed(1)));
    lineSetRates.push(parseFloat((sR / lineTrials * 100).toFixed(1)));
    postMessage({ type: 'progress', pct: 82 + Math.round(((step + 1) / (STEPS + 1)) * 16) });
  }

  postMessage({ type: 'progress', pct: 99 });

  // ⑤ distChart用データ生成
  const obtainedToFinalCon = (obtained) => {
    if (currentCon === -1) return obtained >= 1 ? Math.min(6, obtained - 1) : -1;
    return Math.min(6, currentCon + obtained);
  };
  let maxObtained = 1;
for (let i = 0; i < charSample.length; i++) {
  if (charSample[i] > maxObtained) maxObtained = charSample[i];
}
  const rawBuckets = new Array(maxObtained + 1).fill(0);
  charSample.forEach(v => { rawBuckets[v]++; });
  const finalConBuckets = {};
  rawBuckets.forEach((count, obtained) => {
    const fc = obtainedToFinalCon(obtained);
    finalConBuckets[fc] = (finalConBuckets[fc] || 0) + count;
  });

  postMessage({
    type: 'result',
    data: {
      conRates, targetReachRate, weapReachRate, setReachRate,
      meanChar, p50Char, charPulls, weapPulls, totalPulls,
      lineXLabels, lineCharRates, lineWeapRates, lineSetRates,
      finalConBuckets, charSampleLength: charSample.length
    }
  });
}
