// Small audio event API; constructs Web Audio lazily and never fetches assets.
export function createAudio(context = null) {
  let audio = context;
  return { play(type, volume = 0.12) {
    if (typeof window === 'undefined') return false;
    try {
      audio ||= new window.AudioContext();
      if (audio.state === 'suspended') audio.resume();
      const tones = { hit: [110, 0.12], pickup: [660, 0.08], mission: [880, 0.24], shot: [180, 0.05], siren: [520, 0.16] };
      const [frequency, duration] = tones[type] || [330, 0.08], oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.frequency.value = frequency; gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audio.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration); return true;
    } catch { return false; }
  }, close() { if (audio && audio !== context) audio.close(); audio = context; } };
}
