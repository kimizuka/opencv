const Module = {
  onRuntimeInitialized() {
    const medias = {
      audio: false,
      video: {
        facingMode: 'user'
      }
    };

    navigator.mediaDevices.getUserMedia(medias).then(successCallback)
                                               .catch(errorCallback);
  }
};

function successCallback(stream) {
  const video = document.getElementById('video');
  const srcCanvas = document.getElementById('src');
  const srcCtx = srcCanvas.getContext('2d');

  video.oncanplay = () => {
    const width = video.clientWidth;
    const height = video.clientHeight;

    const srcMat = new cv.Mat(height, width, cv.CV_8UC4);
    const distMat = new cv.Mat();

    processVideo();

    function processVideo() {
      srcCanvas.width = width;
      srcCanvas.height = height;
      srcCtx.drawImage(video, 0, 0, width, height);
      srcMat.data.set(srcCtx.getImageData(0, 0, width, height).data);

      cv.cvtColor(srcMat, distMat, cv.COLOR_RGBA2RGB);
      cv.medianBlur(distMat, distMat, 3);
      cv.imshow('dist', distMat);

      requestAnimationFrame(processVideo);
    }
  };

  video.srcObject = stream;
};

function errorCallback(err) {
  alert(err);
};