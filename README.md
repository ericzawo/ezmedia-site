# ezmedia

A small, single-page site. A 460 × 300 pixel alpine landscape rendered in ASCII, the original EZ monogram in white ASCII, and a contact line below. The composition is centered on warm paper and scales down on mobile.

Ready to host as static files. No framework, tracking, font downloads, or remote runtime dependencies. Visible copy uses Arial with system fallbacks. Asciify Engine 4.32.8 is bundled locally under the MIT license. The supplied logo PNG is preserved in `assets/ez-logo-source.png`.

The landscape fades in from 0 to 300 milliseconds after first paint. The EZ logo fades in from 700 to 1,000 milliseconds, so the background is fully visible at 0.3 seconds and the logo at one second. Neither entrance depends on JavaScript. Reduced-motion preferences show both immediately. The landscape uses Asciify's core conversion and canvas renderer, with no continuous animation.

The logo is converted from the supplied image by Asciify into a 56 × 38 character grid. Its white characters are embedded as inline SVG text using the system Courier New or monospace font. Its timed entrance works even without JavaScript. A pre-rendered ASCII landscape poster keeps the composition visible if the photograph or script fails to load. The favicon uses the supplied logo.

## Preview

Run this from this folder (a local server allows the browser to sample image pixels):

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:4173`.

## Publish on GitHub Pages

1. Create a GitHub repository for this site
2. Upload this folder's contents, keeping `index.html` at the repository root
3. In the repository, open Settings → Pages
4. Select Deploy from a branch, then `main` and the root folder
5. Save and wait for the published URL

All asset paths are relative, so the page also works at a GitHub project URL.

For your domain, first verify it in your GitHub account's Pages settings, then add it under the repository's Settings → Pages → Custom domain. Configure the DNS records at your domain provider using GitHub's current instructions below, then enable Enforce HTTPS. Keep your email's MX and TXT records intact. A `CNAME` file is intentionally omitted until the exact domain is confirmed.

- [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Connecting a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## Edit

- Copy and links: `index.html`
- Layout, colors, and type: `style.css`
- Fade duration: the `artwork-in` animation in `style.css`
- Landscape crop and Asciify settings: `src/logo.js`
- Logo conversion source: `src/monogram.js`; the generated text lives in `index.html`
- Original logo: `assets/ez-logo-source.png`
- Landscape source: `assets/landscape.jpg`
- Static ASCII fallback: `assets/landscape-ascii.webp`

`script.js` is the already-built browser bundle. Hosting requires no install or build step. After editing `src/logo.js`, rebuild it with:

```sh
npm ci
npm run build
```

The dependency versions are pinned. Publish `script.js` alongside the other static files; do not upload `node_modules`.

Asciify integration follows its [official agent skill](https://asciify.org/skill). Only the core conversion and renderer are imported; no Studio or GPU runtime is required.

## Photograph

“Granite peaks over a forested valley” by Luca Bravo, San Martin de Tor, Italy. Originally published on Unsplash on March 13, 2017, under CC0. The site includes a resized copy and renders it as characters.

- [Source and license record](https://commons.wikimedia.org/wiki/File:Granite_peaks_over_a_forested_valley_(Unsplash).jpg)
- [CC0 license](https://creativecommons.org/publicdomain/zero/1.0/)
