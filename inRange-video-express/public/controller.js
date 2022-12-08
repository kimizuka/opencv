const Module = {
  onRuntimeInitialized() {
    main();
  }
};

function main() {
  const socket = io.connect();
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
    socket.emit('select', evt.target.value);
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

  const spans = document.querySelectorAll('#ui .min-max span');

  [].slice.call(document.querySelectorAll('#ui .min-max input')).forEach((input, i) => {
    input.addEventListener('change', (evt) => {
      spans[i].innerText = evt.target.value;

      if (i < 3) {
        minMat.data[i] = Number(evt.target.value);
      } else {
        maxMat.data[i - 3] = Number(evt.target.value);
      }

      console.log(minMat.data);
      socket.emit('input', {
        min: {
          data: [
            minMat.data[0],
            minMat.data[1],
            minMat.data[2]
          ]
        },
        max: {
          data: [
            maxMat.data[0],
            maxMat.data[1],
            maxMat.data[2]
          ]
        }
      });
    });
  });

  function renderInput(min, max) {
    const inputs = document.querySelectorAll('#ui .min-max input');

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

  socket.on('video', ({ dataURL, ratio }) => {
    document.getElementById('src').src = document.getElementById('camera').src = dataURL.src;
    document.getElementById('dist').src = dataURL.dist;
    document.getElementById('ratio').innerText = `${ ratio * 100 }%`;
  });

  document.getElementById('audio-check').addEventListener('click', (evt) => {
    socket.emit('audio', evt.target.checked);
  });

  document.getElementById('threshold').addEventListener('input', (evt) => {
    const threshold = evt.target.value;

    document.querySelector('.threshold span').innerText = threshold * 100;
    socket.emit('threshold', threshold);
  });
};