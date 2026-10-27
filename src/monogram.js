import { DEFAULT_OPTIONS, imageToAsciiTextFrame } from "asciify-engine/core";

// Build-time conversion. The resulting inline SVG paints before runtime JS loads.
export function createMonogram(image) {
  const width = 585;
  const height = 736;
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const ctx = mask.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 346, 274, width, height, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    // The supplied logo is black on lime (red channel 224). Preserve its edges.
    const ink = Math.max(0, 1 - pixels.data[i] / 224) * 255;
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = ink;
    pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  const frame = imageToAsciiTextFrame(mask, {
    ...DEFAULT_OPTIONS,
    fontSize: width / 56,
    charSpacing: 1,
    charAspect: .55,
    charset: " .:-=+*#%@",
    colorMode: "accent",
    accentColor: "#ffffff",
    normalize: false,
    invert: false,
  }, width, height);
  const lineHeight = height / frame.rowCount;
  const fontSize = width / frame.cols / .6;
  const lines = frame.rows.map((row, i) =>
    `<text x="0" y="${((i + .8) * lineHeight).toFixed(2)}" textLength="${width}" lengthAdjust="spacingAndGlyphs">${row}</text>`
  ).join("\n");
  return `<svg class="logo" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false" data-grid="${frame.cols}x${frame.rowCount}">\n<g fill="#fff" font-family="'Courier New', monospace" font-size="${fontSize.toFixed(3)}" xml:space="preserve">\n${lines}\n</g>\n</svg>`;
}
