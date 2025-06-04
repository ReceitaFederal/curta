import React, { useState, useRef, useEffect } from "react";

const videos = [
  { src: "/videos/videoteste.mp4", inicio: 1, fim: 5 },
  { src: "/videos/videoteste2.mp4", inicio: 9, fim: 15 },
  { src: "/videos/videoteste2.mp4", inicio: 17, fim: 20 },
];

const CurtaVideo = () => {
  const [atual, setAtual] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    const video = videos[atual];

    videoElement.src = `${video.src}#t=${video.inicio},${video.fim}`;

    const onLoadedMetadata = () => {
      videoElement.currentTime = video.inicio;
      videoElement.play();
    };

    const onTimeUpdate = () => {
      if (videoElement.currentTime >= video.fim) {
        videoElement.currentTime = video.inicio;
      }
    };

    videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
    videoElement.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      videoElement.pause();
      videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
      videoElement.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [atual]);

  const proximo = () => {
    setAtual((prev) => (prev + 1) % videos.length);
  };

  const anterior = () => {
    setAtual((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", color: "white" }}>
      <h2>Curta - Receita Federal</h2>
      <video
        ref={videoRef}
        width="100%"
        controls
        muted
        playsInline
        style={{ borderRadius: "10px", backgroundColor: "black" }}
      ></video>

      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <button onClick={anterior}>◀ Anterior</button>
        <button onClick={() => videoRef.current?.play()}>▶ Play</button>
        <button onClick={() => videoRef.current?.pause()}>⏸ Pause</button>
        <button onClick={proximo}>Próximo ▶</button>
      </div>
    </div>
  );
};

export default CurtaVideo;
