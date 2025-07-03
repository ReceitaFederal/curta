class Curta extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentIndex = 0;
    this.videos = [
      { src: "./teste/video1.mp4" },
      { src: "./teste/video2.mp4" },
      { src: "./teste/videoplayback.mp4" },
      { src: "./teste/v09044g40000cu9qmofog65srs5m8rcg.mp4" },
    ];
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 400px;
          aspect-ratio: 9/13;
          background: black;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }

        video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          background: black;
        }

        .controles {
          position: absolute;
          right: 10px;
          bottom: 50px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 10;
        }

        .controles button {
          background-color: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: white;
          cursor: pointer;
          font-size: 18px;
        }

        .volume-control {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .volume-control input[type="range"] {
          width: 0;
          opacity: 0;
          transition: all 0.3s;
        }

        .volume-control:hover input[type="range"] {
          width: 80px;
          opacity: 1;
        }

        .gesture-area {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          display: flex;
          z-index: 5;
        }

        .gesture-area div {
          flex: 1;
        }

        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 6px;
          width: 100%;
          background-color: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          z-index: 9;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: #007bff;
          width: 0%;
        }

        .gesture-hint {
          position: absolute;
          top: 8px;
          left: 12px;
          color: white;
          font-size: 0.75rem;
          z-index: 10;
        }
      </style>

      <video playsinline></video>

      <div class="progress-bar">
        <div class="progress-bar-fill"></div>
      </div>

      <div class="controles">
        <button id="btn-play" title="Play/Pause">▶️</button>
        <button id="btn-copy" title="Copiar link">🔗</button>
        <div class="volume-control">
          <button id="volume-btn" title="Volume">🔊</button>
          <input type="range" id="volume-range" min="0" max="1" step="0.1" value="1" />
        </div>
      </div>

      <div class="gesture-area">
        <div id="area-esquerda"></div>
        <div id="area-meio"></div>
        <div id="area-direita"></div>
      </div>
    `;
    this.loadVideo();
  }

  loadVideo() {
    const video = this.shadowRoot.querySelector("video");
    video.src = this.videos[this.currentIndex].src;
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    video.play();
  }

  setupEvents() {
    const video = this.shadowRoot.querySelector("video");
    const btnPlay = this.shadowRoot.getElementById("btn-play");
    const btnCopy = this.shadowRoot.getElementById("btn-copy");
    const btnVolume = this.shadowRoot.getElementById("volume-btn");
    const volumeRange = this.shadowRoot.getElementById("volume-range");
    const progressBar = this.shadowRoot.querySelector(".progress-bar");
    const progressFill = this.shadowRoot.querySelector(".progress-bar-fill");

    const esquerda = this.shadowRoot.getElementById("area-esquerda");
    const meio = this.shadowRoot.getElementById("area-meio");
    const direita = this.shadowRoot.getElementById("area-direita");

    // Play/pause com alternância de ícone
    btnPlay.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        btnPlay.textContent = "⏸️";
      } else {
        video.pause();
        btnPlay.textContent = "▶️";
      }
    });

    // Copiar link
    btnCopy.addEventListener("click", () => {
      navigator.clipboard.writeText(video.src);
      const toast = document.getElementById("toast");
      if (toast) {
        toast.classList.add("active");
        setTimeout(() => toast.classList.remove("active"), 2000);
      }
    });

    // Volume range
    volumeRange.addEventListener("input", () => {
      video.volume = volumeRange.value;
      if (video.volume == 0) {
        video.muted = true;
        btnVolume.textContent = "🔇";
      } else {
        video.muted = false;
        btnVolume.textContent = "🔊";
      }
    });

    // Botão de mute/unmute
    btnVolume.addEventListener("click", () => {
      video.muted = !video.muted;
      btnVolume.textContent = video.muted ? "🔇" : "🔊";
      volumeRange.value = video.muted ? 0 : video.volume;
    });

    // Barra de progresso
    video.addEventListener("timeupdate", () => {
      const percent = (video.currentTime / video.duration) * 100;
      progressFill.style.width = `${percent}%`;
    });

    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = clickX / rect.width;
      video.currentTime = percent * video.duration;
    });

    // Navegação por áreas
    esquerda.addEventListener("click", () => {
      this.currentIndex =
        (this.currentIndex - 1 + this.videos.length) % this.videos.length;
      this.loadVideo();
    });

    direita.addEventListener("click", () => {
      this.currentIndex = (this.currentIndex + 1) % this.videos.length;
      this.loadVideo();
    });

    meio.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        btnPlay.textContent = "⏸️";
      } else {
        video.pause();
        btnPlay.textContent = "▶️";
      }
    });
  }
}

customElements.define("br-video", Curta);
