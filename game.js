const canvas = document.querySelector("#world");
const ctx = canvas.getContext("2d");

const els = {
  opening: document.querySelector("#opening"),
  pages: [...document.querySelectorAll(".page")],
  begin: document.querySelector("#begin-btn"),
  hud: document.querySelector("#hud"),
  starCount: document.querySelector("#star-count"),
  areaName: document.querySelector("#area-name"),
  sound: document.querySelector("#sound-toggle"),
  dialogue: document.querySelector("#dialogue"),
  speaker: document.querySelector("#speaker"),
  dialogueText: document.querySelector("#dialogue-text"),
  nextDialogue: document.querySelector("#next-dialogue"),
  journal: document.querySelector("#journal"),
  journalTitle: document.querySelector("#journal-title"),
  journalMessage: document.querySelector("#journal-message"),
  closeJournal: document.querySelector("#close-journal"),
  toast: document.querySelector("#toast"),
  gift: document.querySelector("#gift"),
  giftLine: document.querySelector("#gift-line"),
  openGift: document.querySelector("#open-gift"),
  ending: document.querySelector("#ending"),
  earthButton: document.querySelector("#earth-button"),
  finalLetter: document.querySelector("#final-letter")
};

const totalStars = 10;
const world = { width: 1280, height: 820 };
const saveKey = "amrit-luckiest-person-save-v2";
const keys = new Set();

const chapters = [
  {
    name: "Kindness Meadow",
    theme: "Kindness",
    color: "#bfd3a5",
    accent: "#e5bb63",
    bounds: { x: 80, y: 130, w: 720, h: 560 },
    spawn: { x: 240, y: 530 },
    stars: [{ x: 260, y: 310 }, { x: 620, y: 500 }],
    npc: {
      name: "Cat",
      x: 500,
      y: 300,
      color: "#8a7566",
      lines: [
        "Mrrp. First clue: the person we seek makes ordinary days gentler.",
        "They do little kind things and then pretend those things were nothing.",
        "Rude of them, honestly. Making people feel cared for without a permit."
      ]
    },
    messages: [
      "Kindness is sometimes just staying soft when the day has been hard.",
      "Someone once felt less alone because this person cared enough to answer."
    ]
  },
  {
    name: "Forest of Persistence",
    theme: "Persistence",
    color: "#8faa79",
    accent: "#55724d",
    bounds: { x: 280, y: 80, w: 760, h: 590 },
    spawn: { x: 430, y: 540 },
    stars: [{ x: 470, y: 250 }, { x: 860, y: 410 }],
    npc: {
      name: "Fox",
      x: 720,
      y: 290,
      color: "#bd7b5b",
      lines: [
        "Oh great, another traveler. I was hoping for literally anyone else.",
        "...Just kidding. Nice shirt.",
        "The person we're looking for kept trying. Even when connection took effort."
      ]
    },
    messages: [
      "Effort, repeated gently, becomes trust.",
      "Some friendships exist because one person cared enough to try again."
    ]
  },
  {
    name: "Loyalty Trail",
    theme: "Loyalty",
    color: "#dcc9a9",
    accent: "#bd7b5b",
    bounds: { x: 130, y: 150, w: 810, h: 520 },
    spawn: { x: 230, y: 420 },
    stars: [{ x: 440, y: 520 }, { x: 760, y: 250 }],
    npc: {
      name: "Dog",
      x: 580,
      y: 370,
      color: "#a97955",
      lines: [
        "The person we're looking for never gave up on people.",
        "I buried a clue, forgot where, and still somehow feel emotionally qualified.",
        "They stayed. That matters more than they probably know."
      ]
    },
    messages: [
      "A loyal friend is steady in ways that become part of the ground beneath you.",
      "They stayed when staying required patience."
    ]
  },
  {
    name: "Garden of Impact",
    theme: "Impact",
    color: "#c3cba2",
    accent: "#89a8b4",
    bounds: { x: 220, y: 120, w: 790, h: 570 },
    spawn: { x: 330, y: 520 },
    stars: [{ x: 390, y: 250 }, { x: 820, y: 520 }],
    npc: {
      name: "Rabbit",
      x: 650,
      y: 360,
      color: "#d9c4aa",
      lines: [
        "Please walk carefully. I organized these flowers by emotional significance.",
        "The person we seek changes lives quietly, like sunlight on a windowsill.",
        "People remember how they made them feel."
      ]
    },
    messages: [
      "Some people make the world brighter without realizing the light is coming from them.",
      "There are people who smile because of conversations they had with this person."
    ]
  },
  {
    name: "Shore of Being Chosen",
    theme: "Being chosen",
    color: "#a8c6cc",
    accent: "#7fa5b3",
    bounds: { x: 150, y: 100, w: 820, h: 580 },
    spawn: { x: 260, y: 500 },
    stars: [{ x: 430, y: 240 }, { x: 780, y: 430 }],
    npc: {
      name: "Crow",
      x: 620,
      y: 270,
      color: "#3d4546",
      lines: [
        "I was told to insult you. You seem adequate.",
        "Funny thing about the person we're looking for: they worried they might not be chosen.",
        "Embarrassing oversight. Many would choose them. Easily."
      ]
    },
    messages: [
      "They kept choosing others, and never noticed how many people were choosing them too.",
      "The final clue feels familiar: kind, loyal, hardworking, and deeply appreciated."
    ]
  }
];

const guard = {
  name: "Castle Guard",
  x: 640,
  y: 465,
  color: "#6d8461",
  lines: [
    "Welcome, traveler. The castle asks for all ten Memory Stars.",
    "You brought every one. Thank you for carrying these stories so carefully.",
    "The one you searched for left kindness all over this map.",
    "Please take this gift. It belongs to someone who deserves the world."
  ]
};

const campsite = {
  name: "A Folded Note",
  x: 1010,
  y: 640,
  color: "#e5bb63",
  lines: ["Good night.", "Sweet dreams.", "Take care."]
};

const state = {
  started: false,
  chapter: 0,
  castleOpen: false,
  endingPlayed: false,
  giftReady: false,
  letterOpen: false,
  player: { x: 240, y: 530, vx: 0, vy: 0, tx: null, ty: null, dir: 1 },
  camera: { x: 0, y: 0 },
  collected: new Set(),
  achievements: new Set(),
  activeDialogue: null,
  dialogueIndex: 0,
  soundOn: false,
  audio: null,
  time: 0
};

const finalLetter = `Dear Amrit,

You crossed meadows.

You wandered through forests.

You followed trails.

You collected stars.

You listened to stories.

And all this time, you were searching for someone who deserved the world.

Someone kind.

Someone loyal.

Someone who stays.

Someone who gives more of himself than most people ever realize.

Someone who keeps trying, even when things don't come easily.

Someone who has quietly made other people's lives a little brighter simply by being in them.

The funny thing is...

The search was never really about finding that person.

It was about helping you see him.

Because your kindness matters.

Your effort matters.

Your presence matters.

You have a habit of giving so much of yourself to the people around you that sometimes you forget that you are worthy of being chosen too.

But you are.

More than you know.

There are people whose lives are better because you are in them.

People who are grateful for your friendship.

People who smile because of conversations they have had with you.

People who are glad that you stayed.

So after searching all this way for someone who deserved the world...

I thought it was only fair to give you one.

🌍

Take good care of it.

And while you're at it,

take good care of yourself too.

Good night.

Sweet dreams.

Take care.`;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function activeChapter() {
  return chapters[state.chapter] || chapters[chapters.length - 1];
}

function collectedInChapter(index) {
  return [...state.collected].filter(id => Math.floor(id / 2) === index).length;
}

function currentStars() {
  if (state.castleOpen) return [];
  return activeChapter().stars.map((star, i) => ({
    ...star,
    id: state.chapter * 2 + i
  }));
}

function save() {
  localStorage.setItem(saveKey, JSON.stringify({
    started: state.started,
    chapter: state.chapter,
    castleOpen: state.castleOpen,
    endingPlayed: state.endingPlayed,
    giftReady: state.giftReady,
    letterOpen: state.letterOpen,
    x: state.player.x,
    y: state.player.y,
    collected: [...state.collected],
    achievements: [...state.achievements]
  }));
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(saveKey));
    if (!data) return;
    state.started = Boolean(data.started);
    state.chapter = clamp(data.chapter ?? 0, 0, chapters.length - 1);
    state.castleOpen = Boolean(data.castleOpen);
    state.endingPlayed = Boolean(data.endingPlayed);
    state.giftReady = Boolean(data.giftReady);
    state.letterOpen = Boolean(data.letterOpen);
    state.collected = new Set((data.collected || []).filter(id => id >= 0 && id < totalStars));
    state.achievements = new Set(data.achievements || []);
    const spawn = state.castleOpen ? { x: 390, y: 560 } : activeChapter().spawn;
    state.player.x = clamp(data.x ?? spawn.x, 70, world.width - 70);
    state.player.y = clamp(data.y ?? spawn.y, 90, world.height - 70);
  } catch {
    localStorage.removeItem(saveKey);
  }
}

function toast(text) {
  els.toast.textContent = text;
  els.toast.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.add("hidden"), 3000);
}

function achievement(id, label) {
  if (state.achievements.has(id)) return;
  state.achievements.add(id);
  toast(`Achievement unlocked: ${label}`);
  save();
}

function openJournal(title, message) {
  els.journalTitle.textContent = title;
  els.journalMessage.textContent = message;
  els.journal.classList.remove("hidden");
}

function startDialogue(name, lines, onComplete = null) {
  state.activeDialogue = { name, lines, onComplete };
  state.dialogueIndex = 0;
  showDialogueLine();
}

function showDialogueLine() {
  const active = state.activeDialogue;
  if (!active) return;
  if (state.dialogueIndex >= active.lines.length) {
    const done = active.onComplete;
    state.activeDialogue = null;
    els.dialogue.classList.add("hidden");
    if (done) done();
    return;
  }
  els.speaker.textContent = active.name;
  els.dialogueText.textContent = active.lines[state.dialogueIndex];
  els.dialogue.classList.remove("hidden");
  state.dialogueIndex += 1;
}

function collectStar(star) {
  if (state.collected.has(star.id)) return;
  state.collected.add(star.id);
  const chapter = chapters[Math.floor(star.id / 2)];
  const localIndex = star.id % 2;
  openJournal(`${chapter.theme} Star`, chapter.messages[localIndex]);
  playChime();
  updateHud();

  if (state.collected.size === 1) achievement("first-star", "First Memory");
  if (collectedInChapter(state.chapter) === 2) unlockNextChapter();
  save();
}

function unlockNextChapter() {
  const finished = activeChapter().name;
  if (state.chapter < chapters.length - 1) {
    state.chapter += 1;
    const spawn = activeChapter().spawn;
    state.player.x = spawn.x;
    state.player.y = spawn.y;
    state.player.tx = null;
    state.player.ty = null;
    toast(`${finished} complete. The path to ${activeChapter().name} opens.`);
    achievement(`chapter-${state.chapter}`, activeChapter().theme);
  } else {
    state.castleOpen = true;
    state.player.x = 360;
    state.player.y = 560;
    state.player.tx = null;
    state.player.ty = null;
    toast("All ten stars are gathered. The castle path opens.");
    achievement("all-stars", "All Ten Memory Stars");
  }
  updateHud();
}

function interact() {
  if (!state.started || !els.journal.classList.contains("hidden") || !els.gift.classList.contains("hidden") || !els.ending.classList.contains("hidden")) return;
  const p = state.player;
  const star = currentStars().find(item => !state.collected.has(item.id) && dist(p, item) < 64);
  if (star) {
    collectStar(star);
    return;
  }

  if (!state.castleOpen) {
    const npc = activeChapter().npc;
    if (dist(p, npc) < 88) startDialogue(npc.name, npc.lines);
    return;
  }

  if (dist(p, campsite) < 86) {
    startDialogue(campsite.name, campsite.lines);
    achievement("good-night", "Quiet Note");
    return;
  }

  if (dist(p, guard) < 100) {
    startDialogue(guard.name, guard.lines, beginGift);
  }
}

function beginGift() {
  state.giftReady = true;
  state.endingPlayed = true;
  save();
  els.gift.classList.remove("hidden");
}

function showEarth() {
  els.gift.classList.add("hidden");
  els.ending.classList.remove("hidden");
  els.earthButton.classList.remove("hidden");
  els.finalLetter.classList.add("hidden");
  toast("The Earth glows softly. Click it.");
}

function openLetter() {
  state.letterOpen = true;
  save();
  els.earthButton.classList.add("hidden");
  els.finalLetter.innerHTML = finalLetter
    .split("\n")
    .map(line => {
      if (!line) return "<br>";
      if (line === "🌍") return `<p class="earth-mark">${line}</p>`;
      return `<p>${line}</p>`;
    })
    .join("");
  els.finalLetter.classList.remove("hidden");
  achievement("world-gift", "The World");
}

function updateHud() {
  els.starCount.textContent = `${state.collected.size} / ${totalStars}`;
  els.areaName.textContent = state.castleOpen ? "The Castle" : activeChapter().name;
  setAmbience(els.areaName.textContent);
}

function allowedBounds() {
  if (state.castleOpen) return { x: 150, y: 115, w: 970, h: 610 };
  return activeChapter().bounds;
}

function updatePlayer(dt) {
  const p = state.player;
  let ax = 0;
  let ay = 0;
  if (keys.has("arrowleft") || keys.has("a")) ax -= 1;
  if (keys.has("arrowright") || keys.has("d")) ax += 1;
  if (keys.has("arrowup") || keys.has("w")) ay -= 1;
  if (keys.has("arrowdown") || keys.has("s")) ay += 1;
  if (ax || ay) {
    p.tx = null;
    p.ty = null;
    const mag = Math.hypot(ax, ay);
    ax /= mag;
    ay /= mag;
  } else if (p.tx !== null) {
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const mag = Math.hypot(dx, dy);
    if (mag > 8) {
      ax = dx / mag;
      ay = dy / mag;
    } else {
      p.tx = null;
      p.ty = null;
    }
  }

  const speed = 245;
  p.vx += (ax * speed - p.vx) * Math.min(1, dt * 9);
  p.vy += (ay * speed - p.vy) * Math.min(1, dt * 9);
  const bounds = allowedBounds();
  p.x = clamp(p.x + p.vx * dt, bounds.x + 45, bounds.x + bounds.w - 45);
  p.y = clamp(p.y + p.vy * dt, bounds.y + 65, bounds.y + bounds.h - 45);
  if (Math.abs(p.vx) > 2) p.dir = Math.sign(p.vx);
}

function updateCamera() {
  state.camera.x = clamp(state.player.x - innerWidth / 2, 0, Math.max(0, world.width - innerWidth));
  state.camera.y = clamp(state.player.y - innerHeight / 2, 0, Math.max(0, world.height - innerHeight));
}

function drawWorld() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.save();
  ctx.translate(-state.camera.x, -state.camera.y);
  drawBackdrop();
  if (state.castleOpen) drawCastleScene();
  else drawChapterScene(activeChapter());
  drawPlayer();
  drawHint();
  ctx.restore();
  drawVignette();
}

function drawBackdrop() {
  ctx.fillStyle = "#c9d8b5";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.save();
  ctx.globalAlpha = 0.17;
  for (let i = 0; i < 600; i++) {
    const x = (i * 173) % world.width;
    const y = (i * 97) % world.height;
    ctx.fillStyle = i % 3 ? "#fff8eb" : "#55724d";
    ctx.beginPath();
    ctx.arc(x, y, (i % 4) + 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawChapterScene(chapter) {
  drawArea(chapter.bounds, chapter.color, chapter.accent);
  drawPath(chapter.bounds);
  if (chapter.theme === "Kindness") drawMeadow(chapter.bounds);
  if (chapter.theme === "Persistence") drawForest(chapter.bounds);
  if (chapter.theme === "Loyalty") drawTrail(chapter.bounds);
  if (chapter.theme === "Impact") drawGarden(chapter.bounds);
  if (chapter.theme === "Being chosen") drawShore(chapter.bounds);
  currentStars().forEach(drawStar);
  drawNpc(chapter.npc);
  drawChapterTitle(chapter);
}

function drawCastleScene() {
  const b = allowedBounds();
  drawArea(b, "#c3c6bf", "#89a8b4");
  drawPath({ x: 250, y: 420, w: 720, h: 170 });
  drawCastle();
  drawNpc(guard);
  drawCampsite();
  drawChapterTitle({ name: "The Castle", theme: "The gift" });
}

function drawArea(b, color, accent) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.72;
  roundedRect(b.x, b.y, b.w, b.h, 48);
  ctx.fill();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();
}

function drawPath(b) {
  ctx.save();
  ctx.strokeStyle = "#ddc99e";
  ctx.lineWidth = 50;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.moveTo(b.x + 110, b.y + b.h - 120);
  ctx.bezierCurveTo(b.x + 250, b.y + 290, b.x + b.w - 250, b.y + 280, b.x + b.w - 105, b.y + 135);
  ctx.stroke();
  ctx.restore();
}

function drawMeadow(b) {
  for (let i = 0; i < 34; i++) drawFlower(b.x + 65 + (i * 97) % (b.w - 130), b.y + 80 + (i * 53) % (b.h - 140), i);
}

function drawForest(b) {
  for (let i = 0; i < 32; i++) drawTree(b.x + 70 + (i * 83) % (b.w - 140), b.y + 75 + (i * 121) % (b.h - 150), i % 2 ? "#55724d" : "#6f8f62");
}

function drawTrail(b) {
  const homes = [[b.x + 230, b.y + 180], [b.x + 550, b.y + 350]];
  homes.forEach(([x, y], i) => {
    ctx.fillStyle = i ? "#d8b891" : "#e9d9bd";
    roundedRect(x - 54, y - 42, 108, 84, 8);
    ctx.fill();
    ctx.fillStyle = "#bd7b5b";
    ctx.beginPath();
    ctx.moveTo(x - 68, y - 36);
    ctx.lineTo(x, y - 92);
    ctx.lineTo(x + 68, y - 36);
    ctx.fill();
  });
}

function drawGarden(b) {
  const colors = ["#bd7b5b", "#e5bb63", "#89a8b4", "#fff8eb"];
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(b.x + 70 + (i * 61) % (b.w - 130), b.y + 70 + (i * 89) % (b.h - 130), 5 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawShore(b) {
  ctx.fillStyle = "#91b7c2";
  ctx.beginPath();
  ctx.ellipse(b.x + b.w - 210, b.y + 270, 190, 140, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,248,235,0.45)";
  ctx.lineWidth = 5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(b.x + b.w - 220, b.y + 260, 70 + i * 25, 30 + i * 13, -0.15, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawCastle() {
  ctx.save();
  ctx.fillStyle = "#acb5b1";
  roundedRect(470, 150, 340, 260, 10);
  ctx.fill();
  ctx.fillStyle = "#8d9fa7";
  ctx.fillRect(445, 130, 82, 300);
  ctx.fillRect(753, 130, 82, 300);
  ctx.fillStyle = "#bd7b5b";
  ctx.beginPath();
  ctx.moveTo(445, 130); ctx.lineTo(486, 60); ctx.lineTo(527, 130); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(753, 130); ctx.lineTo(794, 60); ctx.lineTo(835, 130); ctx.fill();
  ctx.fillStyle = "#f3d797";
  ctx.beginPath();
  ctx.roundRect(602, 285, 76, 125, 36);
  ctx.fill();
  ctx.restore();
}

function drawCampsite() {
  ctx.save();
  ctx.fillStyle = "#6d8461";
  roundedRect(campsite.x - 56, campsite.y - 30, 112, 58, 20);
  ctx.fill();
  ctx.fillStyle = "#bd7b5b";
  ctx.beginPath();
  ctx.moveTo(campsite.x - 16, campsite.y + 16);
  ctx.lineTo(campsite.x, campsite.y - 28);
  ctx.lineTo(campsite.x + 16, campsite.y + 16);
  ctx.fill();
  ctx.fillStyle = "#f3d797";
  ctx.beginPath();
  ctx.arc(campsite.x + 46, campsite.y + 18, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawChapterTitle(chapter) {
  ctx.save();
  ctx.fillStyle = "rgba(255,248,235,0.86)";
  roundedRect(44, 32, 300, 78, 8);
  ctx.fill();
  ctx.fillStyle = "#55724d";
  ctx.font = "900 13px Nunito";
  ctx.fillText(chapter.theme.toUpperCase(), 68, 62);
  ctx.fillStyle = "#2f3a32";
  ctx.font = "700 27px Crimson Text";
  ctx.fillText(chapter.name, 68, 92);
  ctx.restore();
}

function drawFlower(x, y, i) {
  ctx.fillStyle = ["#bd7b5b", "#e5bb63", "#89a8b4"][i % 3];
  ctx.beginPath();
  ctx.arc(x, y, 5 + (i % 3), 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(x, y, color) {
  ctx.fillStyle = "#806a4b";
  ctx.fillRect(x - 7, y + 15, 14, 38);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 34, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,248,235,0.16)";
  ctx.beginPath();
  ctx.arc(x - 12, y - 12, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(star) {
  if (state.collected.has(star.id)) return;
  const pulse = Math.sin(state.time * 4 + star.id) * 3;
  ctx.save();
  ctx.translate(star.x, star.y + pulse);
  ctx.rotate(state.time + star.id);
  ctx.fillStyle = "#f3d797";
  ctx.strokeStyle = "rgba(255,248,235,0.8)";
  ctx.lineWidth = 4;
  starPath(0, 0, 5, 10, 22);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawNpc(npc) {
  ctx.save();
  ctx.translate(npc.x, npc.y);
  ctx.fillStyle = "rgba(47,58,50,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 34, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = npc.color;
  ctx.beginPath();
  ctx.arc(0, 0, 27, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8eb";
  ctx.beginPath();
  ctx.arc(-8, -5, 4, 0, Math.PI * 2);
  ctx.arc(8, -5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f3a32";
  ctx.beginPath();
  ctx.arc(-8, -5, 1.8, 0, Math.PI * 2);
  ctx.arc(8, -5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  const p = state.player;
  const bob = Math.sin(state.time * 8) * Math.min(5, Math.hypot(p.vx, p.vy) / 50);
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  ctx.scale(p.dir, 1);
  ctx.fillStyle = "rgba(47,58,50,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 42, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7e6653";
  roundedRect(-14, 8, 28, 42, 10);
  ctx.fill();
  ctx.fillStyle = "#7fa5b3";
  roundedRect(-20, -18, 40, 46, 12);
  ctx.fill();
  ctx.fillStyle = "#d4a47e";
  ctx.beginPath();
  ctx.arc(0, -38, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f2b29";
  ctx.beginPath();
  ctx.ellipse(-2, -48, 22, 12, -0.2, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f3a32";
  ctx.beginPath();
  ctx.arc(-7, -39, 2, 0, Math.PI * 2);
  ctx.arc(8, -39, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6a473b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(2, -32, 7, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "#8c7c58";
  roundedRect(18, -10, 15, 34, 6);
  ctx.fill();
  ctx.restore();
}

function drawHint() {
  const p = state.player;
  const targets = state.castleOpen
    ? [guard, campsite]
    : [...currentStars().filter(star => !state.collected.has(star.id)), activeChapter().npc];
  if (!targets.some(target => dist(p, target) < 96)) return;
  ctx.save();
  ctx.fillStyle = "rgba(255,248,235,0.93)";
  ctx.strokeStyle = "rgba(85,114,77,0.26)";
  ctx.lineWidth = 2;
  roundedRect(p.x - 58, p.y - 118, 116, 34, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#55724d";
  ctx.font = "800 15px Nunito";
  ctx.textAlign = "center";
  ctx.fillText("Press E", p.x, p.y - 96);
  ctx.restore();
}

function drawVignette() {
  const gradient = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, innerWidth * 0.2, innerWidth / 2, innerHeight / 2, innerWidth * 0.78);
  gradient.addColorStop(0, "rgba(255,248,235,0)");
  gradient.addColorStop(1, "rgba(47,58,50,0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, innerWidth, innerHeight);
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function starPath(cx, cy, spikes, inner, outer) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
    rot += step;
  }
  ctx.closePath();
}

function setupAudio() {
  if (state.audio) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ac = new AudioContext();
  const master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);
  const wind = ac.createOscillator();
  const hum = ac.createOscillator();
  const piano = ac.createOscillator();
  const windGain = ac.createGain();
  const humGain = ac.createGain();
  const pianoGain = ac.createGain();
  wind.type = "sine";
  hum.type = "triangle";
  piano.type = "sine";
  windGain.gain.value = 0.025;
  humGain.gain.value = 0.035;
  pianoGain.gain.value = 0.012;
  wind.connect(windGain).connect(master);
  hum.connect(humGain).connect(master);
  piano.connect(pianoGain).connect(master);
  wind.start();
  hum.start();
  piano.start();
  state.audio = { ac, master, wind, hum, piano };
}

function setAmbience(place) {
  if (!state.audio) return;
  const table = {
    "Kindness Meadow": [170, 82, 330],
    "Forest of Persistence": [122, 72, 294],
    "Loyalty Trail": [156, 98, 330],
    "Garden of Impact": [188, 92, 392],
    "Shore of Being Chosen": [210, 65, 349],
    "The Castle": [104, 58, 262]
  };
  const [wind, hum, piano] = table[place] || table["Kindness Meadow"];
  const t = state.audio.ac.currentTime;
  state.audio.wind.frequency.setTargetAtTime(wind, t, 0.6);
  state.audio.hum.frequency.setTargetAtTime(hum, t, 0.6);
  state.audio.piano.frequency.setTargetAtTime(piano, t, 0.8);
}

function playChime() {
  if (!state.soundOn || !state.audio) return;
  const { ac, master } = state.audio;
  [523, 659, 784].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.08, ac.currentTime + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.08 + 0.55);
    osc.connect(gain).connect(master);
    osc.start(ac.currentTime + i * 0.08);
    osc.stop(ac.currentTime + i * 0.08 + 0.6);
  });
}

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clientX - rect.left + state.camera.x,
    y: clientY - rect.top + state.camera.y
  };
}

function startGame() {
  state.started = true;
  els.opening.classList.add("hidden");
  els.hud.classList.remove("hidden");
  achievement("quest-begun", "Quest Begun");
  updateHud();
  save();
}

function bootOpening() {
  if (state.started) {
    els.opening.classList.add("hidden");
    els.hud.classList.remove("hidden");
    return;
  }
  let i = 0;
  const timer = setInterval(() => {
    els.pages[i].classList.remove("active");
    i += 1;
    if (i >= els.pages.length) {
      clearInterval(timer);
      els.pages[els.pages.length - 1].classList.add("active");
      els.begin.classList.remove("hidden");
    } else {
      els.pages[i].classList.add("active");
    }
  }, 2300);
}

function loop(now) {
  const dt = Math.min(0.033, (now - (loop.last || now)) / 1000);
  loop.last = now;
  state.time += dt;
  if (state.started && !state.activeDialogue) {
    updatePlayer(dt);
    updateCamera();
  }
  drawWorld();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if ([" ", "e"].includes(key)) {
    event.preventDefault();
    if (state.activeDialogue) showDialogueLine();
    else interact();
  }
  if (key === "escape") {
    els.journal.classList.add("hidden");
  }
});

window.addEventListener("keyup", event => keys.delete(event.key.toLowerCase()));

canvas.addEventListener("pointerdown", event => {
  if (!state.started) return;
  const pos = screenToWorld(event.clientX, event.clientY);
  const bounds = allowedBounds();
  state.player.tx = clamp(pos.x, bounds.x + 45, bounds.x + bounds.w - 45);
  state.player.ty = clamp(pos.y, bounds.y + 65, bounds.y + bounds.h - 45);
});

canvas.addEventListener("dblclick", interact);
els.begin.addEventListener("click", startGame);
els.nextDialogue.addEventListener("click", showDialogueLine);
els.closeJournal.addEventListener("click", () => els.journal.classList.add("hidden"));
els.openGift.addEventListener("click", showEarth);
els.earthButton.addEventListener("click", openLetter);
els.sound.addEventListener("click", async () => {
  setupAudio();
  await state.audio.ac.resume();
  state.soundOn = !state.soundOn;
  state.audio.master.gain.setTargetAtTime(state.soundOn ? 0.45 : 0, state.audio.ac.currentTime, 0.25);
  els.sound.textContent = state.soundOn ? "Sound On" : "Sound Off";
  setAmbience(state.castleOpen ? "The Castle" : activeChapter().name);
});

load();
resize();
bootOpening();
updateHud();
if (state.giftReady && !state.letterOpen) showEarth();
if (state.letterOpen) {
  els.opening.classList.add("hidden");
  els.hud.classList.remove("hidden");
  els.ending.classList.remove("hidden");
  openLetter();
}
requestAnimationFrame(loop);
