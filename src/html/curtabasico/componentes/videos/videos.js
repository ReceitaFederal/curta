import { ComponenteBase } from "../../bibliotecas/ultima/componente_base.js";

export class CurtaVideo extends ComponenteBase {
  constructor() {
    super({ templateURL: "videos.html", shadowDOM: true }, import.meta.url);
    console.log("CurtaVideo carregado!");
  }

  aoConectar() {
    this.videoElement = this.shadowRoot.getElementById("video");

    this.videos = [
      { src: "/videosteste/videoteste.mp4", inicio: 5, fim: 15 },
      { src: "/videosteste/videoteste.mp4", inicio: 30, fim: 35 },
      { src: "/videosteste/videoteste.mp4", inicio: 60, fim: 70 },
    ];

    this.atual = 0;

    this.shadowRoot.getElementById("btn-anterior").onclick = () =>
      this.anterior();
    this.shadowRoot.getElementById("btn-play").onclick = () => this.play();
    this.shadowRoot.getElementById("btn-pause").onclick = () => this.pause();
    this.shadowRoot.getElementById("btn-proximo").onclick = () =>
      this.proximo();

    this.tocarVideo(this.atual);
  }

  tocarVideo(index) {
    const video = this.videos[index];
    if (!video) return;

    this.videoElement.src = `${video.src}#t=${video.inicio},${video.fim}`;
    this.videoElement.currentTime = video.inicio;
    this.videoElement.play();

    this.videoElement.onloadedmetadata = () => {
      this.videoElement.currentTime = video.inicio;
    };

    this.videoElement.ontimeupdate = () => {
      if (this.videoElement.currentTime >= video.fim) {
        this.videoElement.currentTime = video.inicio;
      }
    };
  }

  proximo() {
    this.atual = (this.atual + 1) % this.videos.length;
    this.tocarVideo(this.atual);
  }

  anterior() {
    this.atual = (this.atual - 1 + this.videos.length) % this.videos.length;
    this.tocarVideo(this.atual);
  }

  play() {
    this.videoElement.play();
  }

  pause() {
    this.videoElement.pause();
  }
}

customElements.define("br-video", CurtaVideo);
