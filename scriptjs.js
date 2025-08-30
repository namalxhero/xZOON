const grid = document.getElementById("grid");
const emptyState = document.getElementById("emptyState");
const input = document.getElementById("searchInput");
const toast = document.getElementById("toast");
const sourceSelect = document.getElementById("sourceSelect");

// Render search results
function render(tracks) {
  grid.innerHTML = "";
  if (!tracks.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";
  tracks.forEach(t => {
    grid.innerHTML += `
      <div class="card">
        <img src="${t.cover}" alt="${t.title}">
        <h3>${t.title}</h3>
        <small>${t.artist}</small><br>
        <button onclick="playSong('${t.url}')">▶ Preview</button>
        <a href="${t.url}" download>⬇ Download</a>
      </div>
    `;
  });
}

// Play preview
function playSong(url) {
  const audio = new Audio(url);
  audio.play().catch(() => showToast("Preview cannot play, try another song."));
}

// Toast message
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// iTunes API
async function searchiTunes(query) {
  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12`);
  const data = await res.json();
  return data.results.map(t => ({
    title: t.trackName,
    artist: t.artistName,
    cover: t.artworkUrl100.replace("100x100bb", "300x300bb"),
    url: t.previewUrl
  }));
}

// Deezer API (via proxy to fix CORS)
async function searchDeezer(query) {
  const proxy = "https://api.allorigins.win/get?url=";
  const target = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=12`;
  const res = await fetch(proxy + encodeURIComponent(target));
  const wrapped = await res.json();
  const data = JSON.parse(wrapped.contents);

  return data.data.map(t => ({
    title: t.title,
    artist: t.artist.name,
    cover: t.album.cover_medium,
    url: t.preview // 30s mp3
  }));
}

// Input handler
input.addEventListener("input", async () => {
  const q = input.value.trim();
  if (q.length > 2) {
    showToast("Searching…");
    let tracks = [];
    if (sourceSelect.value === "itunes") {
      tracks = await searchiTunes(q);
    } else {
      tracks = await searchDeezer(q);
    }
    render(tracks);
  } else {
    grid.innerHTML = "";
    emptyState.style.display = "block";
  }
});

// Initial state
render([]);
