document.addEventListener('DOMContentLoaded', () => {
  const startScreen = document.getElementById('start-screen');
  const gameArea = document.getElementById('game-area');
  const endScreen = document.getElementById('end-screen');
  const btnPlay = document.getElementById('btn-play-big');
  const btnInfinite = document.getElementById('btn-infinite');
  const btnBack = document.getElementById('btn-back');
  const btnSettings = document.getElementById('btn-settings');
  const settingsDropdown = document.getElementById('settings-dropdown');
  const toggleSfx = document.getElementById('toggle-sfx');
  const toggleMusic = document.getElementById('toggle-music');
  const playArea = document.getElementById('play-area');
  const promptEl = document.getElementById('prompt');
  const scoreEl = document.getElementById('score-display');
  const livesEl = document.getElementById('lives-display');
  const levelEl = document.getElementById('level-display');
  const levelCard = document.getElementById('level-card');
  const progressFill = document.getElementById('progress-fill');
  const progressValue = document.getElementById('progress-value');
  const progressLabel = document.getElementById('progress-label');
  const feedbackLayer = document.getElementById('feedback-layer');
  const highscoreMenu = document.getElementById('highscore-menu');
  const levelOverlay = document.getElementById('level-overlay');
  const levelUpText = document.getElementById('level-up-text');
  const endTitle = document.getElementById('end-title');
  const endIcon = document.getElementById('end-icon');
  const finalScore = document.getElementById('final-score');
  const performanceMessage = document.getElementById('performance-message');
  const newHighscoreMessage = document.getElementById('new-highscore-message');
  const restartButton = document.getElementById('restart-button');
  const homeButton = document.getElementById('home-button');
  const correctAudio = document.getElementById('correct-sound');
  const wrongAudio = document.getElementById('wrong-sound');
  [correctAudio, wrongAudio].forEach(a=>{ if(a){ a.preload='auto'; a.volume=1; try{a.load();}catch(_){} } });

  const noteFigures = {
    'Semibreve':'imagens/semibreve.png',
    'Mínima':'imagens/minima.png',
    'Semínima':'imagens/seminima.png',
    'Colcheia':'imagens/colcheia.png',
    'Semicolcheia':'imagens/semicolcheia.png',
    'Fusa':'imagens/fusa.png',
    'Semifusa':'imagens/semifusa.png'
  };

  const allNotes = Object.keys(noteFigures);
  const levelConfig = {
    1:{notes:['Semibreve','Mínima'],spawn:1850,fall:108},
    2:{notes:['Semibreve','Mínima','Semínima'],spawn:1650,fall:118},
    3:{notes:['Mínima','Semínima','Colcheia'],spawn:1475,fall:130},
    4:{notes:['Semínima','Colcheia','Semicolcheia'],spawn:1300,fall:144},
    5:{notes:['Colcheia','Semicolcheia','Fusa'],spawn:1150,fall:158},
    6:{notes:['Semicolcheia','Fusa','Semifusa'],spawn:1025,fall:174},
    7:{notes:['Colcheia','Semicolcheia','Fusa','Semifusa'],spawn:900,fall:190}
  };

  let currentScreen = startScreen;
  let mode = 'levels';
  let score = 0;
  let lives = 3;
  let level = 1;
  let currentPrompt = '';
  let lastPrompt = '';
  let highscore = 0;
  let wrongSpawnStreak = 0;
  let spawnTimer = null;
  let isPaused = false;
  let infiniteSpawn = 1450;
  const activeFrames = new Map();

  // --- Áudio padrão via Web Audio API ---
  let audioCtx = null;
  let bgmTimer = null;
  let bgmStep = 0;
  let sfxMuted = false; // SFX sempre inicia ligado
  let musicMuted = localStorage.getItem('clavePrime_music') === 'off';

  function initAudio(){
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  }

  function tone(freq,duration=.08,type='sine',volume=.03,delay=0){
    if(sfxMuted) return;
    initAudio();
    const osc=audioCtx.createOscillator();
    const gain=audioCtx.createGain();
    const t=audioCtx.currentTime+delay;
    osc.type=type; osc.frequency.setValueAtTime(freq,t);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(volume,t+.01);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(t); osc.stop(t+duration+.03);
  }
  function clickSound(){tone(700,.07,'triangle',.025)}

  // MP3s originais do jogo: correct.mp3 e wrong.mp3
  // Usa cloneNode para permitir disparos rápidos sem cortar/travar o áudio anterior.
  function playMp3Effect(audioElement){
    if(sfxMuted || !audioElement) return;
    try{
      const sound = audioElement.cloneNode(true);
      sound.volume = 1;
      sound.preload = 'auto';
      sound.currentTime = 0;
      const p = sound.play();
      if(p && typeof p.catch === 'function'){
        p.catch(err => console.warn('Não foi possível tocar o efeito MP3:', err));
      }
    }catch(err){
      console.warn('Erro ao tocar efeito MP3:', err);
    }
  }

  function correctSound(){ playMp3Effect(correctAudio); }
  function wrongSound(){ playMp3Effect(wrongAudio); }
  function levelSound(){tone(523,.1,'sine',.03);tone(659,.1,'sine',.03,.09);tone(784,.16,'sine',.035,.18)}

  function playBgmNote(freq,duration=.42,volume=.024){
    if(musicMuted || !audioCtx) return;
    const osc=audioCtx.createOscillator();
    const gain=audioCtx.createGain();
    const now=audioCtx.currentTime;
    osc.type='sine';
    osc.frequency.setValueAtTime(freq,now);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(volume,now+.035);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now+duration+.04);
  }

  function startMusic(){
    stopMusic(); if(musicMuted) return; initAudio();
    // Trilha leve e musical, gerada 100% via Web Audio API.
    // Motivo em Dó maior com movimento rítmico, sem competir com os efeitos do jogo.
    const seq=[261.63,329.63,392.00,523.25,392.00,329.63,293.66,349.23,440.00,392.00,329.63,293.66];
    bgmStep=0;
    playBgmNote(seq[bgmStep++%seq.length],.44,.024);
    bgmTimer=setInterval(()=>{
      if(musicMuted || document.hidden || currentScreen!==gameArea) return;
      playBgmNote(seq[bgmStep++%seq.length],.44,.024);
    },520);
  }
  function stopMusic(){if(bgmTimer){clearInterval(bgmTimer);bgmTimer=null}}

  document.querySelectorAll('.sound-click').forEach(btn=>btn.addEventListener('click',()=>{initAudio();clickSound()}));

  function syncAudioButtons(){
    toggleSfx.classList.toggle('muted',sfxMuted);
    toggleMusic.classList.toggle('muted',musicMuted);
  }
  syncAudioButtons();

  // --- Fullscreen e transições fixas do padrão ---
  async function toggleFullscreen(enter){
    try{
      if(enter){
        const el=document.documentElement;
        if(!document.fullscreenElement && el.requestFullscreen) await el.requestFullscreen();
        else if(!document.webkitFullscreenElement && el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      }else{
        if(document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
        else if(document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    }catch(_e){}
  }

  function switchScreen(from,to,callback){
    from.style.opacity='0';
    setTimeout(()=>{
      from.style.display='none';
      to.style.display='flex';
      void to.offsetWidth;
      to.style.opacity='1';
      currentScreen=to;
      if(callback) callback();
    },500);
  }

  btnSettings.addEventListener('click',()=>settingsDropdown.classList.toggle('hidden'));
  toggleSfx.addEventListener('click',e=>{
    e.stopPropagation(); sfxMuted=!sfxMuted; syncAudioButtons();
    if(!sfxMuted) clickSound();
  });
  toggleMusic.addEventListener('click',e=>{
    e.stopPropagation(); musicMuted=!musicMuted; localStorage.setItem('clavePrime_music',musicMuted?'off':'on'); syncAudioButtons();
    if(musicMuted) stopMusic(); else if(currentScreen===gameArea) startMusic();
  });

  // --- Mecânica do Caça Figuras ---
  function loadHighscore(){highscore=parseInt(localStorage.getItem('figurasRitmicasHighscore_infinito')||'0',10);highscoreMenu.textContent=highscore}
  function getAvailableNotes(){return mode==='levels'?levelConfig[level].notes:allNotes}

  function choosePrompt(){
    const notes=getAvailableNotes();
    let next=notes[Math.floor(Math.random()*notes.length)];
    if(notes.length>1 && next===lastPrompt){
      const alternatives=notes.filter(n=>n!==lastPrompt);
      next=alternatives[Math.floor(Math.random()*alternatives.length)];
    }
    currentPrompt=next; lastPrompt=next; promptEl.textContent=next;
  }

  function updateHUD(){
    scoreEl.textContent=score;
    livesEl.textContent=lives>0?'♥ '.repeat(lives).trim():'—';
    levelEl.textContent=level;
    if(mode==='levels'){
      const levelStart=(level-1)*50;
      const pointsInLevel=Math.max(0,score-levelStart);
      progressFill.style.width=`${Math.min(100,(pointsInLevel/50)*100)}%`;
      progressValue.textContent=`${Math.min(50,pointsInLevel)}/50`;
      progressLabel.textContent='Progresso do nível';
    }else{
      const chunk=score%50;
      progressFill.style.width=`${(chunk/50)*100}%`;
      progressValue.textContent=`${chunk}/50`;
      progressLabel.textContent='Ritmo atual';
    }
  }

  function clearNotes(){
    clearInterval(spawnTimer); spawnTimer=null;
    activeFrames.forEach(frame=>cancelAnimationFrame(frame)); activeFrames.clear();
    playArea.querySelectorAll('.note').forEach(el=>el.remove());
    feedbackLayer.innerHTML='';
  }

  function startSpawner(delay){
    clearInterval(spawnTimer); createNote(); spawnTimer=setInterval(createNote,delay);
  }

  function createNote(){
    if(isPaused || currentScreen!==gameArea) return;
    const notes=getAvailableNotes();
    let type;
    if(wrongSpawnStreak>=3){type=currentPrompt;wrongSpawnStreak=0}
    else{
      type=notes[Math.floor(Math.random()*notes.length)];
      if(type===currentPrompt) wrongSpawnStreak=0; else wrongSpawnStreak++;
    }

    const img=document.createElement('img');
    img.className='note'; img.src=noteFigures[type]; img.alt=type; img.dataset.type=type; img.draggable=false;
    playArea.appendChild(img);

    const width=img.getBoundingClientRect().width||95;
    const maxLeft=Math.max(10,playArea.clientWidth-width-10);
    img.style.left=`${10+Math.random()*Math.max(0,maxLeft-10)}px`;
    img.style.top=`-${Math.max(100,width)}px`;
    animateNote(img);
  }

  function animateNote(note){
    let y=parseFloat(note.style.top)||-100;
    let previous=performance.now();
    const speed=mode==='levels'?levelConfig[level].fall:Math.min(205,126+(1450-infiniteSpawn)*.09);
    const frame=now=>{
      if(!note.isConnected){activeFrames.delete(note);return}
      if(isPaused){previous=now;activeFrames.set(note,requestAnimationFrame(frame));return}
      const dt=Math.min((now-previous)/1000,.05); previous=now; y+=speed*dt; note.style.top=`${y}px`;
      if(y>playArea.clientHeight+20){note.remove();activeFrames.delete(note);return}
      activeFrames.set(note,requestAnimationFrame(frame));
    };
    activeFrames.set(note,requestAnimationFrame(frame));
  }

  function showFeedback(note,isCorrect){
    const nr=note.getBoundingClientRect(); const ar=playArea.getBoundingClientRect();
    const badge=document.createElement('span'); badge.className=`feedback-burst ${isCorrect?'good':'bad'}`; badge.textContent=isCorrect?'+10 ✓':'−1 ♥';
    badge.style.left=`${nr.left-ar.left+nr.width/2}px`; badge.style.top=`${nr.top-ar.top+nr.height/2}px`; feedbackLayer.appendChild(badge);
    const frame=activeFrames.get(note); if(frame) cancelAnimationFrame(frame); activeFrames.delete(note);
    note.classList.add(isCorrect?'correct-pop':'wrong-pop'); setTimeout(()=>note.remove(),280); setTimeout(()=>badge.remove(),720);
  }

  function handleNoteClick(event){
    const note=event.target.closest('.note'); if(!note || isPaused) return; note.style.pointerEvents='none';
    if(note.dataset.type===currentPrompt){
      score+=10; wrongSpawnStreak=0; correctSound(); showFeedback(note,true); updateHUD();
      if(mode==='levels'){
        if(level===7 && score>=350){setTimeout(()=>endGame(true),300);return}
        if(score>0 && score%50===0 && levelConfig[level+1]){level++;setTimeout(showLevelUp,280);return}
      }else if(score>0 && score%40===0 && infiniteSpawn>620){
        infiniteSpawn-=65; startSpawner(infiniteSpawn);
      }
      choosePrompt();
    }else{
      lives--; wrongSound(); showFeedback(note,false); updateHUD();
      playArea.classList.remove('shake'); void playArea.offsetWidth; playArea.classList.add('shake');
      if(lives<=0) setTimeout(()=>endGame(false),320);
    }
  }

  function showLevelUp(){
    isPaused=true; clearNotes(); levelUpText.textContent=`Nível ${level}`; levelOverlay.style.display='grid'; levelSound(); updateHUD();
    setTimeout(()=>{levelOverlay.style.display='none';isPaused=false;choosePrompt();startSpawner(levelConfig[level].spawn)},1450);
  }

  function startGame(selectedMode){
    mode=selectedMode; score=0; lives=3; level=1; lastPrompt=''; currentPrompt=''; wrongSpawnStreak=0; infiniteSpawn=1450; isPaused=false;
    clearNotes(); settingsDropdown.classList.add('hidden'); levelCard.style.display=mode==='levels'?'flex':'none'; updateHUD(); choosePrompt();
    switchScreen(startScreen,gameArea,()=>{
      toggleFullscreen(true); startMusic(); startSpawner(mode==='levels'?levelConfig[level].spawn:infiniteSpawn);
    });
  }

  function endGame(winner=false){
    isPaused=true; clearNotes(); stopMusic(); finalScore.textContent=score;
    if(winner){endIcon.textContent='✓';endTitle.textContent='Desafio concluído!';performanceMessage.textContent='Excelente! Você completou os 7 níveis do Caça Figuras Rítmicas.'}
    else{endIcon.textContent='★';endTitle.textContent='Fim de jogo';performanceMessage.textContent=score>=200?'Ótimo desempenho! Você reconheceu muitas figuras com rapidez.':score>=100?'Muito bem! Continue treinando para avançar ainda mais.':'Boa tentativa! Jogue novamente e tente superar sua pontuação.'}
    if(mode==='infinite' && score>highscore){
      highscore=score; localStorage.setItem('figurasRitmicasHighscore_infinito',String(highscore)); newHighscoreMessage.hidden=false; loadHighscore();
    }else newHighscoreMessage.hidden=true;
    switchScreen(gameArea,endScreen);
  }

  function goHome(){
    isPaused=true; clearNotes(); stopMusic(); settingsDropdown.classList.add('hidden'); loadHighscore();
    const from=currentScreen;
    switchScreen(from,startScreen,()=>toggleFullscreen(false));
  }

  btnPlay.addEventListener('click',()=>startGame('levels'));
  btnInfinite.addEventListener('click',()=>startGame('infinite'));
  btnBack.addEventListener('click',goHome);
  homeButton.addEventListener('click',goHome);
  restartButton.addEventListener('click',()=>{
    const from=endScreen; score=0;lives=3;level=1;lastPrompt='';wrongSpawnStreak=0;infiniteSpawn=1450;isPaused=false;
    levelCard.style.display=mode==='levels'?'flex':'none';updateHUD();choosePrompt();
    switchScreen(from,gameArea,()=>{toggleFullscreen(true);startMusic();startSpawner(mode==='levels'?levelConfig[level].spawn:infiniteSpawn)});
  });
  playArea.addEventListener('click',handleNoteClick);
  document.addEventListener('visibilitychange',()=>{if(document.hidden && currentScreen===gameArea){isPaused=true;clearInterval(spawnTimer)}else if(!document.hidden && currentScreen===gameArea && isPaused){isPaused=false;startSpawner(mode==='levels'?levelConfig[level].spawn:infiniteSpawn)}});

  loadHighscore();
});
