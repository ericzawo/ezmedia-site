import { DEFAULT_OPTIONS, imageToAsciiTextFrame, renderTextFrameToCanvas } from "asciify-engine/core";

(() => {
  "use strict";
  const artwork = document.querySelector(".artwork");
  const canvas = document.querySelector("#ascii");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const tokens = getComputedStyle(document.documentElement);
  const ink = tokens.getPropertyValue("--landscape-ink").trim();
  const events = new AbortController();
  const image = new Image();
  const prepared = document.createElement("canvas");
  const sample = prepared.getContext("2d", { willReadFrequently: true });
  if (!sample) return;
  const options = {
    ...DEFAULT_OPTIONS,
    fontSize: 4,
    charSpacing: .62,
    charAspect: .55,
    charset: " .:-=+*#%@",
    colorMode: "fullcolor",
    accentColor: ink,
    normalize: false,
    brightness: 0,
    contrast: 0,
    invert: false,
    animationStyle: "none",
    hoverStrength: 0,
  };
  let sourceFrame;
  let width = 0;
  let height = 0;
  let disposed = false;
  let resizeTimer;
  let prepareTimer;

  function rebuild() {
    const box = artwork.getBoundingClientRect();
    width = box.width;
    height = box.height;
    if (!width || !height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Center-crop the photo, preserving its proportions before ASCII sampling.
    const ratio = width / height;
    const cropWidth = Math.min(image.naturalWidth, image.naturalHeight * ratio);
    const cropHeight = cropWidth / ratio;
    prepared.width = Math.round(width * 2);
    prepared.height = Math.round(height * 2);
    sample.drawImage(image,
      (image.naturalWidth - cropWidth) / 2, (image.naturalHeight - cropHeight) / 2,
      cropWidth, cropHeight, 0, 0, prepared.width, prepared.height);
    // Lift shadows before mapping to characters, so the forest retains detail.
    const pixels = sample.getImageData(0, 0, prepared.width, prepared.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      for (let channel = 0; channel < 3; channel++) {
        pixels.data[i + channel] = 255 * (pixels.data[i + channel] / 255) ** .58;
      }
    }
    sample.putImageData(pixels, 0, 0);
    sourceFrame = imageToAsciiTextFrame(prepared, options, width, height);
    // Lift the source's shaded greens just enough to retain tree and ridge detail.
    // The subject remains entirely character-rendered, with no photo underneath.
    for (let i = 0; i < sourceFrame.colors.length; i += 4) {
      for (let channel = 0; channel < 3; channel++) {
        sourceFrame.colors[i + channel] = Math.min(235, 64 + sourceFrame.colors[i + channel] * .75);
      }
    }
    artwork.dataset.engine = "asciify-4.32.8";
    artwork.dataset.grid = `${sourceFrame.cols}x${sourceFrame.rowCount}`;
  }

  function draw(frame) {
    // Asciify owns the characters; the CSS ground supplies the negative space.
    renderTextFrameToCanvas(ctx, frame, options, width, height);
  }

  function settle() {
    if (sourceFrame) draw(sourceFrame);
    artwork.dataset.state = "settled";
  }

  let firstResize = true;
  const resize = new ResizeObserver(() => {
    if (firstResize) { firstResize = false; return; }
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (disposed || !sourceFrame) return;
      rebuild();
      settle();
    }, 100);
  });
  window.addEventListener("pagehide", event => {
    if (event.persisted) return;
    disposed = true;
    clearTimeout(prepareTimer);
    clearTimeout(resizeTimer);
    resize.disconnect();
    events.abort();
  }, { signal: events.signal });

  image.onload = () => {
    if (disposed) return;
    try {
      rebuild();
      if (!sourceFrame?.rowCount) throw new Error("Empty landscape frame");
      settle();
      artwork.classList.add("is-ready");
      resize.observe(artwork);
    } catch (error) {
      artwork.classList.remove("is-ready");
      artwork.dataset.state = "fallback";
      console.warn("The static ASCII landscape is being shown.", error);
    }
  };
  image.onerror = () => { artwork.dataset.state = "fallback"; };
  // The poster and inline logo fade immediately. Sample the responsive canvas
  // after that entrance, so image processing cannot delay its first frames.
  prepareTimer = setTimeout(() => {
    image.src = "./assets/landscape.jpg";
  }, 350);
})();
