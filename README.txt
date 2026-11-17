IQScore Fun - setup
FILES: upload EVERYTHING in this folder to the ROOT of your hosting (same level as index.html). Do not put the files inside another sub-folder.
FAVICON: favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png and site.webmanifest are already linked in every page. To use your own favicon.io files, just copy them into this folder with the SAME names (overwrite).
1. Domain is set to iqscore.fun in all files. If you pick a different domain, search & replace iqscore.fun everywhere. Create the mailbox contact@iqscore.fun (or change the email) before applying to AdSense.
2. Host on any static host (Cloudflare Pages, Netlify, GitHub Pages - all free) and connect your domain.
3. Apply for Google AdSense. When approved, paste the AdSense script in the <head> marked in each page and ad units in the 'AD SLOT' spots. Update ads.txt.
4. Add Google Search Console and submit sitemap.xml.

UPDATE (Nov 2026)
- Quiz flow: test.html -> test.html?q=1 ... ?q=20 -> calculating.html (5 sec) -> result.html. Answers/score live in sessionStorage.
- analytics.js: paste your Google Analytics 4 ID (G-XXXXXXXXXX). ?src=worker1 is saved for the whole visit (custom param "worker_src").
- Publytics removed. Monetag tag + sw.js (root) are in every page <head>.
