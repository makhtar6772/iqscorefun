/* IQScore Fun - analytics + worker tracking (free: Google Analytics 4)
   1. Create a free GA4 property at analytics.google.com and paste your Measurement ID below (looks like G-ABCDE12345).
   2. Worker tracking: send workers to  https://iqscore.fun/?src=worker1  (worker2, worker3 ...).
      The src value is kept in sessionStorage so it stays attached to every page the visitor opens
      (test.html?q=1 ... result.html), even though ?src= is no longer in the URL. */
(function () {
  var GA_ID = "G-ERN1G1R7LV";   /* <-- PASTE YOUR GA4 MEASUREMENT ID HERE */

  var src = "";
  try {
    var p = new URLSearchParams(location.search).get("src");
    if (p) { src = p.replace(/[^a-zA-Z0-9_\-]/g, "").slice(0, 40); sessionStorage.setItem("iqs_src", src); }
    else { src = sessionStorage.getItem("iqs_src") || ""; }
  } catch (e) {}

  window.IQS_SRC = src;
  if (!GA_ID || GA_ID.indexOf("XXXX") !== -1) return;     /* not configured yet */

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  var s = document.createElement("script");
  s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  gtag("js", new Date());
  var cfg = {};
  if (src) { cfg.worker_src = src; }
  gtag("set", "user_properties", { worker_src: src || "direct" });
  gtag("config", GA_ID, cfg);
})();
