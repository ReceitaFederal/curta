import { ComponenteBase } from "../../bibliotecas/ultima/componente_base.js";

export class CurtaVideo extends ComponenteBase {
  constructor() {
    super({ templateURL: "videos.html", shadowDOM: true }, import.meta.url);
  }

  aoConectar() {
    // Elementos do DOM
    this.videoElement = this.shadowRoot.getElementById("video");
    this.likeCount = this.shadowRoot.getElementById("like-count");
    this.playPauseBtn = this.shadowRoot.getElementById("btn-play-pause");
    this.likeBtn = this.shadowRoot.getElementById("btn-like");

    // Lista de vídeos
    this.videos = [
      {
        src: "./videosteste/video1.mp4",
        inicio: 5,
        fim: 15,
        likes: 0,
      },
      {
        src: "./video2.mp4",
        inicio: 30,
        fim: 35,
        likes: 0,
      },
      {
        src: "videos/video3.mp4",
        inicio: 60,
        fim: 70,
        likes: 0,
      },
    ];

    this.atual = 0;
    this.isPlaying = false;
    this.touchStartY = 0;
    this.isHolding = false;
    this.lastTapTime = 0;

    // Configurações iniciais
    this.setupEventListeners();
    this.carregarVideo(this.atual);
    this.precarregarProximo();

    // Observer para manter proporção 9:16
    this.observer = new ResizeObserver(() => {
      const width = this.shadowRoot.host.clientWidth;
      this.shadowRoot.host.style.height = `${(width * 16) / 9}px`;
    });
    this.observer.observe(this.shadowRoot.host);
  }

  aoDesconectar() {
    this.observer.disconnect();
  }

  setupEventListeners() {
    // Controles
    this.shadowRoot.getElementById("btn-proximo").onclick = () =>
      this.proximo();
    this.playPauseBtn.onclick = () => this.togglePlayPause();
    this.likeBtn.onclick = () => this.curtir();

    // Gestos de Toque
    this.videoElement.addEventListener("touchstart", (e) =>
      this.handleTouchStart(e)
    );
    this.videoElement.addEventListener("touchend", (e) =>
      this.handleTouchEnd(e)
    );
    this.videoElement.addEventListener("touchmove", (e) => e.preventDefault());

    // Long Press para pausar
    this.videoElement.addEventListener("touchstart", () => {
      this.isHolding = true;
      setTimeout(() => {
        if (this.isHolding && this.isPlaying) {
          this.pause();
        }
      }, 500);
    });

    this.videoElement.addEventListener("touchend", () => {
      this.isHolding = false;
    });

    // Eventos de vídeo
    this.videoElement.addEventListener("play", () => {
      this.isPlaying = true;
      this.updatePlayPauseIcon();
    });

    this.videoElement.addEventListener("pause", () => {
      this.isPlaying = false;
      this.updatePlayPauseIcon();
    });
  }

  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
  }

  handleTouchEnd(e) {
    const currentTime = Date.now();
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - this.touchStartY;

    // Double Tap para like (dentro de 300ms)
    if (currentTime - this.lastTapTime < 300) {
      this.curtir();
    }
    this.lastTapTime = currentTime;

    // Swipe para cima/baixo
    if (deltaY < -50) {
      // Swipe para cima
      this.proximo();
    } else if (deltaY > 50) {
      // Swipe para baixo
      this.anterior();
    } else if (!this.isHolding) {
      // Tap simples
      this.togglePlayPause();
    }
  }

  carregarVideo(index) {
    const video = this.videos[index];
    if (!video) return;

    this.videoElement.src = `${video.src}#t=${video.inicio},${video.fim}`;
    this.videoElement.currentTime = video.inicio;
    this.likeCount.textContent = video.likes;

    this.videoElement.onloadedmetadata = () => {
      this.videoElement.currentTime = video.inicio;
    };

    this.videoElement.ontimeupdate = () => {
      if (this.videoElement.currentTime >= video.fim) {
        this.videoElement.currentTime = video.inicio;
        if (!this.isHolding) this.videoElement.play();
      }
    };

    this.videoElement
      .play()
      .catch((e) => console.log("Autoplay bloqueado:", e));
  }

  precarregarProximo() {
    const nextIndex = (this.atual + 1) % this.videos.length;
    const nextVideo = new Audio();
    nextVideo.src = this.videos[nextIndex].src;
    nextVideo.load();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updatePlayPauseIcon() {
    const icon = this.playPauseBtn.querySelector("i");
    icon.className = this.isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
  }

  curtir() {
    this.videos[this.atual].likes++;
    this.likeCount.textContent = this.videos[this.atual].likes;

    // Animação de like
    const icon = this.likeBtn.querySelector("i");
    icon.className = "fa-solid fa-heart";
    icon.style.color = "#ff0000";
    setTimeout(() => {
      icon.style.color = "";
    }, 1000);
  }

  proximo() {
    this.atual = (this.atual + 1) % this.videos.length;
    this.carregarVideo(this.atual);
    this.precarregarProximo();
  }

  anterior() {
    this.atual = (this.atual - 1 + this.videos.length) % this.videos.length;
    this.carregarVideo(this.atual);
  }

  play() {
    this.videoElement.play();
  }

  pause() {
    this.videoElement.pause();
  }
}

customElements.define("br-video", CurtaVideo);
