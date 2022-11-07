document.getElementById('event').addEventListener('click', () => {
  const modeLength = 3;
  const elm = document.querySelector('[data-mode-index]');
  const modeIndex = (Number(elm.dataset.modeIndex) + 1) % modeLength;

  elm.dataset.modeIndex = modeIndex
});

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

      cv.bitwise_and(diffMatList[0], diffMatList[1], bitwiseMat);
      cv.threshold(bitwiseMat, bitwiseMat, 127, 255, cv.THRESH_BINARY);
      cv.dilate(
        bitwiseMat,
        bitwiseMat,
        cv.Mat.ones(8, 8, cv.CV_8U),
        new cv.Point(4, 4),
        1,
        cv.BORDER_CONSTANT,
        cv.morphologyDefaultBorderValue()
      );
      cv.erode(
        bitwiseMat,
        bitwiseMat,
        cv.Mat.ones(2, 2, cv.CV_8U),
        new cv.Point(1, 1),
        1,
        cv.BORDER_CONSTANT,
        cv.morphologyDefaultBorderValue()
      );
      cv.bitwise_not(bitwiseMat, bitwiseMat);
      cv.imshow('diff', bitwiseMat);

      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();

      cv.findContours(
        bitwiseMat,
        contours,
        hierarchy,
        cv.RETR_LIST,
        cv.CHAIN_APPROX_SIMPLE,
        { x: 0, y: 0 }
      );

      if (1 < contours.size()) {
        document.getElementById('text').innerText = 'MOVE';
        distCanvas.width = width;
        distCanvas.height = height;

        distCtx.save();
          distCtx.drawImage(document.getElementById('c2'), 0, 0);
          distCtx.globalCompositeOperation = 'lighter';
          distCtx.drawImage(document.getElementById('diff'), 0, 0);
        distCtx.restore();

        const { rgb, colorName } = getColor(distCtx, width, height);

        document.getElementById('color').style.background = `rgb(${ rgb })`;
        document.getElementById('color-picker').style.background = colorName;
      } else {
        document.getElementById('text').innerText = '';
      }

      const delay = 1000 / FPS - (Date.now() - begin);

      setTimeout(processVideo, delay);
    }
  };

  video.srcObject = stream;
}

function errorCallback(err) {
  alert(err);
};

function getColor(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height);

  const red = [255, 0, 0];
  const green = [0, 255, 0];
  const blue = [0, 0, 255];
  const yellow = [127, 127, 0];
  const orange = [255, 181, 0];
  const pink = [255, 208, 220];
  const colors = {
    red,
    green,
    blue,
    // yellow,
    // orange,
    // pink
  };
  let count = 0;
  let r = 0;
  let g = 0;
  let b = 0;

  for (let i = 0; i < data.length; i += 4) {
    (() => {
      if (
        data[i] !== 0 &&
        data[i + 1] !== 0 &&
        data[i + 2] !== 0 &&
        data[i] !== 255 &&
        data[i + 1] !== 255 &&
        data[i + 2] !== 255
      ) {
        count += 1;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
    })(i); 
  }

  r = 0 | r / count;
  g = 0 | g / count;
  b = 0 | b / count

  const keys = Object.keys(colors);
  let lastDistance = Infinity;
  let colorName = 'black';

  keys.forEach((key) => {
    colors[key][0]
    colors[key][1]
    colors[key][2]

    const distance = getEuclideanDistance([r, g, b], colors[key]);

    console.log(key, distance)
    if (distance < lastDistance) {
      lastDistance = distance;
      colorName = key;
    }
  })

  return {
    rgb: `${r}, ${g}, ${b}`,
    colorName
  };
}

function getEuclideanDistance(c1, c2) {
  return (
    Math.pow((c1[0] - c2[0]) * 0.3, 2) +
    Math.pow((c1[1] - c2[1]) * 0.59, 2) +
    Math.pow((c1[2] - c2[2]) * 0.11, 2)
  );
}