/**
 * BoundUp Web Audio Engine & Sound FX Generator
 * Synthesizes real-time sound effects (notification chimes, call ringtones, like pops, video audio controls)
 */
(function(window) {
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Ringtone timer reference
  let ringtoneInterval = null;
  let ringbackInterval = null;

  const BoundUpSound = {
    // Enable audio context on user interaction
    init() {
      getAudioContext();
    },

    // Sweet double-tone notification chime for incoming messages / alerts
    playNotification() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        // Frequency sequence: E5 (659Hz) -> B5 (987Hz)
        osc1.frequency.setValueAtTime(659.25, now);
        osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);

        osc2.frequency.setValueAtTime(329.63, now);
        osc2.frequency.exponentialRampToValueAtTime(493.88, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);
      } catch (e) {
        console.warn('Audio play failed:', e);
      }
    },

    // Message sent pop sound
    playMessageSent() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {}
    },

    // Bubbly heart pop sound for post likes
    playLike() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.09);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {}
    },

    // Realistic phone ringtone for incoming calls
    startRingtone() {
      this.stopRingtone();
      const playRingCycle = () => {
        try {
          const ctx = getAudioContext();
          if (!ctx) return;

          const now = ctx.currentTime;
          // Standard dual tone ring (440Hz + 480Hz)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.frequency.setValueAtTime(440, now);
          osc2.frequency.setValueAtTime(480, now);

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.setValueAtTime(0.18, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.4);
          osc2.stop(now + 1.4);
        } catch (e) {}
      };

      playRingCycle();
      ringtoneInterval = setInterval(playRingCycle, 2500);
    },

    stopRingtone() {
      if (ringtoneInterval) {
        clearInterval(ringtoneInterval);
        ringtoneInterval = null;
      }
    },

    // Outgoing call ringback beep
    startRingback() {
      this.stopRingback();
      const playBeep = () => {
        try {
          const ctx = getAudioContext();
          if (!ctx) return;

          const now = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.frequency.setValueAtTime(440, now);
          osc2.frequency.setValueAtTime(480, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.setValueAtTime(0.12, now + 1.0);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.1);
          osc2.stop(now + 1.1);
        } catch (e) {}
      };

      playBeep();
      ringbackInterval = setInterval(playBeep, 3000);
    },

    stopRingback() {
      if (ringbackInterval) {
        clearInterval(ringbackInterval);
        ringbackInterval = null;
      }
    },

    // Call End sound
    playCallEnd() {
      this.stopRingtone();
      this.stopRingback();
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.setValueAtTime(360, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {}
    },

    // Toggle video sound (mute/unmute) with visual state update
    toggleVideoAudio(videoEl, btnEl) {
      this.init();
      if (!videoEl) return;

      if (videoEl.muted) {
        videoEl.muted = false;
        videoEl.volume = 1.0;
        if (btnEl) {
          btnEl.classList.add('unmuted');
          btnEl.innerHTML = `🔊 <span class="sound-label">Audio On</span>`;
        }
      } else {
        videoEl.muted = true;
        if (btnEl) {
          btnEl.classList.remove('unmuted');
          btnEl.innerHTML = `🔇 <span class="sound-label">Muted</span>`;
        }
      }
    }
  };

  // Global listener to unlock AudioContext on first user click/tap
  const unlockAudio = () => {
    getAudioContext();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);

  window.BoundUpSound = BoundUpSound;
})(window);
