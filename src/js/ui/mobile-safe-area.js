// Create by LamberthRumpaidus
// Controls can remain above the Netlify mobile badge and browser chrome.
(function () {
  'use strict';
  const root = document.documentElement;
  function viewportSafeArea() {
    const vv = window.visualViewport;
    // The actual visual viewport may be smaller than the layout viewport on mobile Safari.
    const occlusion = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
    root.style.setProperty('--landlord-viewport-occlusion', Math.min(120, Math.round(occlusion)) + 'px');
    root.classList.toggle('landlord-phone-landscape', matchMedia('(pointer:coarse) and (orientation:landscape)').matches);
  }
  addEventListener('resize', viewportSafeArea, { passive: true });
  addEventListener('orientationchange', viewportSafeArea, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', viewportSafeArea, { passive: true });
    window.visualViewport.addEventListener('scroll', viewportSafeArea, { passive: true });
  }
  viewportSafeArea();
})();
