const Module = {
  onRuntimeInitialized() {
    const medias = {
      audio: false,
      video: {
        facingMode: 'user'
      }
    };
    const promise = navigator.mediaDevices.getUserMedia(medias);

    promise.then(successCallback).catch(errorCallback);
  }
};

function successCallback(stream) {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  video.oncanplay = () => {
    const width = video.clientWidth;
    const height = video.clientHeight;

    const src = new cv.Mat(height, width, cv.CV_8UC4);
    const dist = new cv.Mat(height, width, cv.CV_8UC1);

    canvas.width = width;
    canvas.height = height;

    processVideo();

    function processVideo() {
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(video, 0, 0, width, height);
      src.data.set(ctx.getImageData(0, 0, width, height).data);

      cv.cvtColor(src, dist, cv.COLOR_RGB2HSV_FULL);
      cv.imshow('canvas', dist);

      requestAnimationFrame(processVideo);
    }
  };

  video.srcObject = stream;
};

function errorCallback(err) {
  alert(err);
};