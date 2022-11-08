const Module = {
  onRuntimeInitialized() {
    const imgs = [];
    const canvases = [];
    const ctxes = [];
    const imgLength = 2;
    let count = 0;

    for (let i = 0; i < imgLength; ++i) {
      const img = new Image();

      img.onload = onLoadImage;
      img.src = `./${ i + 1 }.png`;

      imgs.push(img);
      canvases.push(document.getElementById(`c${ i + 1 }`));
      ctxes.push(canvases[i].getContext('2d'));
    }

    function onLoadImage() {
      count += 1;

      if (count === imgLength) {
        main();
      }
    }

    function main() {
      const width = 114;
      const height = 114;
      const colorMats = [];
      const monochroMats = [];
      const blackAndWhiteMats = [];
      const matList = [
        colorMats,
        monochroMats,
        blackAndWhiteMats
      ]
      const diffMats = [];

      for (let i = 0; i < canvases.length; ++i) {
        canvases[i].width = width;
        canvases[i].height = height;

        colorMats.push(new cv.Mat(height, width, cv.CV_8UC4));
        monochroMats.push(new cv.Mat(height, width, cv.CV_8UC1));
        blackAndWhiteMats.push(new cv.Mat(height, width, cv.CV_8UC1));

        ctxes[i].drawImage(imgs[i], 0, 0);
        colorMats[i].data.set(ctxes[i].getImageData(0, 0, width, height).data);
        cv.cvtColor(colorMats[i], colorMats[i], cv.COLOR_RGBA2RGB);
        cv.cvtColor(colorMats[i], monochroMats[i], cv.COLOR_RGB2GRAY);
        cv.threshold(monochroMats[i], blackAndWhiteMats[i], 127, 255, cv.THRESH_OTSU);

        cv.imshow(`c${ i + 1 }`, colorMats[i]);
        cv.imshow(`c${ i + 1 }m`, monochroMats[i]);
        cv.imshow(`c${ i + 1 }b`, blackAndWhiteMats[i]);
      }

      for (let i = 0; i < matList.length; ++i) {
        diffMats.push(new cv.Mat(height, width, cv.CV_8UC4));
        cv.absdiff(matList[i][0], matList[i][1], diffMats[i]);
        cv.imshow(`diff-${ i + 1 }`, diffMats[i]);
      }
    }
  }
};