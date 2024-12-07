const scroller = scrollama();

async function handleStepProgress(response) {
  const earthImage = document.getElementById("earth-image");
  const keplerImage = document.getElementById("kepler-image");

  if (response.element.id === "zoom-earth") {
    const adjustedProgress = Math.min(response.progress / 0.5, 1);
    const zoomScale = 0.3 + adjustedProgress * 3.7;
    earthImage.style.transform = `scale(${zoomScale})`;

    if (adjustedProgress === 1) {
      earthImage.classList.add("background");
    } else {
      earthImage.classList.remove("background");
    }
  }

  if (response.element.id === "filler") {
    const zoomOutProgress = Math.min(response.progress, 1);
    const zoomOutScale = 4 - zoomOutProgress * 4;
    earthImage.style.transform = `scale(${zoomOutScale})`;

    if (zoomOutProgress === 1) {
      earthImage.classList.add("hidden");
    } else {
      earthImage.classList.remove("hidden");
    }
  }

  if (response.element.id === "kepler-telescope") {
    const moveProgress = Math.min(response.progress, 1);
    const translateX = 300 - moveProgress * 500;
    keplerImage.style.transform = `translate(${translateX}%, -50%)`;
  }

  if (response.element.id === "narrative0.1") {
    const moveProgress = Math.min(response.progress, 1);
    const translateX = -200 - moveProgress * 500;
    keplerImage.style.transform = `translate(${translateX}%, -50%)`;
  }
}

async function handleStepEnter(response) {
  const earthImage = document.getElementById("earth-image");

  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });
  response.element.classList.add("active");

  document
    .querySelectorAll("iframe")
    .forEach((iframe) => iframe.classList.remove("active"));
  if (response.element.id === "plot0") {
    document.getElementById("linechart").classList.add("active");
  } else if (response.element.id === "pie") {
    document.getElementById("vizPieChart").classList.add("active");
  } else if (response.element.id === "plot1") {
    document.getElementById("vizScatter").classList.add("active");
  } else if (response.element.id === "plot2") {
    document.getElementById("vizGeospatial").classList.add("active");
  } else if (response.element.id === "plot3") {
    document.getElementById("vizCustom").classList.add("active");
  }

  if (response.element.id === "filler") {
    earthImage.classList.add("zoom-out");
  } else {
    earthImage.classList.remove("zoom-out");
  }
}

scroller
  .setup({
    step: ".section",
    offset: 0.5,
    progress: true,
  })
  .onStepEnter(handleStepEnter)
  .onStepProgress(handleStepProgress);

async function preloadImages(imageArray) {
  imageArray.forEach((imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
  });
}

window.addEventListener("load", () => {
  preloadImages([
    "img/earth.png",
    "img/earthzoomed.png",
    "img/kepler_telescope.png",
  ]);
});

window.addEventListener("resize", scroller.resize);
