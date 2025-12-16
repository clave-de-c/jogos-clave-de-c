const cardsArray = [
    { name: 'do', label: 'Dó' }, { name: 're', label: 'Ré' }, { name: 'mi', label: 'Mi' },
    { name: 'fa', label: 'Fá' }, { name: 'sol', label: 'Sol' }, { name: 'la', label: 'Lá' }, { name: 'si', label: 'Si' }
];
let gameGrid = cardsArray.concat(cardsArray).sort(() => 0.5 - Math.random());
let first = null, second = null, lock = false, matches = 0;

const grid = document.getElementById('grid');
const winOverlay = document.getElementById('win-overlay');
const sndFlip = document.getElementById('snd-flip');
const sndMatch = document.getElementById('snd-match');
const sndWin = document.getElementById('snd-win');

gameGrid.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card', `card-${item.name}`);
    card.dataset.name = item.name;
    card.innerHTML = `<div class="front">❄️</div><div class="back">${item.label}</div>`;
    card.addEventListener('click', flipCard);
    grid.appendChild(card);
});

function flipCard() {
    if (lock || this === first) return;
    this.classList.add('flip');
    sndFlip.currentTime = 0; sndFlip.play().catch(()=>{});
    if (!first) { first = this; return; }
    second = this;
    checkForMatch();
}

function checkForMatch() {
    let match = first.dataset.name === second.dataset.name;
    match ? disableCards() : unflipCards();
}

function disableCards() {
    first.removeEventListener('click', flipCard);
    second.removeEventListener('click', flipCard);
    sndMatch.play();
    resetBoard();
    matches++;
    if (matches === 7) setTimeout(gameWon, 500);
}

function unflipCards() {
    lock = true;
    setTimeout(() => {
        first.classList.remove('flip');
        second.classList.remove('flip');
        resetBoard();
    }, 1000);
}

function resetBoard() { [first, second, lock] = [null, null, false]; }

function gameWon() {
    sndWin.play();
    winOverlay.classList.remove('hidden');
    let current = parseInt(localStorage.getItem('clavePolarProgress')) || 1;
    if(current < 2) localStorage.setItem('clavePolarProgress', 2);
}

window.proximaFase = function() { window.location.href = 'mapa.html'; }