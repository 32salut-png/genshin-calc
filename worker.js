// worker.js
// Web Worker 内で実行される MonteCarlo 実装（index.html の runMonteCarlo を移植したもの、要約結果を postMessage で返す）

// 簡易シードPRNG（再現性が欲しい場合に使用）
function XorShift32(seed = Date.now() & 0xffffffff) {
  let x = seed || 2463534242;
  return () => {
    x ^= (x << 13);
    x >>>= 0;
    x ^= (x >>> 17);
    x ^= (x << 5);
    x >>>= 0;
    return (x & 0xffffffff) / 0x100000000;
  };
}

// 確率関数（index.html と同じ）
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

// 1試行分の動作（index.html の runOneSetTrial と同等、乱数は rnd() を使用）
function runOneSetTrial(charPulls, weapPulls, charPity0, guaranteed0, weapPity0, fatePoint0, currentCon, rnd) {
  // キャラ
  let pity = charPity0;
  let guaranteed = guaranteed0;
  let copies = currentCon === -1 ? 0 : currentCon + 1;
  for (let i = 0; i < charPulls; i++) {
    pity++;
    if (rnd() < charProb(pity)) {
      pity = 0;
      if (guaranteed) { copies++; guaranteed = false; }
      else { if (rnd() < 0.5) copies++; else guaranteed = true; }
    }
  }
  const initialCopies = currentCon === -1 ? 0 : currentCon + 1;
  const obtained = copies - initialCopies;
  const finalCon = currentCon === -1
    ? (obtained >= 1 ? Math.min(6, obtained - 1) : -1)
    : Math.min(6, currentCon + obtained);

  // 武器
  let weapPity = weapPity0;
  let fate = fatePoint0 === 1 ? 1 : 0;
  let refines = 0;
  for (let i = 0; i < weapPulls; i++) {
    weapPity++;
    if (rnd() < weapProb(weapPity)) {
      weapPity = 0;
      if (fate === 1) {
        refines++; fate = 0;
      } else {
        if (rnd() < 0.375) { refines++; fate = 0; }
        else { fate = 1; }
      }
    }
  }
  return { finalCon, obtained, refines };
}

// 簡易的な estimateSetRate（OPTIMAL_SAMPLE はメインで渡す）
function estimateSetRate(cp, wp, charPity0, guaranteed0, weapPity0, fatePoint0, currentCon, targetCon, targetRef, currentRef, rnd, OPTIMAL_SAMPLE) {
  let ok = 0;
  for (let t = 0; t < OPTIMAL_SAMPLE; t++) {
    const r = runOneSetTrial(cp, targetRef === 0 ? 0 : wp, charPity0, guaranteed0, weapPity0, fatePoint0, currentCon, rnd);
    if (targetRef === 0) {
      if (r.finalCon >= targetCon) ok++;
    } else {
      if (r.finalCon >= targetCon && r.refines + currentRef >= targetRef) ok++;
    }
  }
  return ok / OPTIMAL_SAMPLE;
}

// Worker 側のキャンセルフラグ
let cancelRequested = false;

// メッセージ受信
onmessage = async (ev) => {
  const msg = ev.data;
  if (!msg || !msg.type) return;
  if (msg.type === 'cancel') { cancelRequested = true; return; }
  if (msg.type !== 'run') return;

  cancelRequested = false;
  const p = msg.payload || {};

  const totalPulls = p.totalPulls || 0;
  const charPity0  = p.charPity0 || 0;
  const weapPity0  = p.weapPity0 || 0;
  const currentCon = Number.isFinite(p.currentCon) ? p.currentCon : 0;
  const targetCon  = Number.isFinite(p.targetCon) ? p.targetCon : 0;
  const targetRef  = Number.isFinite(p.targetRef) ? p.targetRef : 0;
  const currentRef = Number.isFinite(p.currentRef) ? p.currentRef : 0;
  const trials     = p.trials || 10000;
  const mcGuaranteed = !!p.mcGuaranteed;
  const mcFatePoint  = p.mcFatePoint ? 1 : 0;
  const OPTIMAL_SAMPLE = p.OPTIMAL_SAMPLE || 50000;
  const seed = p.seed || (Date.now() & 0xffffffff);
  const rnd = XorShift32(seed);

  // 最適配分探索（targetRef>0 の場合のみ）
  let charPulls = totalPulls, weapPulls = 0;
  if (targetRef > 0) {
    postMessage({ type:'progress', pct: 5 });
    let bestRate = -1, bestCp = 0;
    const STEPS = 20;
    for (let*

