/**
 * BoundUp Web Audio Engine & Real Sound FX Generator
 * Synthesizes real-time sound effects (notification chimes, call ringtones, like pops, video audio controls & BGM beats)
 */
(function(window) {
  let audioCtx = null;
  let bgmInterval = null;

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

  let ringtoneInterval = null;
  let ringbackInterval = null;

  const BoundUpSound = {
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
      } catch (e) {}
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
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);

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

    // Dynamic Tamil Mass BGM & Tamil Love Song Melody Synthesizer
    playVideoMusicTrack(genre = 'mass') {
      this.stopVideoMusic();
      const ctx = getAudioContext();
      if (!ctx) return;

      // Note frequencies: Mass BGM vs Romantic Tamil Love Song chords vs Chill Synth
      let notes = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63];
      if (genre === 'love' || genre === 'romantic') {
        // Soft Romantic Major 7th arpeggio (C4, E4, G4, B4, D5)
        notes = [261.63, 329.63, 392.00, 493.88, 587.33, 523.25];
      } else if (genre === 'chill') {
        notes = [261.63, 293.66, 329.63, 392.00, 440.00];
      }

      let step = 0;
      const playStep = () => {
        try {
          const now = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          const freq = notes[step % notes.length];
          if (genre === 'love' || genre === 'romantic') {
            osc1.type = 'sine';
            osc2.type = 'triangle';
          } else if (genre === 'mass') {
            osc1.type = 'sawtooth';
            osc2.type = 'triangle';
          } else {
            osc1.type = 'sine';
            osc2.type = 'sine';
          }

          osc1.frequency.setValueAtTime(freq, now);
          osc2.frequency.setValueAtTime(freq / 2, now);

          const vol = (genre === 'love' || genre === 'romantic') ? 0.12 : 0.16;
          const duration = (genre === 'love' || genre === 'romantic') ? 0.45 : 0.3;

          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + duration + 0.05);
          osc2.stop(now + duration + 0.05);

          step++;
        } catch(e) {}
      };

      playStep();
      const tempo = (genre === 'love' || genre === 'romantic') ? 480 : (genre === 'mass' ? 320 : 420);
      bgmInterval = setInterval(playStep, tempo);
    },

    stopVideoMusic() {
      if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
      }
    },

    // Enable Video Sound: handles unmuting HTML5 audio & synchronized sound beat
    enableVideoSound(videoEl, btnEl, genre = 'mass') {
      this.init();
      if (!videoEl) return;

      if (videoEl.muted || videoEl.paused) {
        videoEl.muted = false;
        videoEl.volume = 1.0;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.playVideoMusicTrack(genre);
          }).catch(err => {
            this.playVideoMusicTrack(genre);
          });
        }
        if (btnEl) {
          btnEl.classList.add('unmuted');
          btnEl.innerHTML = `🔊 <span class="sound-label">Audio Active</span>`;
        }
      } else {
        videoEl.muted = true;
        this.stopVideoMusic();
        if (btnEl) {
          btnEl.classList.remove('unmuted');
          btnEl.innerHTML = `🔇 <span class="sound-label">Muted</span>`;
        }
      }
    },

    startRingtone() {
      this.stopRingtone();
      const playRingCycle = () => {
        try {
          const ctx = getAudioContext();
          if (!ctx) return;

          const now = ctx.currentTime;
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
    }
  };

  const unlockAudio = () => {
    getAudioContext();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);

  window.BoundUpSound = BoundUpSound;
})(window);
