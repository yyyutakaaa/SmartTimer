function timerApp() {
  return {
    timeValue: "",
    targetTimeText: "-",
    durationText: "-",
    statusText: "Idle",
    countdownText: "--:--:--",
    hintText: "Waiting to start",
    progress: 0,
    totalMs: 0,
    endTime: null,
    intervalId: null,
    isRunning: false,
    alarmEl: null,
    audioCtx: null,
    doneAlertVisible: false,
    beepInterval: null,

    prefillTime() {
      this.alarmEl = this.$refs?.alarmSound || null;
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      this.timeValue = `${hours}:${minutes}`;
    },

    handleSubmit() {
      if (!this.timeValue) return;
      this.stopAlarm();
      this.doneAlertVisible = false;
      const [hours, minutes] = this.timeValue.split(":").map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(hours, minutes || 0, 0, 0);

      let diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        target.setDate(target.getDate() + 1);
        diff = target.getTime() - now.getTime();
      }

      this.totalMs = diff;
      this.endTime = new Date(Date.now() + diff);
      this.targetTimeText = target.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      this.durationText = this.formatMs(diff);
      this.statusText = "Running";
      this.hintText = "Countdown is active";
      this.isRunning = true;
      this.doneAlertVisible = false;
      this.ensureNotificationPermission();
      this.start();
    },

    start() {
      this.stop();
      this.tick();
      this.intervalId = setInterval(() => this.tick(), 1000);
    },

    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    resetTimer() {
      this.stop();
      this.progress = 0;
      this.totalMs = 0;
      this.endTime = null;
      this.isRunning = false;
      this.countdownText = "--:--:--";
      this.targetTimeText = "-";
      this.durationText = "-";
      this.statusText = "Idle";
      this.hintText = "Waiting to start";
      this.doneAlertVisible = false;
      this.stopAlarm();
    },

    tick() {
      if (!this.endTime) return;
      const remaining = this.endTime.getTime() - Date.now();
      if (remaining <= 0) {
        this.countdownText = "00:00:00";
        this.statusText = "Done";
        this.hintText = "Timer reached target time. Dismiss to stop alarm.";
        this.progress = 0;
        this.isRunning = false;
        this.doneAlertVisible = true;
        this.stop();
        this.playAlarmLoop();
        this.sendNotification();
        return;
      }

      this.countdownText = this.formatMs(remaining);
      const pct = Math.max(0, Math.min(1, remaining / this.totalMs));
      this.progress = parseFloat((pct * 100).toFixed(2));
    },

    formatMs(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return [hours, minutes, seconds].map((val) => String(val).padStart(2, "0")).join(":");
    },

    playAlarmLoop() {
      if (this.alarmEl) {
        try {
          this.alarmEl.currentTime = 0;
          this.alarmEl.loop = true;
          const playPromise = this.alarmEl.play();
          if (playPromise?.catch) playPromise.catch(() => {});
          return;
        } catch (err) {
          console.warn("Alarm audio could not play", err);
        }
      }
      this.startBeepFallbackLoop();
    },

    stopAlarm() {
      if (this.alarmEl) {
        try {
          this.alarmEl.pause();
          this.alarmEl.currentTime = 0;
        } catch (err) {
          console.warn("Alarm audio could not pause", err);
        }
      }
      if (this.beepInterval) {
        clearInterval(this.beepInterval);
        this.beepInterval = null;
      }
      this.doneAlertVisible = false;
    },

    startBeepFallbackLoop() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      const ctx = this.audioCtx;
      const playBeep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 750;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      };
      playBeep();
      this.beepInterval = setInterval(playBeep, 1200);
    },

    sendNotification() {
      if (typeof Notification === "undefined") return;
      if (Notification.permission !== "granted") return;
      try {
        new Notification("Timer done", {
          body: "Your timer reached the target time.",
          icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 24 24' fill='%2364d8ff'%3E%3Cpath d='M7 2v2H5a1 1 0 0 0-.89.55l-1 2A1 1 0 0 0 4 8h16a1 1 0 0 0 .89-1.45l-1-2A1 1 0 0 0 19 4h-2V2zm5 6a7 7 0 1 0 7 7 7 7 0 0 0-7-7m0 2a5 5 0 1 1-5 5 5 5 0 0 1 5-5m0 1a1 1 0 0 1 1 1v2.59l1.71 1.7-1.42 1.42L12 15V11a1 1 0 0 1 1-1'/%3E%3C/svg%3E"
        });
      } catch (err) {
        console.warn("Notification failed", err);
      }
    },

    ensureNotificationPermission() {
      if (typeof Notification === "undefined") return;
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  };
}

window.timerApp = timerApp;
