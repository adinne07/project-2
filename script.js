const arena = document.getElementById("arena");

const fighterRed = document.getElementById("fighterRed");
const fighterBlue = document.getElementById("fighterBlue");
const fighterYellow = document.getElementById("fighterYellow");

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
      { title: "Attack 1 - Serangan Dasar", src: "attack-1.mp4", note: "attack-1." },
      { title: "Attack 2 - Kombinasi Serangan", src: "attack-2.mp4", note: "attack-2." }
    ]
  },
  defence: {
    type: "Defence",
    title: "Video Tutorial Defence",
    videos: [
      { title: "Defence 1 - Hindaran Dasar", src: "defence-1.mp4", note: "defence-1." },
      { title: "Defence 2 - Tangkisan dan Jarak", src: "defence-2.mp4", note: "defence-2." }
    ]
  }
};

/* POSISI AWAL DALAM PERSENTASE MATRAS (%)
  Diukur dari titik tengah objek pesilat terhadap ukuran arena.
  Jika nanti kurang geser beberapa piksel, kamu cukup ubah angka persen di bawah ini.
*/
const defaultPositionsPercent = {
  red: {    x: 60, y: 52 },   // Pas di matras merah (kanan)
  blue: {   x: 40, y: 52 },   // Pas di matras biru (kiri)
  yellow: { x: 50, y: 31 }    // Pas di posisi wasit (tengah atas)
};

/* RESET POSISI BERDASARKAN SKALA ARENA SAAT INI */
function resetPositions() {
  if (!arena) return;

  const arenaWidth = arena.clientWidth;
  const arenaHeight = arena.clientHeight;

  // Jika arena belum siap (width masih 0), jangan hitung dulu
  if (arenaWidth === 0 || arenaHeight === 0) return;

  // Tempatkan Merah
  placeFighterPercent(fighterRed, defaultPositionsPercent.red.x, defaultPositionsPercent.red.y, arenaWidth, arenaHeight);
  // Tempatkan Biru
  placeFighterPercent(fighterBlue, defaultPositionsPercent.blue.x, defaultPositionsPercent.blue.y, arenaWidth, arenaHeight);
  // Tempatkan Wasit
  placeFighterPercent(fighterYellow, defaultPositionsPercent.yellow.x, defaultPositionsPercent.yellow.y, arenaWidth, arenaHeight);

  if (typeof updateAllPositions === "function") {
    updateAllPositions();
  }
}

/* FUNGSI UTAMA PENEMPATAN PERSEN */
function placeFighterPercent(fighter, percentX, percentY, arenaWidth, arenaHeight) {
  if (!fighter) return;

  // Hitung posisi pixel berdasarkan persen arena dikurangi setengah ukuran fighter (agar pas di tengah)
  let pixelX = (percentX / 100) * arenaWidth - (fighter.offsetWidth / 2);
  let pixelY = (percentY / 100) * arenaHeight - (fighter.offsetHeight / 2);

  const maxX = arenaWidth - fighter.offsetWidth;
  const maxY = arenaHeight - fighter.offsetHeight;

  fighter.style.left = clamp(pixelX, 0, maxX) + "px";
  fighter.style.top = clamp(pixelY, 0, maxY) + "px";
}

/* SOLUSI ANTI-BERANTAK: Menggunakan ResizeObserver
  Akan otomatis memicu posisi pas begitu arena selesai di-render di laptop maupun mobile,
  serta otomatis menjaga posisi jika layar di-resize / rotate.
*/
if (arena) {
  const resizeObserver = new ResizeObserver(() => {
    resetPositions();
  });
  resizeObserver.observe(arena);
}

/* TOMBOL RESET */
resetBtn.addEventListener("click", function () {
  resetPositions();
});

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

    fighter.style.left = clamp(newX, 0, maxX) + "px";
    fighter.style.top = clamp(newY, 0, maxY) + "px";

    if (typeof updateAllPositions === "function") {
      updateAllPositions();
    }
  });

  fighter.addEventListener("pointerup", function () { isDragging = false; });
  fighter.addEventListener("pointercancel", function () { isDragging = false; });
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

  if (tutorialSheet.classList.contains("active") && !isClickInsideSheet && !isClickTutorialButton) {
    closeTutorialSheet();
  }
});
