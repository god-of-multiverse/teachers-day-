/**
 * A soft piano arrangement of Pachelbel's "Canon in D" (public domain),
 * synthesised live with the Web Audio API — no audio files required.
 */

type Note = { midi: number; beat: number; dur: number; vel?: number };

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// ── Chord progression (2 beats each): D A Bm F#m G D G A ──────────────
const BASS_ROOTS = [50, 45, 47, 42, 43, 38, 43, 45]; // D3 A2 B2 F#2 G2 D2 G2 A2
const CHORD_TONES: number[][] = [
  [62, 66, 69], // D
  [61, 64, 69], // A
  [62, 66, 71], // Bm
  [61, 66, 69], // F#m
  [62, 67, 71], // G
  [62, 66, 69], // D
  [62, 67, 71], // G
  [61, 64, 69], // A
];

// The famous first-violin melody, one bar (2 beats) per chord.
const MELODY_A: number[][] = [
  [78, 76], // F#5 E5
  [74, 73], // D5 C#5
  [71, 69], // B4 A4
  [71, 73], // B4 C#5
  [74, 73], // D5 C#5
  [71, 69], // B4 A4
  [67, 66], // G4 F#4
  [67, 64], // G4 E4
];

const MELODY_B: number[][] = [
  [62, 66, 69, 67], // D4 F#4 A4 G4
  [66, 62, 66, 64], // F#4 D4 F#4 E4
  [62, 59, 62, 69], // D4 B3 D4 A4
  [67, 71, 69, 67], // G4 B4 A4 G4
  [66, 62, 66, 69], // F#4 D4 F#4 A4
  [74, 73, 74, 71], // D5 C#5 D5 B4
  [74, 71, 74, 76], // D5 B4 D5 E5
  [78, 76, 74, 73], // F#5 E5 D5 C#5
];

const BEATS_PER_BAR = 2;
const BARS = 8;
const LOOP_BEATS = BEATS_PER_BAR * BARS; // 16 beats per pass

function buildPass(variation: number): Note[] {
  const notes: Note[] = [];
  for (let bar = 0; bar < BARS; bar++) {
    const t = bar * BEATS_PER_BAR;

    // bass note
    notes.push({ midi: BASS_ROOTS[bar], beat: t, dur: 1.9, vel: 0.5 });

    // soft chord on the off-beat
    CHORD_TONES[bar].forEach((m, i) =>
      notes.push({ midi: m - 12, beat: t + 1, dur: 1.0, vel: 0.16 + i * 0.01 }),
    );

    // melody
    if (variation === 0) {
      MELODY_A[bar].forEach((m, i) => notes.push({ midi: m, beat: t + i, dur: 0.95, vel: 0.62 }));
    } else {
      MELODY_B[bar].forEach((m, i) =>
        notes.push({ midi: m, beat: t + i * 0.5, dur: 0.48, vel: 0.5 }),
      );
    }
  }
  return notes;
}

const PASSES = [buildPass(0), buildPass(1)];

export class CanonPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private beat = 0;
  private pass = 0;
  private readonly tempo = 62; // bpm — slow and tender

  private get secPerBeat() {
    return 60 / this.tempo;
  }

  private setup() {
    if (this.ctx) return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();

    const master = ctx.createGain();
    master.gain.value = 0;

    // warm the tone down a little
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 4200;

    // gentle echo for space
    const delay = ctx.createDelay(1);
    delay.delayTime.value = this.secPerBeat * 0.75;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.24;
    const wet = ctx.createGain();
    wet.gain.value = 0.22;

    tone.connect(master);
    tone.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);
    master.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.voiceBus = tone;
  }

  private voiceBus: AudioNode | null = null;

  /** Plucked piano-ish voice: two detuned partials + fast attack, long decay. */
  private voice(midi: number, at: number, dur: number, vel: number) {
    const ctx = this.ctx!;
    const out = this.voiceBus!;
    const f = mtof(midi);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.linearRampToValueAtTime(vel, at + 0.012);
    env.gain.exponentialRampToValueAtTime(vel * 0.35, at + 0.16);
    env.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.9);
    env.connect(out);

    const partials: Array<[OscillatorType, number, number]> = [
      ["triangle", 1, 0.6],
      ["sine", 2, 0.22],
      ["sine", 3.01, 0.08],
    ];

    partials.forEach(([type, mult, amp]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = f * mult;
      osc.detune.value = (Math.random() - 0.5) * 6;
      const g = ctx.createGain();
      g.gain.value = amp;
      osc.connect(g);
      g.connect(env);
      osc.start(at);
      osc.stop(at + dur + 1.1);
    });
  }

  private schedule = () => {
    const ctx = this.ctx!;
    // look ahead ~0.5s and queue anything due
    while (this.nextTime < ctx.currentTime + 0.6) {
      const notes = PASSES[this.pass].filter(
        (n) => n.beat >= this.beat && n.beat < this.beat + 0.5,
      );
      for (const n of notes) {
        const at = this.nextTime + (n.beat - this.beat) * this.secPerBeat;
        this.voice(n.midi, at, n.dur * this.secPerBeat, n.vel ?? 0.5);
      }
      this.beat += 0.5;
      this.nextTime += 0.5 * this.secPerBeat;

      if (this.beat >= LOOP_BEATS) {
        this.beat = 0;
        this.pass = (this.pass + 1) % PASSES.length;
      }
    }
  };

  async play() {
    this.setup();
    const ctx = this.ctx!;
    await ctx.resume();
    this.nextTime = ctx.currentTime + 0.12;
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(0.5, ctx.currentTime, 0.6);
    if (this.timer === null) {
      this.schedule();
      this.timer = window.setInterval(this.schedule, 120);
    }
  }

  pause() {
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  dispose() {
    this.pause();
    void this.ctx?.close();
    this.ctx = null;
  }
}
