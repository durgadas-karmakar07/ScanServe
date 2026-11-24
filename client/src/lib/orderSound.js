// A short two-note chime for new orders, made with the Web Audio API (no sound file to load).
// Browsers allow sound only after a tap on the page, so the kitchen screen has a
// "Turn on sound" button that calls enableSound() once.
let context = null;

export function isSoundAvailable() {
  return Boolean(window.AudioContext || window.webkitAudioContext);
}

export async function enableSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  context ??= new AudioContextClass();
  await context.resume();
  playChime();
  return context.state === 'running';
}

export function isSoundOn() {
  return context?.state === 'running';
}

// Two rising notes, played twice so it is heard over a busy kitchen.
export function playChime() {
  if (!isSoundOn()) return;
  const start = context.currentTime;
  [0, 0.9].forEach((repeat) => {
    [880, 1175].forEach((frequency, index) => {
      const at = start + repeat + index * 0.2;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.5, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.4);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.45);
    });
  });
}
