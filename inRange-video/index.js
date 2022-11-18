let canPlayAudio = false;

document.getElementById('event').addEventListener('click', () => {
  document.getElementById('audio').play();
  document.getElementById('audio').pause();
  console.dir(document.getElementById('audio'));
  canPlayAudio = true;
});

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
  const select = document.getElementById('select');
  let minMat = cv.matFromArray(
    1,
    3,
    cv.CV_8UC1,
    [
      0,
      0,
      64
    ]
  );
  let maxMat = cv.matFromArray(
    1,
    3,
    cv.CV_8UC1,
    [
      255,
      255,
      255
    ]
  );

  select.addEventListener('input', (evt) => {
    const notBlackMinMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        0,
        0,
        64
      ]
    );
    const notBlackMaxMat = cv.matFromArray(
      1,
      3,
      cv.CV_8UC1,
      [
        255,
        255,
        255
      ]
    );
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
      case 'blue':
        renderInput(blueMinMat, blueMaxMat);
        break;
      case 'green':
        renderInput(greenMinMat, greenMaxMat);
        break;
      case 'yellow':
        renderInput(yellowMinMat, yellowMaxMat);
        break;
      case 'default':
        renderInput(notBlackMinMat, notBlackMaxMat);
    }
  });

  const spans = document.querySelectorAll('#ui span');

  [].slice.call(document.querySelectorAll('#ui input')).forEach((input, i) => {
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
    const width = video.clientWidth / 2;
    const height = video.clientHeight / 2;
    const srcCanvas = document.getElementById('src');
    const srcContext = srcCanvas.getContext('2d');
    const distMat = new cv.Mat();

    processVideo();

    function processVideo() {
      try {
        const FPS = 8;
        const begin = Date.now();

        srcCanvas.width = width;
        srcCanvas.height = height;
        srcContext.drawImage(video, 0, 0, width, height);

        let srcMat = cv.imread(srcCanvas);

        cv.cvtColor(srcMat, distMat, cv.COLOR_RGB2HSV_FULL);
        // cv.inRange(distMat, minMat, maxMat, distMat);
        // cv.medianBlur(distMat, distMat, 9);
        cv.imshow('dist', distMat);

        // const ratio = cv.countNonZero(distMat) / (distMat.cols * distMat.rows);

        // if (canPlayAudio && .1 <= ratio) {
        //   canPlayAudio = false;
        //   document.getElementById('audio').currentTime = 0;
        //   document.getElementById('audio').play();

        //   setTimeout(() => canPlayAudio = true, 2000);
        // }

        // document.getElementById('ratio').innerText = `${ ratio * 100}%`;

        srcMat = null;
      } catch (err) {
        console.error(err);
      }

      const delay = 1000 / FPS - (Date.now() - begin);

      setTimeout(processVideo, delay);
    }
  };

  video.srcObject = stream;
}

function errorCallback(err) {
  console.error(err);
}