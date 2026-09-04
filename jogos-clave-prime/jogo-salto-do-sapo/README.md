# 🐸 Salto do Sapo — Tom, Semitom e Contagem (Padrão Ouro Clave Prime)

O **Salto do Sapo** é um jogo educativo de musicalização desenvolvido no **Padrão Ouro Clave Prime**. O objetivo pedagógico é ensinar a diferença entre **Tom**, **Semitom** e a **Contagem de Intervalos** no teclado de forma lúdica, visual e interativa.

---

## 🎯 Objetivos Pedagógicos

* **Semitom:** Compreender a menor distância entre duas notas adjacentes no teclado (1 tecla de distância).
* **Tom:** Fixar o conceito de 2 semitons de distância (avanço de 2 teclas adjacentes).
* **Contagem de Intervalos:** Desenvolver a percepção e contagem quantitativa de semitons entre duas notas.
* **Mapeamento Teórico-Prático:** Associar a teoria musical ao teclado virtual ou a um piano físico via conexão MIDI.

---

## ✨ Destaques e Funcionalidades

* **Arquitetura Padrão Ouro (Clean UI):** Tela inicial integrada com instruções diretas, botão Play Gigante com animação de pulso e transição suave em *fade*.
* **Modo Cinema Fullscreen:** Expansão automática para tela cheia ao iniciar a partida, promovendo imersão total.
* **Síntese de Áudio Nativa (Web Audio API):** Todos os sons (piano com envelope ADSR, efeito de *splash* aquático, sons de clique e música de fundo em *loop*) são gerados matematicamente em tempo real, sem necessidade de carregar arquivos de áudio `.mp3` externos.
* **Suporte a Teclados MIDI (USB/Web MIDI API):** O aluno pode responder aos desafios tocando diretamente em um teclado/piano digital conectado ao dispositivo.
* **Mecânica de Salto e Trajetória Precisa:** Cálculo percentual sincronizado da física do salto para garantir que o sapo aterrisse exatamente no centro da vitória-régia alvo.
* **Design 100% Responsivo e Blindado:** Funciona perfeitamente em celulares, tablets e computadores, com tratamento de transição via DOM que previne o "Bug do Display Fantasma".
* **Controles de Áudio Independentes:** Menu lateral estilo *dropdown* recolhível com seletores independentes para mutar/desmutar a Música de Fundo (BGM) e os Efeitos Sonoros (SFX).

---

## 📂 Estrutura de Arquivos

```text
salto-do-sapo-midi-tom-semitom/
├── index.html   # Esqueleto semântico, estrutura de menus e área do lago
├── style.css    # Identidade visual Clave Prime, animações e responsividade
├── script.js    # Motor de áudio (Web Audio API), lógica dos desafios e suporte MIDI
└── README.md    # Documentação oficial do projeto