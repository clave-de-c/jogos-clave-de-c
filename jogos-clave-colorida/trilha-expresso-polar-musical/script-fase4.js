// PARTITURA COMPLETA "BATE O SINO" (Jingle Bells)
// Baseado na imagem fornecida
const songSequence = [
    // Parte 1
    'Mi', 'Mi', 'Mi',
    'Mi', 'Mi', 'Mi',
    'Mi', 'Sol', 'Do', 'Re', 'Mi',
    // Parte 2
    'Fa', 'Fa', 'Fa', 'Fa',
    'Mi', 'Mi', 'Mi', 'Mi',
    // Parte 3
    'Re', 'Re', 'Re', 'Mi',
    'Re', 'Sol',
    // Parte 4 (Repete inicio)
    'Mi', 'Mi', 'Mi',
    'Mi', 'Mi', 'Mi',
    'Mi', 'Sol', 'Do', 'Re', 'Mi',
    // Parte 5 (Final diferente)
    'Fa', 'Fa', 'Fa', 'Fa',
    'Mi', 'Mi', 'Mi', 'Mi',
    'Sol', 'Sol', 'Fa', 'Re', 'Do'
];

let currentIndex = 0;
const displayNote = document.getElementById('current-note-display');
const progressFill = document.getElementById('progress-fill');
const keys = document.querySelectorAll('.key');
const winScreen = document.getElementById('win-screen');
const bgMusic = document.getElementById('bg-music');

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

if(bgMusic) { bgMusic.volume = 0.1; bgMusic.play().catch(()=>{}); }

function playTone(freq) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle'; // Som mais parecido com sino
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
}

function updateGame() {
    const progress = (currentIndex / songSequence.length) * 100;
    progressFill.style.width = `${progress}%`;

    if (currentIndex >= songSequence.length) {
        gameWin();
        return;
    }

    const targetNote = songSequence[currentIndex];
    displayNote.innerText = targetNote;
    displayNote.style.color = getNoteColor(targetNote);

    keys.forEach(key => {
        key.classList.remove('active-target');
        if (key.dataset.note === targetNote) {
            key.classList.add('active-target');
            key.style.setProperty('--glow-color', getComputedStyle(key).backgroundColor);
        }
    });
}

function handleInput(note, freq) {
    playTone(freq);
    const targetNote = songSequence[currentIndex];
    if (note === targetNote) {
        currentIndex++;
        updateGame();
    } else {
        displayNote.classList.add('shake');
        displayNote.style.color = 'red';
        setTimeout(updateGame, 300);
    }
}

function getNoteColor(note) {
    const colors = { 'Do':'#d41e1e', 'Re':'#f18c4d', 'Mi':'#ffda43', 'Fa':'#10ad54', 'Sol':'#38b6ff', 'La':'#004aad', 'Si':'#7c45e8' };
    return colors[note];
}

keys.forEach(key => {
    key.onmousedown = () => handleInput(key.dataset.note, key.dataset.freq);
    key.ontouchstart = (e) => { e.preventDefault(); handleInput(key.dataset.note, key.dataset.freq); };
});

function gameWin() {
    document.getElementById('snd-win').play();
    localStorage.setItem('clavePolarProgress', 5);
    winScreen.classList.remove('hidden');
    winScreen.style.display = 'flex';
}

window.irParaCertificado = function() { window.location.href = 'certificado.html'; }

updateGame();