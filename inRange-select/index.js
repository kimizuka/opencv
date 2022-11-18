const Module = {
  onRuntimeInitialized() {
    const img = new Image();

    img.onload = () => {
      const select = document.getElementById('select');
      const srcMat = cv.imread(img);
      const distMat = new cv.Mat();
      let minMat = cv.matFromArray(
        1,
        3,
        cv.CV_8UC1,
        [
          0,
          0,
          0
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
      // const minMat = cv.matFromArray(
      //   1,
      //   3,
      //   cv.CV_8UC1,
      //   [
      //     0,
      //     0,
      //     64
      //   ]
      // );
      // const maxMat = cv.matFromArray(
      //   1,
      //   3,
      //   cv.CV_8UC1,
      //   [
      //     255,
      //     255,
      //     255
      //   ]
      // );

      select.addEventListener('input', (evt) => {
        cv.cvtColor(srcMat, distMat, cv.COLOR_RGB2HSV_FULL);
        switch (evt.target.value) {
          case 'red':
            renderInput(red1MinMat, red1MaxMat);
            cv.inRange(distMat, red1MinMat, red1MaxMat, distMat);
            break;
          case 'blue':
            renderInput(blueMinMat, blueMaxMat);
            cv.inRange(distMat, blueMinMat, blueMaxMat, distMat);
            break;
          case 'green':
            renderInput(greenMinMat, greenMaxMat);
            cv.inRange(distMat, greenMinMat, greenMaxMat, distMat);
            break;
          case 'yellow':
            renderInput(yellowMinMat, yellowMaxMat);
            cv.inRange(distMat, yellowMinMat, yellowMaxMat, distMat);
            break;
        }
        cv.medianBlur(distMat, distMat, 7);
        cv.imshow('src', srcMat);
        cv.imshow('dist', distMat);
      });

      cv.cvtColor(srcMat, distMat, cv.COLOR_RGB2HSV_FULL);
      cv.inRange(distMat, minMat, maxMat, distMat);
      cv.medianBlur(distMat, distMat, 7);
      cv.imshow('src', srcMat);
      cv.imshow('dist', distMat);

      const spans = document.querySelectorAll('#ui span');

      [].slice.call(document.querySelectorAll('#ui input')).forEach((input, i) => {
        input.addEventListener('change', (evt) => {
          spans[i].innerText = evt.target.value;
  
          if (i < 3) {
            console.log([...minMat.data])
            minMat.data[i] = Number(evt.target.value);
            console.log([...minMat.data])
          } else {
            maxMat.data[i - 3] = Number(evt.target.value);
          }

          cv.cvtColor(srcMat, distMat, cv.COLOR_RGB2HSV_FULL);
          cv.inRange(distMat, minMat, maxMat, distMat);
          cv.medianBlur(distMat, distMat, 7);
          cv.imshow('src', srcMat);
          cv.imshow('dist', distMat);
        })
      });
  
      function renderInput(min, max) {
        const inputs = document.querySelectorAll('#ui input');
  
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
        
        console.log(minMat);
        console.log(maxMat);
      }
    };

    img.src = 'img.png';
  }
};