const Module = {
  onRuntimeInitialized() {
    const medias = {
      audio: false,
      video: {
        facingMode: { exact: 'environment' }
      }
    };

    navigator.mediaDevices.getUserMedia(medias).then(successCallback)
                                               .catch(errorCallback);
  }
};

function successCallback(stream) {
  const video = document.getElementById('video');
  const select = document.getElementById('select');
  const srcCanvas = document.getElementById('src');
  const srcCtx = srcCanvas.getContext('2d');
  const spans = document.querySelectorAll('#ui .min-max span');
  let minMat;
  let maxMat;

  select.addEventListener('input', (evt) => {
    const red1MinMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        0,
        64,
        0
      ]
    );
    const red1MaxMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        21,
        255,
        255
      ]
    );
    const red2MinMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        212,
        64,
        0
      ]
    );
    const red2MaxMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        255,
        255,
        255
      ]
    );
    const blueMinMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        127,
        64,
        0
      ]
    );
    const blueMaxMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        213,
        255,
        255
      ]
    );
    const greenMinMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        43,
        64,
        0
      ]
    );
    const greenMaxMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        127,
        255,
        255
      ]
    );
    const yellowMinMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        30,
        51,
        0
      ]
    );
    const yellowMaxMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        43,
        255,
        255
      ]
    );

    switch (evt.target.value) {
      case 'red':
        renderInput(red1MinMat, red1MaxMat);
        break;
      case 'red2':
        renderInput(red2MinMat, red2MaxMat);
        break;
      case 'blue':
        renderInput(blueMinMat, blueMaxMat);
        break;
      case 'green':
        renderInput(greenMinMat, greenMaxMat);
        break;
      case 'yellow':
        renderInput(yellowMinMat, yellowMaxMat);
        break;
      default:
        renderInput(notBlackMinMat, notBlackMaxMat);
    }
  });

  select.dispatchEvent(new Event('input', {
    target: select
  }));

  [].slice.call(document.querySelectorAll('#ui .min-max input')).forEach((input, i) => {
    input.addEventListener('change', (evt) => {
      spans[i].innerText = evt.target.value;

      if (i < 3) {
        minMat.data[i] = Number(evt.target.value);
      } else {
        maxMat.data[i - 3] = Number(evt.target.value);
      }
    })
  });

  function renderInput(min, max) {
    const inputs = document.querySelectorAll('#ui input');

    minMat = min;
    maxMat = max;

    min.data.forEach((val, i) => {
      inputs[i].value = val;
      spans[i].innerText = val;
      minMat.data[i] = Number(val);
    });

    max.data.forEach((val, i) => {
      inputs[i + 3].value = val;
      spans[i + 3].innerText = val;
      maxMat.data[i] = Number(val);
    });
  }

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

      cv.cvtColor(srcMat, distMat, cv.COLOR_RGB2HSV_FULL);
      cv.inRange(distMat, minMat, maxMat, distMat);
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