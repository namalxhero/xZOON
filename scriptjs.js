

// ===== Demo data =====
// Replace `url` values with your real MP3/FLAC links. Keep CORS in mind if hosting elsewhere.
const TRACKS = [
  {
    id: 't1',
    title: 'Night Drive — Lofi Mix',
    artist: 'Kawa',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
    url: 'assets/night-drive-lofi.mp3',
    size: '6.3 MB',
    quality: 'MP3 • 320kbps',
    tags: ['lofi','chill','instrumental']
  },
  {
    id: 't2',
    title: 'Ashawari (Remix)',
    artist: 'Nipz',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop',
    url: 'assets/ashawari-remix.mp3',
    size: '8.1 MB',
    quality: 'MP3 • 256kbps',
    tags: ['remix','party']
  },
  {
    id: 't3',
    title: 'Ranwan — Sinhala Pop',
    artist: 'Isha',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    url: 'assets/ranwan-pop.mp3',
    size: '7.2 MB',
    quality: 'MP3 • 192kbps',
    tags: ['Sinhala','pop']
  },
  {
    id: 't4',
    title: 'Bassline Fever',
    artist: 'DJ K',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
    url: 'assets/bassline-fever.mp3',
    size: '9.5 MB',
    quality: 'FLAC',
    tags: ['edm','bass']
  }
];

// ===== Elements =====
const grid = document.getElementById('grid');
const emptyState = document.getElementById('emptyState');
const resultsMeta = document.getElementById('resultsMeta');
const resultsCount = document.getElementById('resultsCount');
const queryEcho = document.getElementById('queryEcho');
const toast = document.getElementById('toast');

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Render cards
function render(tracks){
  grid.innerHTML = '';
  if(!tracks.length){
    grid.hidden = true;
    emptyState.hidden = false;
    resultsMeta.hidden = true;
    return;
  }
  grid.hidden = false;
  emptyState.hidden = true;
  resultsMeta.hidden = false;
  resultsCount.textContent = tracks.length;

  const frag = document.createDocumentFragment();
  tracks.forEach(t => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-thumb">
        <img loading="lazy" src="${t.cover}" alt="${t.title} cover" />
        <span class="badge">${t.quality}</span>
      </div>
      <div class="card-body">
        <div class="title">${t.title}</div>
        <div class="meta">${t.artist} • ${t.size}</div>
        <div class="actions">
          <button class="play" data-id="${t.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <span>Preview</span>
          </button>
          <button class="download" data-id="${t.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10m0 0l4-4m-4 4l-4-4M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Download</span>
          </button>
        </div>
      </div>
    `;
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

render([]); // start with empty state

// Search behavior
const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');

form.addEventListener('submit', e => {
  e.preventDefault();
  const q = input.value.trim();
  doSearch(q);
});

// chips (demo queries)
document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
  const q = ch.dataset.demo;
  input.value = q;
  doSearch(q);
}));

function doSearch(q=''){
  const query = q.toLowerCase();
  queryEcho.textContent = q || 'all';
  // mimic async fetch
  showToast('Searching…');
  setTimeout(() => {
    const filtered = TRACKS.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    );
    render(filtered);
    if(!filtered.length){ showToast('No results found'); }
  }, 250);
}

// Audio preview (lightweight)
let currentAudio = null;

grid.addEventListener('click', (e) => {
  const playBtn = e.target.closest('.play');
  const dlBtn = e.target.closest('.download');
  if(playBtn){
    const id = playBtn.dataset.id;
    const track = TRACKS.find(t => t.id === id);
    if(!track) return;
    try{
      if(currentAudio){ currentAudio.pause(); currentAudio = null; }
      currentAudio = new Audio(track.url);
      currentAudio.play().catch(() => showToast('Preview blocked — host this file locally to test.'));
      showToast('Playing preview…');
    }catch(err){ showToast('Preview error'); }
  }
  if(dlBtn){
    const id = dlBtn.dataset.id;
    const track = TRACKS.find(t => t.id === id);
    if(!track) return;
    downloadFile(track.url, `${sanitizeFileName(track.title)}.mp3`);
  }
});

function downloadFile(url, filename){
  // creates an <a download> and clicks it
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('Download started');
}

function sanitizeFileName(name){
  return name.replace(/[^a-z0-9\-_. ]/gi,'').replace(/\s+/g,' ').trim();
}

// Toast helper
let toastTimer;
function showToast(msg){
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}