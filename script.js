console.clear();

// Slide data - easily editable
const slidesData = [
  {
    img: "images/Chest.png",
    title: "3D Chest",
    subtitle: "Modeling",
    description: "A detailed 3D model of a treasure chest.",
  },
  {
    img: "images/Igor_Coene_Object.jpg",
    title: "Exam Design",
    subtitle: "Design",
    description: "A 3d Model of a computer. Designed for an exam.",
  },
  {
    img: "images/IsometricRoom.png",
    title: "Isometric Room",
    subtitle: "Architecture",
    description: "An isometric view of a room design.",
  },
  {
    img: "images/Siebren Homepage-05.svg",
    title: "Homepage Design",
    subtitle: "Web",
    description: "A website I had to make in style for my brother.",
  },
  {
    img: "images/TypoNaam-Igor.png",
    title: "Typography",
    subtitle: "Graphic Design",
    description: "My name in creative typography.",
  },
];

let currentIndex = 0;

// Generate slides from data
function generateSlides() {
  const slidesContainer = document.querySelector(".slides");
  const infosContainer = document.querySelector(".slides--infos");

  slidesData.forEach((slide, i) => {
    // slide
    const slideDiv = document.createElement("div");
    slideDiv.className = "slide";
    slideDiv.innerHTML = `
      <div class="slide__inner">
        <div class="slide--image__wrapper">
          <img class="slide--image" src="${slide.img}" alt="Image ${i + 1}" />
        </div>
      </div>
    `;
    slidesContainer.appendChild(slideDiv);

    // bg
    const bgDiv = document.createElement("div");
    bgDiv.className = "slide__bg";
    bgDiv.style.setProperty("--bg", `url(${slide.img})`);
    bgDiv.style.setProperty("--dir", 0);
    slidesContainer.appendChild(bgDiv);

    // info
    const infoDiv = document.createElement("div");
    infoDiv.className = "slide-info";
    infoDiv.innerHTML = `
      <div class="slide-info__inner">
        <div class="slide-info--text__wrapper">
          <div data-title class="slide-info--text">
            <span>${slide.title}</span>
          </div>
          <div data-subtitle class="slide-info--text">
            <span>${slide.subtitle}</span>
          </div>
          <div data-description class="slide-info--text">
            <span>${slide.description}</span>
          </div>
        </div>
      </div>
    `;
    infosContainer.appendChild(infoDiv);
  });
}

function setSlideAttributes() {
  const slides = [...document.querySelectorAll(".slide")];
  const slideInfos = [...document.querySelectorAll(".slide-info")];
  const slideBgs = [...document.querySelectorAll(".slide__bg")];

  // remove all data attributes
  slides.forEach((s) => {
    s.removeAttribute("data-current");
    s.removeAttribute("data-next");
    s.removeAttribute("data-previous");
  });
  slideInfos.forEach((s) => {
    s.removeAttribute("data-current");
    s.removeAttribute("data-next");
    s.removeAttribute("data-previous");
  });
  slideBgs.forEach((s) => {
    s.removeAttribute("data-current");
    s.removeAttribute("data-next");
    s.removeAttribute("data-previous");
  });

  // set current
  slides[currentIndex].setAttribute("data-current", "");
  slideInfos[currentIndex].setAttribute("data-current", "");
  slideBgs[currentIndex].setAttribute("data-current", "");

  // set next
  const nextIndex = (currentIndex + 1) % slides.length;
  slides[nextIndex].setAttribute("data-next", "");
  slideInfos[nextIndex].setAttribute("data-next", "");
  slideBgs[nextIndex].setAttribute("data-next", "");

  // set previous
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  slides[prevIndex].setAttribute("data-previous", "");
  slideInfos[prevIndex].setAttribute("data-previous", "");
  slideBgs[prevIndex].setAttribute("data-previous", "");

  // set z-index
  slides.forEach((slide, i) => {
    if (i === currentIndex) slide.style.zIndex = "20";
    else if (i === nextIndex) slide.style.zIndex = "10";
    else if (i === prevIndex) slide.style.zIndex = "30";
    else slide.style.zIndex = "1";
  });

  // set --dir for bgs
  slideBgs.forEach((bg, i) => {
    if (i === currentIndex) bg.style.setProperty("--dir", 0);
    else if (i === nextIndex) bg.style.setProperty("--dir", 1);
    else if (i === prevIndex) bg.style.setProperty("--dir", -1);
    else bg.style.setProperty("--dir", 0);
  });
}

// -------------------------------------------------
// ------------------ Utilities --------------------
// -------------------------------------------------

// Math utilities
const wrap = (n, max) => (n + max) % max;
const lerp = (a, b, t) => a + (b - a) * t;

// DOM utilities
const isHTMLElement = (el) => el instanceof HTMLElement;

const genId = (() => {
  let count = 0;
  return () => {
    return (count++).toString();
  };
})();

class Raf {
  constructor() {
    this.rafId = 0;
    this.raf = this.raf.bind(this);
    this.callbacks = [];

    this.start();
  }

  start() {
    this.raf();
  }

  stop() {
    cancelAnimationFrame(this.rafId);
  }

  raf() {
    this.callbacks.forEach(({ callback, id }) => callback({ id }));
    this.rafId = requestAnimationFrame(this.raf);
  }

  add(callback, id) {
    this.callbacks.push({ callback, id: id || genId() });
  }

  remove(id) {
    this.callbacks = this.callbacks.filter((callback) => callback.id !== id);
  }
}

class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  lerp(v, t) {
    this.x = lerp(this.x, v.x, t);
    this.y = lerp(this.y, v.y, t);
  }
}

const vec2 = (x = 0, y = 0) => new Vec2(x, y);

function tilt(node, options) {
  let { trigger, target } = resolveOptions(node, options);

  let lerpAmount = 0.06;

  const rotDeg = { current: vec2(), target: vec2() };
  const bgPos = { current: vec2(), target: vec2() };

  const update = (newOptions) => {
    destroy();
    ({ trigger, target } = resolveOptions(node, newOptions));
    init();
  };

  let rafId;

  function ticker({ id }) {
    rafId = id;

    rotDeg.current.lerp(rotDeg.target, lerpAmount);
    bgPos.current.lerp(bgPos.target, lerpAmount);

    for (const el of target) {
      el.style.setProperty("--rotX", rotDeg.current.y.toFixed(2) + "deg");
      el.style.setProperty("--rotY", rotDeg.current.x.toFixed(2) + "deg");

      el.style.setProperty("--bgPosX", bgPos.current.x.toFixed(2) + "%");
      el.style.setProperty("--bgPosY", bgPos.current.y.toFixed(2) + "%");
    }
  }

  const onMouseMove = ({ offsetX, offsetY }) => {
    lerpAmount = 0.1;

    for (const el of target) {
      const ox = (offsetX - el.clientWidth * 0.5) / (Math.PI * 3);
      const oy = -(offsetY - el.clientHeight * 0.5) / (Math.PI * 4);

      rotDeg.target.set(ox, oy);
      bgPos.target.set(-ox * 0.3, oy * 0.3);
    }
  };

  const onMouseLeave = () => {
    lerpAmount = 0.06;

    rotDeg.target.set(0, 0);
    bgPos.target.set(0, 0);
  };

  const addListeners = () => {
    trigger.addEventListener("mousemove", onMouseMove);
    trigger.addEventListener("mouseleave", onMouseLeave);
  };

  const removeListeners = () => {
    trigger.removeEventListener("mousemove", onMouseMove);
    trigger.removeEventListener("mouseleave", onMouseLeave);
  };

  const init = () => {
    addListeners();
    raf.add(ticker);
  };

  const destroy = () => {
    removeListeners();
    raf.remove(rafId);
  };

  init();

  return { destroy, update };
}

function resolveOptions(node, options) {
  return {
    trigger: options?.trigger ?? node,
    target: options?.target
      ? Array.isArray(options.target)
        ? options.target
        : [options.target]
      : [node],
  };
}

// -----------------------------------------------------

// Global Raf Instance
const raf = new Raf();

function init() {
  const loader = document.querySelector(".loader");

  const slides = [...document.querySelectorAll(".slide")];
  const slidesInfo = [...document.querySelectorAll(".slide-info")];

  const buttons = {
    prev: document.querySelector(".slider--btn__prev"),
    next: document.querySelector(".slider--btn__next"),
  };

  loader.style.opacity = 0;
  loader.style.pointerEvents = "none";

  slides.forEach((slide, i) => {
    const slideInner = slide.querySelector(".slide__inner");
    const slideInfoInner = slidesInfo[i].querySelector(".slide-info__inner");

    tilt(slide, { target: [slideInner, slideInfoInner] });
  });

  setSlideAttributes();

  buttons.prev.addEventListener("click", change(-1));
  buttons.next.addEventListener("click", change(1));
}

function setup() {
  const loaderText = document.querySelector(".loader__text");

  const images = [...document.querySelectorAll("img")];
  const totalImages = images.length;
  let loadedImages = 0;
  let progress = {
    current: 0,
    target: 0,
  };

  // update progress target
  images.forEach((image) => {
    imagesLoaded(image, (instance) => {
      if (instance.isComplete) {
        loadedImages++;
        progress.target = loadedImages / totalImages;
      }
    });
  });

  // lerp progress current to progress target
  raf.add(({ id }) => {
    progress.current = lerp(progress.current, progress.target, 0.06);

    const progressPercent = Math.round(progress.current * 100);
    loaderText.textContent = `${progressPercent}%`;

    // hide loader when progress is 100%
    if (progressPercent === 100) {
      init();

      // remove raf callback when progress is 100%
      raf.remove(id);
    }
  });
}

function change(direction) {
  return () => {
    currentIndex =
      (currentIndex + direction + slidesData.length) % slidesData.length;
    setSlideAttributes();
  };
}

// Start
generateSlides();
setup();
