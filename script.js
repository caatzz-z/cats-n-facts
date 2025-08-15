const CAT_IMG_API = "https://api.thecatapi.com/v1/images/search";
const CAT_FACT_API = "https://catfact.ninja/fact";

const meowBtn = document.getElementById("meowBtn");
const favBtn = document.getElementById("favBtn");
const clearFavsBtn = document.getElementById("clearFavsBtn");
const imgWrap = document.getElementById("imgWrap");
const factText = document.getElementById("factText");
const statusEl = document.getElementById("status");
const favGrid = document.getElementById("favGrid");

let currentImageUrl = null;

function setStatus(msg = "", isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#a00" : "#7a3b4b";
}

function showLoading() {
  imgWrap.innerHTML = `<div class="placeholder">Loading adorable cat… 😺</div>`;
  factText.textContent = "Fetching a purr-fect fact…";
  favBtn.disabled = true;
  currentImageUrl = null;
}

function renderImage(url) {
  imgWrap.innerHTML = `<img src="${url}" alt="A very cute cat">`;
  currentImageUrl = url;
  favBtn.disabled = false;
}

async function fetchCatImage() {
  const res = await fetch(CAT_IMG_API, { cache: "no-store" });
  if (!res.ok) throw new Error("Image fetch failed");
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]?.url)
    throw new Error("Bad image payload");
  return data[0].url;
}

async function fetchCatFact() {
  const res = await fetch(CAT_FACT_API, { cache: "no-store" });
  if (!res.ok) throw new Error("Fact fetch failed");
  const data = await res.json();
  if (!data?.fact) throw new Error("Bad fact payload");
  return data.fact;
}

function getFavs() {
  try {
    return JSON.parse(localStorage.getItem("meow_favs") || "[]");
  } catch {
    return [];
  }
}
function setFavs(arr) {
  localStorage.setItem("meow_favs", JSON.stringify(arr));
}
function addFav(url) {
  const favs = getFavs();
  if (!favs.includes(url)) {
    favs.unshift(url);
    setFavs(favs);
    renderFavs();
  }
}
function removeFav(url) {
  const favs = getFavs().filter((u) => u !== url);
  setFavs(favs);
  renderFavs();
}
function clearFavs() {
  setFavs([]);
  renderFavs();
}
function renderFavs() {
  const favs = getFavs();
  favGrid.innerHTML =
    favs
      .map(
        (url) => `
    <div class="card">
      <img src="${url}" alt="Favorite cat" />
      <button class="remove" data-url="${url}">✖</button>
    </div>
  `
      )
      .join("") ||
    `<div class="placeholder">No favorites yet. ⭐ Save your faves!</div>`;

  favGrid.querySelectorAll(".remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const u = e.currentTarget.getAttribute("data-url");
      removeFav(u);
    });
  });
}

async function meow() {
  showLoading();
  setStatus("Summoning cat + fact…");
  try {
    const [imgUrl, fact] = await Promise.all([fetchCatImage(), fetchCatFact()]);
    renderImage(imgUrl);
    factText.textContent = fact;
    setStatus("meow delivered! 🐱");
  } catch (err) {
    console.error(err);
    imgWrap.innerHTML = `<div class="placeholder">Couldn’t fetch a cat right now.</div>`;
    factText.textContent = "No fact this time — try again!";
    setStatus("Something went wrong. Tap Meow again.", true);
  }
}

meowBtn.addEventListener("click", meow);
favBtn.addEventListener("click", () => {
  if (currentImageUrl) addFav(currentImageUrl);
});
clearFavsBtn.addEventListener("click", clearFavs);

renderFavs();