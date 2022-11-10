const Module = {
  onRuntimeInitialized() {
    const img = new Image();

    img.onload = () => {
      const srcMat = cv.imread(img);
      const distMat = new cv.Mat();
      const minMat = cv.matFromArray(
        1,
        3,
        cv.CV_8UC1,
        [90, 36, 0]
      );
      const maxMat = cv.matFromArray(
        1,
        3,
        cv.CV_8UC1,
        [170, 255, 255]
      );

      cv.cvtColor(srcMat, distMat, cv.COLOR_RGB2HSV_FULL);
      cv.inRange(distMat, minMat, maxMat, distMat);
      cv.medianBlur(distMat, distMat, 7);
      cv.imshow('src', srcMat);
      cv.imshow('dist', distMat);

      document.getElementById('ratio').innerText = `青: ${ cv.countNonZero(distMat) / (distMat.cols * distMat.rows) * 100 }%`;
    };

    img.src = 'img.png';
  }
};