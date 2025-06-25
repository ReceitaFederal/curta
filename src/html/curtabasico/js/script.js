document.addEventListener("DOMContentLoaded", () => {
  const brVideo = document.querySelector("br-video");

  document.querySelector(".prev-button").addEventListener("click", () => {
    if (brVideo.currentIndex > 0) {
      brVideo.currentIndex--;
    } else {
      brVideo.currentIndex = brVideo.videos.length - 1;
    }
    brVideo.loadVideo();
  });

  document.querySelector(".next-button").addEventListener("click", () => {
    brVideo.currentIndex = (brVideo.currentIndex + 1) % brVideo.videos.length;
    brVideo.loadVideo();
  });
});
