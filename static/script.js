let songs = [];
let songToDeleteId = null;
let songToEditId = null;
const STORAGE_KEY = "lyricScratchpadSongs";
const songListElement = document.getElementById("song-list");

// Initial songs without fixed dates
const initialSongs = [
  {
    id: "collapseSong1",
    title: "Song 1",
    lyrics:
      "Tujhe khone ka ehsaas ho Raha h\nTu pass h fir bhi ye mehsoos ho Raha \n\nRaaho me saath me h\nFir bhi kyu h ye dooriyan\n\nKyuuuu kyu lge sb alggg\nKyuuuuu h sb berang\nKyu kyu tu na h sang\nKyuuuu Kyu ye dooriyan",
    date: "", // Will be set dynamically
  },
  {
    id: "collapseSong2",
    title: "Song 2",
    lyrics: "Some starting words of a new idea...",
    date: "", // Will be set dynamically
  },
];

// Utility to get today's date string in DD-MM-YYYY format
function getTodayDate() {
  return new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    .replace(/\//g, "-");
}

function saveSongs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

function renderSong(song, isNew = false) {
  const snippetText =
    song.lyrics.substring(0, 30) + (song.lyrics.length > 30 ? "..." : "");
  const collapseClasses = isNew
    ? "collapse show collapse-content"
    : "collapse collapse-content";
  const expandedState = isNew ? "true" : "false";

  const newCardHTML = `
    <div class="song-container" data-songid="${song.id}">
      <button class="song-card-button" type="button" data-bs-toggle="collapse" data-bs-target="#${song.id}" aria-expanded="${expandedState}" aria-controls="${song.id}">
        <div class="card-content-wrap">
          <span class="song-title-text">${song.title}</span>
          <span class="snippet">${snippetText}</span>
        </div>
        <div class="right-controls">
          <span class="edit-icon" title="Edit" aria-label="Edit" onclick="event.stopPropagation(); showEditModal('${song.id}')">✏️</span>
          <span class="delete-icon" title="Delete" aria-label="Delete" onclick="event.stopPropagation(); showDeleteModal('${song.id}')">🗑</span>
          <span class="date-stamp">${song.date}</span>
        </div>
      </button>
      <div class="${collapseClasses}" id="${song.id}">
        <pre class="lyrics-content">${song.lyrics}</pre>
      </div>
    </div>
  `;
  songListElement.insertAdjacentHTML("beforeend", newCardHTML);
}

window.loadSongs = function () {
  songListElement.innerHTML = "";
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    songs = JSON.parse(savedData);
  } else {
    // Assign today's date to all initial songs on first load
    const today = getTodayDate();
    songs = initialSongs.map((song) => ({
      ...song,
      date: today,
      id: song.id || "collapseSong" + Date.now() + Math.random().toString(36).substr(2, 5),
    }));
    saveSongs();
  }
  songs.forEach((song) => renderSong(song, false));
};

document.getElementById("saveNewSong").addEventListener("click", function () {
  const titleInput = document.getElementById("songTitle");
  const lyricsInput = document.getElementById("songLyrics");
  const title = titleInput.value.trim() || "New Song Idea";
  const lyrics = lyricsInput.value.trim();
  if (lyrics === "") {
    alert("Please enter some lyrics or notes for your idea.");
    return;
  }
  const newSong = {
    id: "collapseSong" + Date.now(),
    title: title,
    lyrics: lyrics,
    date: getTodayDate(),
  };
  songs.push(newSong);
  renderSong(newSong, true);
  saveSongs();
  const modalElement = document.getElementById("newSongModal");
  const modal = bootstrap.Modal.getInstance(modalElement);
  modal.hide();
  titleInput.value = "";
  lyricsInput.value = "";
});

window.showDeleteModal = function (songId) {
  songToDeleteId = songId;
  const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteSongModal")
  );
  deleteModal.show();
};

document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
  if (songToDeleteId) {
    songs = songs.filter((song) => song.id !== songToDeleteId);
    saveSongs();
    songListElement.innerHTML = "";
    songs.forEach((song) => renderSong(song, false));
    songToDeleteId = null;
    const deleteModal = bootstrap.Modal.getInstance(
      document.getElementById("deleteSongModal")
    );
    deleteModal.hide();
  }
});

window.showEditModal = function(songId) {
  songToEditId = songId;
  const song = songs.find(s => s.id === songId);
  if (!song) return;
  document.getElementById('editSongTitle').value = song.title;
  document.getElementById('editSongLyrics').value = song.lyrics;
  const editModal = new bootstrap.Modal(document.getElementById('editSongModal'));
  editModal.show();
};

document.getElementById('saveEditSong').addEventListener('click', function () {
  if (songToEditId) {
    const songIndex = songs.findIndex(s => s.id === songToEditId);
    if (songIndex !== -1) {
      songs[songIndex].title = document.getElementById('editSongTitle').value.trim();
      songs[songIndex].lyrics = document.getElementById('editSongLyrics').value.trim();
      saveSongs();
      songListElement.innerHTML = "";
      songs.forEach(song => renderSong(song, false));
      songToEditId = null;
      const editModal = bootstrap.Modal.getInstance(document.getElementById('editSongModal'));
      editModal.hide();
    }
  }
});
