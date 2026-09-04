document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     BANCO DE ESCALAS
  ===================================================== */

  const notas = [

    {
      id: 'c',
      nome: 'DÓ',
      cor: '--do',
      freq: 261.63,
      escala: [
        ['Dó', '--do'],
        ['Ré', '--re'],
        ['Mi', '--mi'],
        ['Fá', '--fa'],
        ['Sol', '--sol'],
        ['Lá', '--la'],
        ['Si', '--si'],
        ['Dó', '--do']
      ]
    },

    {
      id: 'g',
      nome: 'SOL',
      cor: '--sol',
      freq: 392.00,
      escala: [
        ['Sol', '--sol'],
        ['Lá', '--la'],
        ['Si', '--si'],
        ['Dó', '--do'],
        ['Ré', '--re'],
        ['Mi', '--mi'],
        ['Fá#', '--fa'],
        ['Sol', '--sol']
      ]
    },

    {
      id: 'd',
      nome: 'RÉ',
      cor: '--re',
      freq: 293.66,
      escala: [
        ['Ré', '--re'],
        ['Mi', '--mi'],
        ['Fá#', '--fa'],
        ['Sol', '--sol'],
        ['Lá', '--la'],
        ['Si', '--si'],
        ['Dó#', '--do'],
        ['Ré', '--re']
      ]
    },

    {
      id: 'a',
      nome: 'LÁ',
      cor: '--la',
      freq: 440,
      escala: [
        ['Lá', '--la'],
        ['Si', '--si'],
        ['Dó#', '--do'],
        ['Ré', '--re'],
        ['Mi', '--mi'],
        ['Fá#', '--fa'],
        ['Sol#', '--sol'],
        ['Lá', '--la']
      ]
    },

    {
      id: 'e',
      nome: 'MI',
      cor: '--mi',
      freq: 329.63,
      escala: [
        ['Mi', '--mi'],
        ['Fá#', '--fa'],
        ['Sol#', '--sol'],
        ['Lá', '--la'],
        ['Si', '--si'],
        ['Dó#', '--do'],
        ['Ré#', '--re'],
        ['Mi', '--mi']
      ]
    },

    {
      id: 'b',
      nome: 'SI',
      cor: '--si',
      freq: 493.88,
      escala: [
        ['Si', '--si'],
        ['Dó#', '--do'],
        ['Ré#', '--re'],
        ['Mi', '--mi'],
        ['Fá#', '--fa'],
        ['Sol#', '--sol'],
        ['Lá#', '--la'],
        ['Si', '--si']
      ]
    },

    {
      id: 'fs',
      nome: 'FÁ#',
      cor: '--fa',
      freq: 369.99,
      escala: [
        ['Fá#', '--fa'],
        ['Sol#', '--sol'],
        ['Lá#', '--la'],
        ['Si', '--si'],
        ['Dó#', '--do'],
        ['Ré#', '--re'],
        ['Mi#', '--mi'],
        ['Fá#', '--fa']
      ]
    },

    {
      id: 'db',
      nome: 'RÉb',
      cor: '--re',
      freq: 277.18,
      escala: [
        ['Réb', '--re'],
        ['Mib', '--mi'],
        ['Fá', '--fa'],
        ['Solb', '--sol'],
        ['Láb', '--la'],
        ['Sib', '--si'],
        ['Dó', '--do'],
        ['Réb', '--re']
      ]
    },

    {
      id: 'ab',
      nome: 'LÁb',
      cor: '--la',
      freq: 415.30,
      escala: [
        ['Láb', '--la'],
        ['Sib', '--si'],
        ['Dó', '--do'],
        ['Réb', '--re'],
        ['Mib', '--mi'],
        ['Fá', '--fa'],
        ['Sol', '--sol'],
        ['Láb', '--la']
      ]
    },

    {
      id: 'eb',
      nome: 'MIb',
      cor: '--mi',
      freq: 311.13,
      escala: [
        ['Mib', '--mi'],
        ['Fá', '--fa'],
        ['Sol', '--sol'],
        ['Láb', '--la'],
        ['Sib', '--si'],
        ['Dó', '--do'],
        ['Ré', '--re'],
        ['Mib', '--mi']
      ]
    },

    {
      id: 'bb',
      nome: 'SIb',
      cor: '--si',
      freq: 466.16,
      escala: [
        ['Sib', '--si'],
        ['Dó', '--do'],
        ['Ré', '--re'],
        ['Mib', '--mi'],
        ['Fá', '--fa'],
        ['Sol', '--sol'],
        ['Lá', '--la'],
        ['Sib', '--si']
      ]
    },

    {
      id: 'f',
      nome: 'FÁ',
      cor: '--fa',
      freq: 349.23,
      escala: [
        ['Fá', '--fa'],
        ['Sol', '--sol'],
        ['Lá', '--la'],
        ['Sib', '--si'],
        ['Dó', '--do'],
        ['Ré', '--re'],
        ['Mi', '--mi'],
        ['Fá', '--fa']
      ]
    }

  ];


  /* =====================================================
     ELEMENTOS
  ===================================================== */

  const $ = selector =>
    document.querySelector(selector);


  const start =
    $('#start-screen');

  const game =
    $('#game-area');

  const victory =
    $('#victory-screen');


  const canvas =
    $('#canvas-roleta');

  const ctx =
    canvas.getContext('2d');


  const btnAction =
    $('#btn-acao');

  const feedback =
    $('#feedback-txt');

  const helper =
    $('#helper-text');

  const scale =
    $('#escala-display');


  const settings =
    $('#settings-dropdown');

  const sfxBtn =
    $('#toggle-sfx');

  const musicBtn =
    $('#toggle-music');


  /* =====================================================
     ESTADO
  ===================================================== */

  let pool =
    [...notas];

  let round =
    1;

  let angle =
    0;

  let state =
    'spin';

  let audioCtx =
    null;

  let bgmTimer =
    null;

  let sfxMuted =
    false;

  let musicMuted =
    false;


  /* =====================================================
     WEB AUDIO API
  ===================================================== */

  function initAudio() {

    if (!audioCtx) {

      audioCtx =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();

    }


    if (
      audioCtx.state ===
      'suspended'
    ) {

      audioCtx.resume();

    }

  }


  /* EFEITOS SONOROS */

  function tone(
    freq,
    dur = .12,
    type = 'sine',
    vol = .08
  ) {

    if (
      sfxMuted ||
      !audioCtx
    ) return;


    const oscillator =
      audioCtx.createOscillator();

    const gain =
      audioCtx.createGain();

    const now =
      audioCtx.currentTime;


    oscillator.type =
      type;

    oscillator.frequency
      .setValueAtTime(
        freq,
        now
      );


    gain.gain
      .setValueAtTime(
        .0001,
        now
      );


    gain.gain
      .exponentialRampToValueAtTime(
        vol,
        now + .012
      );


    gain.gain
      .exponentialRampToValueAtTime(
        .001,
        now + dur
      );


    oscillator.connect(gain);

    gain.connect(
      audioCtx.destination
    );


    oscillator.start(now);

    oscillator.stop(
      now + dur + .02
    );

  }


  /* MÚSICA INDEPENDENTE */

  function bgmTone(
    freq,
    dur = .48,
    vol = .038
  ) {

    if (
      musicMuted ||
      !audioCtx
    ) return;


    const oscillator =
      audioCtx.createOscillator();

    const gain =
      audioCtx.createGain();

    const now =
      audioCtx.currentTime;


    oscillator.type =
      'sine';


    oscillator.frequency
      .setValueAtTime(
        freq,
        now
      );


    gain.gain
      .setValueAtTime(
        .0001,
        now
      );


    gain.gain
      .exponentialRampToValueAtTime(
        vol,
        now + .035
      );


    gain.gain
      .exponentialRampToValueAtTime(
        .0001,
        now + dur
      );


    oscillator.connect(gain);

    gain.connect(
      audioCtx.destination
    );


    oscillator.start(now);

    oscillator.stop(
      now + dur + .04
    );

  }


  function clickSound() {

    tone(
      650,
      .08,
      'triangle',
      .05
    );

  }


  function winTone(freq) {

    if (
      sfxMuted ||
      !audioCtx
    ) return;


    [
      1,
      1.25,
      1.5
    ]
    .forEach(
      (multiplier, index) => {

        setTimeout(
          () => {

            tone(
              freq * multiplier,
              .45,
              'triangle',
              .10
            );

          },

          index * 110
        );

      }
    );

  }


  /* =====================================================
     MÚSICA DE FUNDO
     ESCALA DE DÓ MAIOR
  ===================================================== */

  function startMusic() {

    stopMusic();


    if (
      musicMuted ||
      !audioCtx
    ) return;


    const cMajor = [

      261.63, // Dó
      293.66, // Ré
      329.63, // Mi
      349.23, // Fá
      392.00, // Sol
      440.00, // Lá
      493.88, // Si
      523.25, // Dó

      493.88, // Si
      440.00, // Lá
      392.00, // Sol
      349.23, // Fá
      329.63, // Mi
      293.66  // Ré

    ];


    let i = 0;


    bgmTone(
      cMajor[i++],
      .52,
      .038
    );


    bgmTimer =
      setInterval(
        () => {

          if (
            !musicMuted &&
            game.style.display !== 'none' &&
            !document.hidden
          ) {

            bgmTone(
              cMajor[
                i++ %
                cMajor.length
              ],
              .52,
              .038
            );

          }

        },

        620
      );

  }


  function stopMusic() {

    if (bgmTimer) {

      clearInterval(
        bgmTimer
      );

      bgmTimer =
        null;

    }

  }


  /* =====================================================
     SOM DOS BOTÕES
  ===================================================== */

  document
    .querySelectorAll(
      '.sound-click'
    )
    .forEach(
      button => {

        button
          .addEventListener(
            'click',
            () => {

              initAudio();

              clickSound();

            }
          );

      }
    );


  /* =====================================================
     DESENHAR ROLETA
  ===================================================== */

  function drawWheel() {

    const total =
      notas.length;

    const slice =
      Math.PI * 2 /
      total;


    ctx.clearRect(
      0,
      0,
      500,
      500
    );


    notas.forEach(
      (note, index) => {

        const angle =
          index *
          slice;


        const color =
          getComputedStyle(
            document.documentElement
          )
          .getPropertyValue(
            note.cor
          )
          .trim();


        ctx.beginPath();

        ctx.moveTo(
          250,
          250
        );


        ctx.arc(
          250,
          250,
          242,
          angle,
          angle + slice
        );


        ctx.fillStyle =
          color;

        ctx.fill();


        ctx.lineWidth =
          2;


        ctx.strokeStyle =
          'rgba(255,255,255,.5)';


        ctx.stroke();


        ctx.save();


        ctx.translate(
          250,
          250
        );


        ctx.rotate(
          angle +
          slice / 2
        );


        ctx.fillStyle =
          '#fff';


        ctx.font =
          '800 22px Inter';


        ctx.textAlign =
          'right';


        ctx.textBaseline =
          'middle';


        ctx.shadowColor =
          'rgba(0,0,0,.28)';


        ctx.shadowBlur =
          4;


        ctx.fillText(
          note.nome,
          202,
          0
        );


        ctx.restore();

      }
    );

  }


  /* =====================================================
     TROCA DE TELAS
  ===================================================== */

  function showScreen(element) {

    [
      start,
      game,
      victory
    ]
    .forEach(
      screen => {

        screen.style.opacity =
          '0';


        setTimeout(
          () => {

            if (
              screen !==
              element
            ) {

              screen.style.display =
                'none';

            }

          },

          380
        );

      }
    );


    setTimeout(
      () => {

        element.style.display =
          'flex';


        requestAnimationFrame(
          () => {

            element.style.opacity =
              '1';

          }
        );

      },

      390
    );

  }


  /* =====================================================
     FULLSCREEN
  ===================================================== */

  function fullscreen(on) {

    const documentRef =
      document;


    if (on) {

      document
        .documentElement
        .requestFullscreen?.()
        .catch(
          () => {}
        );

    }
    else if (
      documentRef.fullscreenElement
    ) {

      documentRef
        .exitFullscreen?.()
        .catch(
          () => {}
        );

    }

  }


  /* =====================================================
     PROGRESSO
  ===================================================== */

  function updateProgress() {

    $('#pontos')
      .textContent =
      round;


    $('#round-badge')
      .textContent =
      `Rodada ${round}`;


    $('#progress-fill')
      .style.width =
      `${
        ((round - 1) / 12) * 100
      }%`;

  }


  /* =====================================================
     RESET DA RODADA
  ===================================================== */

  function resetRoundView() {

    state =
      'spin';


    btnAction.textContent =
      'GIRAR ROLETA';


    btnAction
      .classList
      .remove('done');


    btnAction.disabled =
      false;


    feedback.textContent =
      'Prepare o seu instrumento';


    helper.textContent =
      'A roleta escolherá uma tonalidade. Depois, toque a escala indicada no seu instrumento.';


    scale.innerHTML =
      '';


    scale
      .classList
      .add('hidden');


    $('#container-roleta')
      .style.opacity =
      '1';


    updateProgress();

  }


  function resetGame() {

    pool =
      [...notas];


    round =
      1;


    angle =
      0;


    canvas.style.transform =
      'rotate(0deg)';


    resetRoundView();

  }


  /* =====================================================
     GIRAR ROLETA
  ===================================================== */

  function spin() {

    initAudio();


    /* ALUNO JÁ TOCOU */

    if (
      state ===
      'done'
    ) {

      if (
        round >= 12
      ) {

        finish();

        return;

      }


      round++;


      resetRoundView();


      return;

    }


    btnAction.disabled =
      true;


    feedback.textContent =
      'Sorteando a escala...';


    helper.textContent =
      'Atenção à tonalidade indicada pela roleta.';


    /* ESCOLHE UMA TONALIDADE */

    const randomIndex =
      Math.floor(
        Math.random() *
        pool.length
      );


    const winner =
      pool.splice(
        randomIndex,
        1
      )[0];


    const visualIndex =
      notas.findIndex(
        note =>
          note.id ===
          winner.id
      );


    const slice =
      360 /
      notas.length;


    const center =
      visualIndex *
      slice +
      slice / 2;


    const target =
      270 -
      center;


    let base =
      target -
      (
        angle %
        360
      );


    if (
      base < 0
    ) {

      base +=
        360;

    }


    const jitter =
      (
        Math.random() *
        slice *
        .5
      )
      -
      (
        slice *
        .25
      );


    const extra =
      (
        Math.floor(
          Math.random() *
          3
        )
        +
        5
      )
      *
      360;


    const total =
      base +
      jitter +
      extra;


    angle +=
      total;


    canvas.style.transform =
      `rotate(${angle}deg)`;


    /* =====================================================
       SOM DA ROLETA
       TICKS DESACELERANDO
    ===================================================== */

    let spinTickTimer =
      null;


    const spinStartedAt =
      performance.now();


    const spinDuration =
      3850;


    function wheelTick() {

      if (
        sfxMuted ||
        !audioCtx
      ) return;


      const elapsed =
        performance.now() -
        spinStartedAt;


      const progress =
        Math.min(
          1,
          elapsed /
          spinDuration
        );


      const freq =
        260 -
        (
          progress *
          70
        );


      tone(
        freq,
        .045,
        'square',
        .075
      );


      if (
        progress <
        1
      ) {

        const nextDelay =
          55 +
          (
            progress *
            progress *
            165
          );


        spinTickTimer =
          setTimeout(
            wheelTick,
            nextDelay
          );

      }

    }


    wheelTick();


    /* =====================================================
       RESULTADO
    ===================================================== */

    setTimeout(
      () => {

        if (
          spinTickTimer
        ) {

          clearTimeout(
            spinTickTimer
          );

        }


        winTone(
          winner.freq
        );


        feedback.innerHTML =
          `Escala de <strong>${winner.nome}</strong>`;


        helper.textContent =
          'Toque esta sequência no seu instrumento:';


        scale.innerHTML =
          '';


        scale
          .classList
          .remove('hidden');


        winner.escala
          .forEach(
            (
              [name, color],
              index
            ) => {

              setTimeout(
                () => {

                  const note =
                    document
                      .createElement(
                        'div'
                      );


                  note.className =
                    'scale-note';


                  note.textContent =
                    name;


                  note.style
                    .backgroundColor =
                    `var(${color})`;


                  scale
                    .appendChild(
                      note
                    );

                },

                index *
                120
              );

            }
          );


        btnAction.textContent =
          'JÁ TOQUEI!';


        btnAction
          .classList
          .add('done');


        btnAction.disabled =
          false;


        state =
          'done';


        $('#container-roleta')
          .style.opacity =
          '.28';

      },

      4000
    );

  }


  /* =====================================================
     FINAL DO JOGO
  ===================================================== */

  function finish() {

    stopMusic();


    $('#progress-fill')
      .style.width =
      '100%';


    showScreen(
      victory
    );


    fullscreen(
      false
    );


    setTimeout(
      () => {

        initAudio();


        [
          523.25,
          659.25,
          783.99
        ]
        .forEach(
          (
            frequency,
            index
          ) => {

            setTimeout(
              () => {

                tone(
                  frequency,
                  .7,
                  'triangle',
                  .12
                );

              },

              index *
              160
            );

          }
        );

      },

      500
    );

  }


  /* =====================================================
     EVENTOS
  ===================================================== */

  $('#btn-play-big')
    .addEventListener(
      'click',
      () => {

        initAudio();

        resetGame();

        showScreen(
          game
        );

        fullscreen(
          true
        );

        startMusic();


        setTimeout(
          drawWheel,
          450
        );

      }
    );


  $('#btn-back')
    .addEventListener(
      'click',
      () => {

        stopMusic();

        showScreen(
          start
        );

        fullscreen(
          false
        );

      }
    );


  $('#btn-settings')
    .addEventListener(
      'click',
      () => {

        settings
          .classList
          .toggle('hidden');

      }
    );


  /* SFX */

  sfxBtn
    .addEventListener(
      'click',
      () => {

        sfxMuted =
          !sfxMuted;


        sfxBtn
          .classList
          .toggle(
            'muted',
            sfxMuted
          );

      }
    );


  /* MÚSICA */

  musicBtn
    .addEventListener(
      'click',
      () => {

        musicMuted =
          !musicMuted;


        musicBtn
          .classList
          .toggle(
            'muted',
            musicMuted
          );


        if (
          musicMuted
        ) {

          stopMusic();

        }
        else {

          startMusic();

        }

      }
    );


  btnAction
    .addEventListener(
      'click',
      spin
    );


  $('#btn-restart')
    .addEventListener(
      'click',
      () => {

        resetGame();

        showScreen(
          game
        );

        fullscreen(
          true
        );

        startMusic();


        setTimeout(
          drawWheel,
          450
        );

      }
    );


  $('#btn-home-victory')
    .addEventListener(
      'click',
      () => {

        showScreen(
          start
        );

        fullscreen(
          false
        );

      }
    );


  document
    .addEventListener(
      'keydown',
      event => {

        if (
          event.key ===
          'Escape'
          &&
          game.style.display !==
          'none'
        ) {

          settings
            .classList
            .add('hidden');

        }

      }
    );


  /* PRIMEIRO DESENHO */

  drawWheel();

});
