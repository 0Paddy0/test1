// Multiple Window 3D Scene – Launcher
const form = document.getElementById('cfg');
const btnClose = document.getElementById('closeAll');
let children = [];
const channel = new BroadcastChannel('mw3d');

btnClose.addEventListener('click', () => {
  for (const w of children) { try { w.close(); } catch {} }
  children = [];
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  for (const w of children) { try { w.close(); } catch {} }
  children = [];

  const n = Math.max(2, Math.min(6, parseInt(document.getElementById('count').value || '2', 10)));
  const tileW = parseInt(document.getElementById('w').value || '640', 10);
  const tileH = parseInt(document.getElementById('h').value || '360', 10);

  const left0 = (screen.availLeft || 0) + 40;
  const top0  = (screen.availTop  || 0) + 60;

  for (let i = 0; i < n; i++) {
    const features = `popup=yes,width=${tileW},height=${tileH},left=${left0 + i*tileW},top=${top0}`;
    const url = `renderer.html?i=${i}&n=${n}`;
    const win = window.open(url, '_blank', features);
    if (win) children.push(win);
  }

  setTimeout(() => {
    const layout = {
      type: 'layout',
      total: { w: tileW * children.length, h: tileH },
      tiles: Array.from({ length: children.length }, (_, i) => ({ i, x: i * tileW, y: 0, w: tileW, h: tileH }))
    };
    channel.postMessage(layout);
  }, 400);

  const t0 = performance.now();
  function tick() {
    channel.postMessage({ type: 'time', t: (performance.now() - t0) / 1000 });
    requestAnimationFrame(tick);
  }
  tick();
});

window.addEventListener('pointermove', (e) => {
  channel.postMessage({ type: 'pointer', relLauncher: true, x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
});
