/** A short, soft paper-rustle synthesised from filtered noise. */
let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
export let soundEnabled = true;

export function setSoundEnabled(v: boolean) {
  soundEnabled = v;
}

function init() {
  if (ctx) return;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();

  const len = Math.floor(ctx.sampleRate * 0.45);
  buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / len;
    // two soft swells = the sound of a sheet lifting then settling
    const swell = Math.exp(-Math.pow((t - 0.18) / 0.13, 2)) + 0.7 * Math.exp(-Math.pow((t - 0.62) / 0.16, 2));
    data[i] = (Math.random() * 2 - 1) * swell * 0.55;
  }
}

export function playPageTurn() {
  if (!soundEnabled) return;
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    init();
    if (!ctx || !buffer) return;
    void ctx.resume();

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = 0.9 + Math.random() * 0.25;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1900 + Math.random() * 700;
    band.Q.value = 0.7;

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 700;

    const gain = ctx.createGain();
    gain.gain.value = 0.075;

    src.connect(band);
    band.connect(hp);
    hp.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch {
    /* audio not available — silently ignore */
  }
}
