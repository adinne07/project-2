const arena = document.getElementById("arena");

const fighterRed = document.getElementById("fighterRed");
const fighterBlue = document.getElementById("fighterBlue");
const fighterYellow = document.getElementById("fighterYellow");

const redPosition = document.getElementById("redPosition");
const bluePosition = document.getElementById("bluePosition");
const yellowPosition = document.getElementById("yellowPosition");

const resetBtn = document.getElementById("resetBtn");

const tutorialSheet = document.getElementById("tutorialSheet");
const tutorialType = document.getElementById("tutorialType");
const tutorialTitle = document.getElementById("tutorialTitle");
const videoList = document.getElementById("videoList");
const closeTutorial = document.getElementById("closeTutorial");

const tutorialButtons = document.querySelectorAll("[data-tutorial]");

/* DATA VIDEO TUTORIAL */
const tutorials = {
  attack: {
    type: "Attack",
    title: "Video Tutorial Attack",
    videos: [
      {
        title: "Attack 1 - Serangan Dasar",
        src: "attack-1.mp4",
        note: "attack-1."
      },
      {
        title: "Attack 2 - Kombinasi Serangan",
        src: "attack-2.mp4",
        note: "attack-2."
      }
    ]
  },

  defence: {
    type: "Defence",
    title: "Video Tutorial Defence",
    videos: [
      {
        title: "Defence 1 - Hindaran Dasar",
        src: "defence-1.mp4",
        note: "defence-1."
      },
      {
        title: "Defence 2 - Tangkisan dan Jarak",
        src: "defence-2.mp4",
        note: "defence-2."
      }
    ]
  }
};

/* POSISI AWAL */
const defaultPositions = {
  red: {
    x: 198,
    y: 190
  },
  blue: {
    x: 116,
    y: 190
  },
  yellow: {
    x: 160,
    y: 100
  }
};

/* JIKA UKURAN LAYAR BERUBAH, KEMBALIKAN PESILAT KE KOTAKNYA */
window.addEventListener("resize", function () {
  resetPositions();
});

/* RESET POSISI */
resetBtn.addEventListener("click", function () {
  resetPositions();
});

function resetPositions() {
  setFighterPosition(fighterRed, defaultPositions.red.x, defaultPositions.red.y);
  setFighterPosition(fighterBlue, defaultPositions.blue.x, defaultPositions.blue.y);
  setFighterPosition(fighterYellow, defaultPositions.yellow.x, defaultPositions.yellow.y);

  updateAllPositions();
}

/* FUNGSI SET POSISI (Mendukung Persentase & Pixel) */
function setFighterPosition(fighter, x, y) {
  // Hitung batas maksimum agar tidak keluar dari arena
  const maxX = arena.clientWidth - fighter.offsetWidth;
  const maxY = arena.clientHeight - fighter.offsetHeight;

  // Jika posisi awal menggunakan persen (di bawah 100), ubah ke pixel secara dinamis
  let finalX = x < 100 ? (x / 100) * arena.clientWidth : x;
  let finalY = y < 100 ? (y / 100) * arena.clientHeight : y;

  // Amankan posisi agar tidak offset keluar arena
  const safeX = clamp(finalX, 0, maxX);
  const safeY = clamp(finalY, 0, maxY);

  fighter.style.left = safeX + "px";
  fighter.style.top = safeY + "px";
}

/* DRAG UNTUK SEMUA PESILAT */
makeDraggable(fighterRed);
makeDraggable(fighterBlue);
makeDraggable(fighterYellow);

function makeDraggable(fighter) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  fighter.addEventListener("pointerdown", function (event) {
    isDragging = true;

    const fighterRect = fighter.getBoundingClientRect();

    offsetX = event.clientX - fighterRect.left;
    offsetY = event.clientY - fighterRect.top;

    fighter.setPointerCapture(event.pointerId);
  });

  fighter.addEventListener("pointermove", function (event) {
    if (!isDragging) return;

    const arenaRect = arena.getBoundingClientRect();

    let newX = event.clientX - arenaRect.left - offsetX;
    let newY = event.clientY - arenaRect.top - offsetY;

    const maxX = arena.clientWidth - fighter.offsetWidth;
    const maxY = arena.clientHeight - fighter.offsetHeight;

    newX = clamp(newX, 0, maxX);
    newY = clamp(newY, 0, maxY);

    fighter.style.left = newX + "px";
    fighter.style.top = newY + "px";

    updateAllPositions();
  });

  fighter.addEventListener("pointerup", function () {
    isDragging = false;
  });

  fighter.addEventListener("pointercancel", function () {
    isDragging = false;
  });
}


/* BATAS NILAI */
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/* TUTORIAL ATTACK / DEFENCE */
tutorialButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const tutorialName = button.dataset.tutorial;
    showTutorial(tutorialName);
  });
});

function showTutorial(tutorialName) {
  const data = tutorials[tutorialName];

  if (!data) return;

  tutorialType.textContent = "Tutorial " + data.type;
  tutorialTitle.textContent = data.title;

  videoList.innerHTML = "";

  data.videos.forEach(function (video, index) {
    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
      <video controls preload="metadata">
        <source src="${video.src}" type="video/mp4">
        Browser tidak mendukung video.
      </video>
      <p class="video-note">${index + 1}. ${video.title}</p>
    `;

    videoList.appendChild(card);
  });

  tutorialSheet.classList.add("active");
  tutorialSheet.setAttribute("aria-hidden", "false");
}

/* TUTUP TUTORIAL */
closeTutorial.addEventListener("click", function () {
  closeTutorialSheet();
});

function closeTutorialSheet() {
  tutorialSheet.classList.remove("active");
  tutorialSheet.setAttribute("aria-hidden", "true");

  const videos = videoList.querySelectorAll("video");

  videos.forEach(function (video) {
    video.pause();
    video.currentTime = 0;
  });
}

/* TUTUP TUTORIAL JIKA KLIK AREA LUAR BOTTOM SHEET */
document.addEventListener("click", function (event) {
  const isClickInsideSheet = tutorialSheet.contains(event.target);
  const isClickTutorialButton = event.target.closest("[data-tutorial]");

  if (
    tutorialSheet.classList.contains("active") &&
    !isClickInsideSheet &&
    !isClickTutorialButton
  ) {
    closeTutorialSheet();
  }
});

/* JIKA UKURAN LAYAR BERUBAH, PASTIKAN PESILAT TIDAK KELUAR ARENA */
window.addEventListener("resize", function () {
  keepInsideArena(fighterRed);
  keepInsideArena(fighterBlue);
  keepInsideArena(fighterYellow);

  updateAllPositions();
});

function keepInsideArena(fighter) {
  const currentX = parseInt(fighter.style.left || 0);
  const currentY = parseInt(fighter.style.top || 0);

  setFighterPosition(fighter, currentX, currentY);
}

