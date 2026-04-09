/**
 * Pomodoro Timer
 * 番茄钟 - 专注计时器
 */

(function() {
  // ===== 状态 =====
  let timer = null;
  let timeLeft = 25 * 60; // 秒
  let totalTime = 25 * 60;
  let isRunning = false;
  let isBreak = false;
  let sessionCount = 0;
  let totalPomodoros = parseInt(localStorage.getItem('pomodoros') || '0');
  let totalMinutes = parseInt(localStorage.getItem('pomodorosMinutes') || '0');
  let lastDate = localStorage.getItem('pomodorosDate');
  
  // 今天的数据重置
  const today = new Date().toDateString();
  if (lastDate !== today) {
    totalPomodoros = 0;
    totalMinutes = 0;
    localStorage.setItem('pomodoros', '0');
    localStorage.setItem('pomodorosMinutes', '0');
    localStorage.setItem('pomodorosDate', today);
  }
  
  // ===== DOM 元素 =====
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');
  const progressRing = document.getElementById('progress-ring');
  const sessionTypeEl = document.getElementById('session-type');
  const sessionNumEl = document.getElementById('session-num');
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  const btnSkip = document.getElementById('btn-skip');
  const workDurationEl = document.getElementById('work-duration');
  const breakDurationEl = document.getElementById('break-duration');
  const longBreakIntervalEl = document.getElementById('long-break-interval');
  const totalPomodorosEl = document.getElementById('total-pomodoros');
  const totalMinutesEl = document.getElementById('total-minutes');
  
  // ===== 初始化 =====
  function init() {
    updateDisplay();
    updateStats();
    
    // 事件绑定
    btnStart.addEventListener('click', startTimer);
    btnPause.addEventListener('click', pauseTimer);
    btnReset.addEventListener('click', resetTimer);
    btnSkip.addEventListener('click', skipSession);
    
    // 设置变更
    workDurationEl.addEventListener('change', updateWorkDuration);
    breakDurationEl.addEventListener('change', updateBreakDuration);
    
    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
  
  // ===== 计时器控制 =====
  function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    btnStart.style.display = 'none';
    btnPause.style.display = 'inline-block';
    
    timer = setInterval(tick, 1000);
  }
  
  function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    btnStart.style.display = 'inline-block';
    btnPause.style.display = 'none';
    
    clearInterval(timer);
  }
  
  function resetTimer() {
    pauseTimer();
    
    isBreak = false;
    timeLeft = parseInt(workDurationEl.value) * 60;
    totalTime = timeLeft;
    
    updateDisplay();
    sessionTypeEl.textContent = '专注时间';
    progressRing.classList.remove('break');
  }
  
  function skipSession() {
    completeSession();
  }
  
  // ===== 计时逻辑 =====
  function tick() {
    timeLeft--;
    updateDisplay();
    
    if (timeLeft <= 0) {
      completeSession();
    }
  }
  
  function completeSession() {
    pauseTimer();
    
    if (!isBreak) {
      // 完成一个番茄
      sessionCount++;
      totalPomodoros++;
      totalMinutes += parseInt(workDurationEl.value);
      
      localStorage.setItem('pomodoros', totalPomodoros.toString());
      localStorage.setItem('pomodorosMinutes', totalMinutes.toString());
      
      updateStats();
      notify('🍅 番茄完成！', '休息一下吧 ~');
      
      // 判断是否长休息
      const longBreakInterval = parseInt(longBreakIntervalEl.value);
      if (sessionCount % longBreakInterval === 0) {
        // 长休息 (15分钟)
        isBreak = true;
        timeLeft = 15 * 60;
        totalTime = timeLeft;
        sessionTypeEl.textContent = '长休息时间';
      } else {
        // 短休息
        isBreak = true;
        timeLeft = parseInt(breakDurationEl.value) * 60;
        totalTime = timeLeft;
        sessionTypeEl.textContent = '休息时间';
      }
      
      progressRing.classList.add('break');
    } else {
      // 休息结束
      notify('💪 休息结束！', '开始下一个番茄吧 ~');
      
      isBreak = false;
      timeLeft = parseInt(workDurationEl.value) * 60;
      totalTime = timeLeft;
      sessionTypeEl.textContent = '专注时间';
      progressRing.classList.remove('break');
    }
    
    sessionNumEl.textContent = sessionCount + 1;
    updateDisplay();
  }
  
  // ===== 显示更新 =====
  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
    
    // 更新进度环
    const circumference = 2 * Math.PI * 90; // r=90
    const progress = (totalTime - timeLeft) / totalTime;
    progressRing.style.strokeDashoffset = circumference * (1 - progress);
  }
  
  function updateStats() {
    totalPomodorosEl.textContent = totalPomodoros;
    totalMinutesEl.textContent = totalMinutes;
  }
  
  // ===== 设置更新 =====
  function updateWorkDuration() {
    if (!isRunning && !isBreak) {
      timeLeft = parseInt(workDurationEl.value) * 60;
      totalTime = timeLeft;
      updateDisplay();
    }
  }
  
  function updateBreakDuration() {
    // 下次休息时生效
  }
  
  // ===== 通知 =====
  function notify(title, body) {
    // 浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '🍅' });
    }
    
    // 页面内通知
    showNotification(title + ' ' + body);
    
    // 播放提示音
    playSound();
  }
  
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  function playSound() {
    // 使用 Web Audio API 生成简单提示音
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    } catch (e) {
      // 静默失败
    }
  }
  
  // ===== 启动 =====
  init();
})();
