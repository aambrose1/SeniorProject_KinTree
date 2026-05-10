export const delay = (ms) => new Promise((resolve) => {
  if (typeof requestAnimationFrame !== 'function' || typeof performance === 'undefined') {
    resolve();
    return;
  }

  const start = performance.now();

  const tick = (now) => {
    if (now - start >= ms) {
      resolve();
      return;
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
});
