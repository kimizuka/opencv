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
  const imgLength = 3;
  const videoMatList = [];
  const blackAndWhiteMatList = [];
  const diffMatList = [];
  const FPS = 4;
  const video = document.getElementById('video');
  const canvasList = [].slice.call(document.querySelectorAll('canvas'));
  const contextList = canvasList.map((canvas) => canvas.getContext('2d'));

  video.oncanplay = () => {
    const width = video.clientWidth / 4;
    const height = video.clientHeight / 4;
    const bitwiseMat = new cv.Mat(height, width, cv.CV_8UC1);
    const distCanvas = document.getElementById('dist');
    const distCtx = distCanvas.getContext('2d');

    for (let i = 0; i < imgLength; ++i) {
      videoMatList.push(new cv.Mat(height, width, cv.CV_8UC4));
      blackAndWhiteMatList.push(new cv.Mat(height, width, cv.CV_8UC1));
    }

    canvasList.forEach((canvas) => {
      canvas.width = width;
      canvas.height = height;
    });

    processVideo();

    function processVideo() {
      const begin = Date.now();

      contextList[0].drawImage(video, 0, 0, width, height);

      videoMatList[1].copyTo(videoMatList[2]);
      videoMatList[0].copyTo(videoMatList[1]);
      videoMatList[0].data.set(contextList[0].getImageData(0, 0, width, height).data);

      for (let i = 0; i < videoMatList.length; ++i) {
        cv.cvtColor(videoMatList[i], blackAndWhiteMatList[i], cv.COLOR_RGB2GRAY);
        cv.imshow(`c${ i + 1 }`, videoMatList[i]);
        cv.imshow(`m${ i + 1 }`, blackAndWhiteMatList[i]);
      }

      for (let i = 0; i < videoMatList.length - 1; ++i) {
        diffMatList.push(new cv.Mat(height, width, cv.CV_8UC1));

        cv.absdiff(blackAndWhiteMatList[i], blackAndWhiteMatList[i + 1], diffMatList[i]);
        cv.imshow(`diff-${ i + 1 }`, diffMatList[i]);
      }

      const dilateSize = 8;

      cv.bitwise_and(diffMatList[0], diffMatList[1], bitwiseMat);
      cv.threshold(bitwiseMat, bitwiseMat, 127, 255, cv.THRESH_BINARY);
      cv.dilate(
        bitwiseMat,
        bitwiseMat,
        cv.Mat.ones(dilateSize, dilateSize, cv.CV_8U),
        new cv.Point(dilateSize / 2, dilateSize / 2),
        1,
        cv.BORDER_CONSTANT,
        cv.morphologyDefaultBorderValue()
      );
      cv.erode(
        bitwiseMat,
        bitwiseMat,
        cv.Mat.ones(dilateSize / 4, dilateSize / 4, cv.CV_8U),
        new cv.Point(dilateSize / 8, dilateSize / 8),
        1,
        cv.BORDER_CONSTANT,
        cv.morphologyDefaultBorderValue()
      );
      cv.bitwise_not(bitwiseMat, bitwiseMat);
      cv.imshow('diff', bitwiseMat);

      distCanvas.width = width;
      distCanvas.height = height;

      distCtx.save();
        distCtx.drawImage(document.getElementById('c2'), 0, 0);
        distCtx.globalCompositeOperation = 'lighter';
        distCtx.drawImage(document.getElementById('diff'), 0, 0);
      distCtx.restore();

      const delay = 1000 / FPS - (Date.now() - begin);

      setTimeout(processVideo, delay);
    }
  };

  video.srcObject = stream;
}

function errorCallback(err) {
  alert(err);
};