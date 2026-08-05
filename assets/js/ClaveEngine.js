/* ================================================================
   CLAVE DE C - GAME ENGINE (CORE REUTILIZÁVEL)
   ================================================================ */
class ClaveEngine {
    constructor(config = {}) {
        this.title = config.title || "Jogo Musical";
        this.targetScore = config.targetScore || 10;
        this.score = 0;
        this.timerSeconds = config.timer || 0; 
        this.timerInterval = null;
        
        this.initAudio();
        this.renderUIComponents();
    }

    initAudio() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.freqs = { 
            'Dó': 261.63, 'Ré': 293.66, 'Mi': 329.63, 
            'Fá': 349.23, 'Sol': 392.00, 'Lá': 440.00, 'Si': 493.88 
        };
    }

    playNote(nota) {
        if (!this.freqs[nota]) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.freqs[nota], this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.8);
    }

    renderUIComponents() {
        const modalHTML = `
            <div id="engine-modal-vitoria" class="engine-modal" style="display:none;">
                <div class="engine-modal-content">
                    <h1 class="engine-title">Parabéns! 🎉</h1>
                    <p class="engine-subtitle">Você concluiu o desafio com sucesso!</p>
                    <div class="engine-score-badge">Pontuação: <span id="engine-final-score">0</span></div>
                    
                    <div class="engine-promo-card">
                        <p>Quer continuar aprendendo música de forma lúdica?</p>
                        <div class="engine-btn-group">
                            <a href="https://www.clavedec.com.br" target="_blank" class="engine-btn green">Atividades Gratuitas</a>
                            <a href="https://prime.clavedec.com.br" target="_blank" class="engine-btn prime">Conheça o Clave Prime</a>
                        </div>
                    </div>

                    <button onclick="location.reload()" class="engine-btn restart">Jogar Novamente 🔄</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    addPoint() {
        this.score++;
        const scoreEl = document.getElementById('engine-score');
        if (scoreEl) scoreEl.innerText = this.score;

        if (this.score >= this.targetScore) {
            this.triggerWin();
        }
    }

    triggerWin() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        document.getElementById('engine-final-score').innerText = this.score;
        document.getElementById('engine-modal-vitoria').style.display = 'flex';
    }
}
