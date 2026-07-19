// Web Audio API Synthesizer for Loud Order Alarm Ringing
let audioCtx = null;
let ringInterval = null;

export const playLoudOrderRingSound = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Function to play a single high-pitch double bell chime pulse
    const playBellChime = () => {
      const now = audioCtx.currentTime;
      
      // Tone 1: High frequency bell (987.77 Hz - B5)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.8, now); // Loud volume
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Tone 2: Harmonious high bell (1318.51 Hz - E6)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.15);
      gain2.gain.setValueAtTime(0.9, now + 0.15); // Loud volume
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.75);
    };

    // Play immediately and repeat every 1.2 seconds for loud continuous ringing
    playBellChime();
    if (!ringInterval) {
      ringInterval = setInterval(playBellChime, 1200);
    }
  } catch (err) {
    console.error("Audio API error:", err);
  }
};

export const stopLoudOrderRingSound = () => {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
};
