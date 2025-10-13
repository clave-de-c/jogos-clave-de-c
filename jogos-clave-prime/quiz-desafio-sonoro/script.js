document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DOS ELEMENTOS DO HTML ---
    const telaInicial = document.getElementById('tela-inicial');
    const telaInstrucoes = document.getElementById('tela-instrucoes');
    const telaQuiz = document.getElementById('tela-quiz');
    const telaFinal = document.getElementById('tela-final');

    const btnModoClassico = document.getElementById('btn-modo-classico');
    const btnModoTempo = document.getElementById('btn-modo-tempo');
    const btnInstrucoes = document.getElementById('btn-instrucoes');
    const btnVoltarMenuInstrucoes = document.getElementById('btn-voltar-menu-instrucoes');
    const btnVoltarMenuQuiz = document.getElementById('btn-voltar-menu-quiz');
    const btnVoltarMenuFinal = document.getElementById('btn-voltar-menu-final');
    const btnJogarNovamente = document.getElementById('btn-jogar-novamente');

    const perguntaTitulo = document.getElementById('pergunta-titulo');
    const opcoesContainer = document.getElementById('opcoes-container');
    const progressoEl = document.getElementById('progresso');
    const scoreEl = document.getElementById('score');
    const feedbackEl = document.getElementById('feedback');
    const scoreFinalEl = document.getElementById('score-final');
    const mensagemFinalEl = document.getElementById('mensagem-final');
    const timerContainer = document.getElementById('timer-container');
    const timerTexto = document.getElementById('timer-texto');

    // --- ÁUDIOS DO JOGO ---
    const audios = {
        'musica-de-fundo': new Audio('sons/musica-de-fundo.mp3'),
        'click': new Audio('sons/click-botao.mp3'),
        'correto': new Audio('sons/resposta-correta.mp3'),
        'incorreto': new Audio('sons/resposta-incorreta.mp3'),
        'altura_aguda': new Audio('sons/altura_aguda.mp3'),
        'altura_grave': new Audio('sons/altura_grave.mp3'),
        'duracao_curta': new Audio('sons/duracao_curta.mp3'),
        'duracao_longa': new Audio('sons/duracao_longa.mp3'),
        'intensidade_fraca': new Audio('sons/intensidade_fraca.mp3'),
        'intensidade_forte': new Audio('sons/intensidade_forte.mp3'),
        'timbre_piano': new Audio('sons/timbre_piano.mp3'),
        'timbre_violao': new Audio('sons/timbre_violao.mp3'),
        'timbre_flauta': new Audio('sons/timbre_flauta.mp3'),
        'timbre_trompete': new Audio('sons/timbre_trompete.mp3'),
    };
    audios['musica-de-fundo'].loop = true;
    audios['musica-de-fundo'].volume = 0.3;
    
    document.body.addEventListener('click', () => audios['musica-de-fundo'].play(), { once: true });

    // --- BANCO DE PERGUNTAS COM TEXTOS CORRIGIDOS ---
    const perguntas = [
        { tipo: 'TEORIA', texto: 'Qual parâmetro diferencia um som agudo de um grave?', opcoes: ['Intensidade', 'Altura', 'Timbre', 'Duração'], resposta: 'Altura' },
        { tipo: 'AUDIO', texto: 'Qual som é mais AGUDO?', opcoes: [{ texto: 'Som A', audio: 'altura_grave' }, { texto: 'Som B', audio: 'altura_aguda' }], resposta: 'Som B' },
        { tipo: 'TEORIA', texto: 'A característica que define se um som é longo ou curto é a:', opcoes: ['Altura', 'Textura', 'Duração', 'Intensidade'], resposta: 'Duração' },
        { tipo: 'AUDIO', texto: 'Qual som tem a maior DURAÇÃO?', opcoes: [{ texto: 'Som A', audio: 'duracao_curta' }, { texto: 'Som B', audio: 'duracao_longa' }], resposta: 'Som B' },
        { tipo: 'TEORIA', texto: 'Quando um músico toca "forte", ele está variando a:', opcoes: ['Intensidade', 'Melodia', 'Timbre', 'Altura'], resposta: 'Intensidade' },
        { tipo: 'AUDIO', texto: 'Qual som tem mais INTENSIDADE (Forte)?', opcoes: [{ texto: 'Som A', audio: 'intensidade_fraca' }, { texto: 'Som B', audio: 'intensidade_forte' }], resposta: 'Som B' },
        { tipo: 'TEORIA', texto: 'O que nos permite diferenciar um piano de um violão tocando a mesma nota?', opcoes: ['A Altura', 'A Duração', 'O Timbre', 'A Intensidade'], resposta: 'O Timbre' },
        { tipo: 'TIMBRE', texto: 'Que instrumento você está ouvindo?', audio: 'timbre_piano', opcoes: ['Piano', 'Violão'], resposta: 'Piano' },
        { tipo: 'TIMBRE', texto: 'E agora, que instrumento é este?', audio: 'timbre_trompete', opcoes: ['Flauta', 'Trompete'], resposta: 'Trompete' },
        { tipo: 'TEORIA', texto: 'Os 4 parâmetros essenciais do som são:', opcoes: ['Altura, Duração, Melodia, Ritmo', 'Altura, Duração, Intensidade, Timbre', 'Timbre, Harmonia, Ritmo, Volume'], resposta: 'Altura, Duração, Intensidade, Timbre' },
        // --- PERGUNTA 1 CORRIGIDA ---
        { tipo: 'TIMBRE', texto: 'Este som é de qual instrumento?', audio: 'timbre_flauta', opcoes: ['Flauta', 'Violino'], resposta: 'Flauta' },
        { tipo: 'TEORIA', texto: 'A "cor" de um som, que diferencia uma flauta de um piano, é o...?', opcoes: ['Timbre', 'Ritmo', 'Volume', 'Registro'], resposta: 'Timbre'},
        // --- PERGUNTA 2 CORRIGIDA ---
        { tipo: 'TIMBRE', texto: 'Qual destes instrumentos você está ouvindo?', audio: 'timbre_violao', opcoes: ['Piano', 'Violão'], resposta: 'Violão'},
        { tipo: 'TEORIA', texto: 'Qual parâmetro é medido em decibéis (dB) e se refere ao "volume" do som?', opcoes: ['Altura', 'Duração', 'Intensidade', 'Frequência'], resposta: 'Intensidade'}
    ];
    
    // --- Variáveis de estado do jogo ---
    let score = 0;
    let perguntaAtualIndex = 0;
    let perguntasEmbaralhadas = [];
    let modoDeJogo = 'classico';
    let timerInterval;
    let tempoRestante = 10;
    let ultimoModoDeJogo = 'classico';

    function mostrarTela(tela) {
        telaInicial.style.display = 'none';
        telaInstrucoes.style.display = 'none';
        telaQuiz.style.display = 'none';
        telaFinal.style.display = 'none';
        tela.style.display = 'flex';
    }

    function iniciarJogo(modo) {
        audios['click'].play();
        audios['musica-de-fundo'].pause();
        
        modoDeJogo = modo;
        ultimoModoDeJogo = modo;
        score = 0;
        perguntaAtualIndex = 0;
        perguntasEmbaralhadas = [...perguntas].sort(() => Math.random() - 0.5);
        
        if (modoDeJogo === 'tempo') {
            timerContainer.style.display = 'flex';
        } else {
            timerContainer.style.display = 'none';
        }

        mostrarTela(telaQuiz);
        mostrarProximaPergunta();
    }
    
    function iniciarTimer() {
        tempoRestante = 10;
        timerTexto.innerText = tempoRestante;
        timerContainer.classList.remove('alerta');

        timerInterval = setInterval(() => {
            tempoRestante--;
            timerTexto.innerText = tempoRestante;
            if (tempoRestante <= 3) {
                timerContainer.classList.add('alerta');
            }
            if (tempoRestante < 0) {
                clearInterval(timerInterval);
                tempoEsgotado();
            }
        }, 1000);
    }

    function pararTimer() {
        clearInterval(timerInterval);
    }
    
    function tempoEsgotado() {
        feedbackEl.innerText = "Tempo Esgotado!";
        audios['incorreto'].play();

        const pergunta = perguntasEmbaralhadas[perguntaAtualIndex];
        Array.from(opcoesContainer.children).forEach(el => {
            const textoDoElemento = el.innerText.includes('\n') ? el.children[1].innerText : el.innerText;
            if (textoDoElemento === pergunta.resposta) {
                el.classList.add('correto');
            }
            el.classList.add('disabled');
            el.style.pointerEvents = 'none';
        });
        
        const btnPlayPrincipal = telaQuiz.querySelector('.btn-principal');
        if (btnPlayPrincipal) {
            btnPlayPrincipal.disabled = true;
        }

        setTimeout(() => {
            perguntaAtualIndex++;
            mostrarProximaPergunta();
        }, 2000);
    }

    function mostrarProximaPergunta() {
        resetarEstado();
        if (perguntaAtualIndex >= perguntasEmbaralhadas.length) {
            finalizarJogo();
            return;
        }

        if (modoDeJogo === 'tempo') {
            iniciarTimer();
        }

        const pergunta = perguntasEmbaralhadas[perguntaAtualIndex];
        
        // --- NOVO: Embaralha as opções de resposta para garantir variedade ---
        pergunta.opcoes.sort(() => Math.random() - 0.5);

        perguntaTitulo.innerText = pergunta.texto;
        progressoEl.innerText = `Pergunta ${perguntaAtualIndex + 1} / ${perguntasEmbaralhadas.length}`;
        scoreEl.innerText = `Pontos: ${score}`;

        if (pergunta.tipo === 'TIMBRE') {
            const btnPlayPrincipal = document.createElement('button');
            btnPlayPrincipal.classList.add('btn-principal');
            btnPlayPrincipal.style.marginBottom = '20px';
            btnPlayPrincipal.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 5v14l11-7z"></path></svg> Ouvir o som';
            btnPlayPrincipal.onclick = () => {
                audios[pergunta.audio].currentTime = 0;
                audios[pergunta.audio].play();
            };
            perguntaTitulo.after(btnPlayPrincipal);
            pergunta.opcoes.forEach(opcao => {
                const botao = document.createElement('button');
                botao.classList.add('btn-opcao');
                botao.innerText = opcao;
                botao.addEventListener('click', () => selecionarResposta(botao, opcao, pergunta.resposta));
                opcoesContainer.appendChild(botao);
            });
        } else if (pergunta.tipo === 'AUDIO') {
            pergunta.opcoes.forEach(opcao => {
                const container = document.createElement('div');
                container.classList.add('opcao-audio-container');
                const btnPlay = document.createElement('button');
                btnPlay.classList.add('btn-play-audio');
                btnPlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>';
                btnPlay.addEventListener('click', (e) => {
                    e.stopPropagation();
                    audios[opcao.audio].currentTime = 0;
                    audios[opcao.audio].play();
                });
                const textoOpcao = document.createElement('span');
                textoOpcao.innerText = opcao.texto;
                container.appendChild(btnPlay);
                container.appendChild(textoOpcao);
                container.addEventListener('click', () => selecionarResposta(container, opcao.texto, pergunta.resposta));
                opcoesContainer.appendChild(container);
            });
        } else { // tipo TEORIA
            pergunta.opcoes.forEach(opcao => {
                const botao = document.createElement('button');
                botao.classList.add('btn-opcao');
                botao.innerText = opcao;
                botao.addEventListener('click', () => selecionarResposta(botao, opcao, pergunta.resposta));
                opcoesContainer.appendChild(botao);
            });
        }
    }

    function selecionarResposta(elemento, opcaoSelecionada, respostaCorreta) {
        if (modoDeJogo === 'tempo') {
            pararTimer();
        }
        
        Array.from(opcoesContainer.children).forEach(el => {
            el.classList.add('disabled');
            el.style.pointerEvents = 'none';
        });
        
        const btnPlayPrincipal = telaQuiz.querySelector('.btn-principal');
        if (btnPlayPrincipal) {
            btnPlayPrincipal.disabled = true;
        }
        
        if (opcaoSelecionada === respostaCorreta) {
            audios['correto'].play();
            elemento.classList.add('correto');
            feedbackEl.innerText = "Resposta Correta!";
            score++;
        } else {
            audios['incorreto'].play();
            elemento.classList.add('incorreto');
            feedbackEl.innerText = `Incorreto! A resposta era: ${respostaCorreta}`;
            
            Array.from(opcoesContainer.children).forEach(el => {
                const textoDoElemento = el.innerText.includes('\n') ? el.children[1].innerText : el.innerText;
                if(textoDoElemento === respostaCorreta) {
                    el.classList.add('correto');
                }
            });
        }

        setTimeout(() => {
            perguntaAtualIndex++;
            mostrarProximaPergunta();
        }, 2000);
    }
    
    function resetarEstado() {
        feedbackEl.innerText = '';
        const btnPlayPrincipal = telaQuiz.querySelector('.btn-principal');
        if (btnPlayPrincipal) {
            btnPlayPrincipal.remove();
        }
        while (opcoesContainer.firstChild) {
            opcoesContainer.removeChild(opcoesContainer.firstChild);
        }
    }

    function finalizarJogo() {
        mostrarTela(telaFinal);
        const totalPerguntas = perguntasEmbaralhadas.length;
        let mensagem = '';

        const aproveitamento = score / totalPerguntas;

        if (aproveitamento === 1) { // 100%
            mensagem = 'Incrível! Você é um Mestre dos Sons e acertou tudo!';
        } else if (aproveitamento >= 0.7) { // 70% a 99%
            mensagem = 'Excelente! Você tem um ouvido apurado e domina o assunto.';
        } else if (aproveitamento >= 0.4) { // 40% a 69%
            mensagem = 'Bom trabalho! Você está no caminho certo. Continue praticando para aprimorar sua percepção.';
        } else { // Menos de 40%
            mensagem = 'Toda jornada começa com o primeiro passo! Continue explorando os sons para treinar seus ouvidos.';
        }
        
        mensagemFinalEl.innerText = mensagem;
        scoreFinalEl.innerText = `Sua pontuação final foi: ${score} de ${totalPerguntas}`;
    }

    // --- Event Listeners ---
    btnModoClassico.addEventListener('click', () => iniciarJogo('classico'));
    btnModoTempo.addEventListener('click', () => iniciarJogo('tempo'));
    btnJogarNovamente.addEventListener('click', () => iniciarJogo(ultimoModoDeJogo));

    btnInstrucoes.addEventListener('click', () => {
        audios['click'].play();
        mostrarTela(telaInstrucoes);
    });

    const botoesVoltar = [btnVoltarMenuInstrucoes, btnVoltarMenuQuiz, btnVoltarMenuFinal];
    botoesVoltar.forEach(btn => {
        btn.addEventListener('click', () => {
            pararTimer();
            audios['click'].play();
            audios['musica-de-fundo'].currentTime = 0;
            audios['musica-de-fundo'].play();
            mostrarTela(telaInicial);
        });
    });

    mostrarTela(telaInicial);
});