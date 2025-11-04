const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    views.forEach(v => v.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.view).classList.add("active");
  });
});

// ------------------ 성경 기능 -------------------
const bookSelect = document.getElementById("bookSelect");
const chapterSelect = document.getElementById("chapterSelect");
const verseSelect = document.getElementById("verseSelect");
const result = document.getElementById("bibleResult");
const prevBtn = document.getElementById("prevChapter");
const nextBtn = document.getElementById("nextChapter");

// 기본 책 리스트
const books = {
  Genesis: 50,
  Exodus: 40,
  Psalms: 150,
  Matthew: 28,
  John: 21,
  Romans: 16,
  Revelation: 22
};

Object.keys(books).forEach(book => {
  const opt = document.createElement("option");
  opt.value = book;
  opt.textContent = book;
  bookSelect.appendChild(opt);
});

bookSelect.addEventListener("change", () => {
  updateChapters();
});

function updateChapters() {
  chapterSelect.innerHTML = "";
  const maxChapter = books[bookSelect.value];
  for (let i = 1; i <= maxChapter; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i + "장";
    chapterSelect.appendChild(opt);
  }
}

function updateVerses(maxVerse = 20) {
  verseSelect.innerHTML = "";
  for (let i = 1; i <= maxVerse; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i + "절";
    verseSelect.appendChild(opt);
  }
}

updateChapters();
updateVerses();

document.getElementById("searchBtn").addEventListener("click", () => {
  fetchBible();
});

async function fetchBible() {
  const book = bookSelect.value;
  const chapter = chapterSelect.value;
  const verse = verseSelect.value;

  try {
    const res = await fetch(`https://bible-api.com/${book}+${chapter}:${verse}?translation=niv`);
    const data = await res.json();
    result.textContent = data.text
      ? `${data.reference}: ${data.text}`
      : "말씀을 불러오지 못했습니다.";
  } catch {
    result.textContent = "성경 API 오류 발생";
  }
}

// 장 이동
prevBtn.addEventListener("click", () => {
  let current = parseInt(chapterSelect.value);
  if (current > 1) {
    chapterSelect.value = current - 1;
    fetchBible();
  }
});

nextBtn.addEventListener("click", () => {
  let current = parseInt(chapterSelect.value);
  if (current < books[bookSelect.value]) {
    chapterSelect.value = current + 1;
    fetchBible();
  }
});

// 랜덤 말씀 추천
async function recommendVerse() {
  const bookList = Object.keys(books);
  const book = bookList[Math.floor(Math.random() * bookList.length)];
  const chapter = Math.floor(Math.random() * books[book]) + 1;
  const verse = Math.floor(Math.random() * 20) + 1;

  try {
    const res = await fetch(`https://bible-api.com/${book}+${chapter}:${verse}?translation=niv`);
    const data = await res.json();
    document.getElementById("recommendedVerse").textContent =
      data.text ? `${data.reference}: ${data.text}` : "추천 말씀 불러오기 실패";
  } catch {
    document.getElementById("recommendedVerse").textContent = "추천 API 오류";
  }
}
recommendVerse();

// ------------------ 묵상 / 기도 / 감사 / 즐겨찾기 -------------------
function setupSection(inputId, listId, key) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  const saveBtn = document.getElementById(`save${key}`);

  function load() {
    const saved = JSON.parse(localStorage.getItem(key)) || [];
    list.innerHTML = "";
    saved.forEach((item, i) => addItem(item, i));
  }

  function addItem(text, index) {
    const li = document.createElement("li");
    li.textContent = text;
    const del = document.createElement("button");
    del.textContent = "삭제";
    del.classList.add("deleteBtn");
    del.onclick = () => {
      const saved = JSON.parse(localStorage.getItem(key)) || [];
      saved.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(saved));
      load();
    };
    li.appendChild(del);
    list.appendChild(li);
  }

  saveBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text) {
      const saved = JSON.parse(localStorage.getItem(key)) || [];
      saved.push(text);
      localStorage.setItem(key, JSON.stringify(saved));
      input.value = "";
      load();
    }
  });

  load();
}

setupSection("meditationInput", "meditationList", "Meditation");
setupSection("prayerInput", "prayerList", "Prayer");
setupSection("thanksInput", "thanksList", "Thanks");
setupSection("", "favoritesList", "Favorites");
