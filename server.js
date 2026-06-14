const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const os = require("os");
const {
  AVATARS,
  normalizeAvatarId,
  getModeConfig,
  normalizeText,
  startsWithLetter,
  pickRandomLetter,
} = require("./shared");
const { getHint } = require("./hints-data");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(
  express.static(path.join(__dirname), {
    setHeaders(res, filePath) {
      if (/\.(html|css|js)$/.test(filePath)) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

const game = {
  phase: "lobby",
  mode: "classic",
  hostId: null,
  roomLang: "en",
  letter: null,
  roundEndsAt: null,
  roundTimer: null,
  roundNumber: 0,
  firstSubmitId: null,
  players: new Map(),
};

function getLocalAddresses() {
  const addresses = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) {
        addresses.push(addr.address);
      }
    }
  }
  return addresses;
}

function getMode() {
  return getModeConfig(game.mode);
}

function pickHostId() {
  return game.players.keys().next().value || null;
}

function syncRoomLang() {
  const host = game.players.get(game.hostId);
  if (host && (host.lang === "cs" || host.lang === "en")) {
    game.roomLang = host.lang;
  }
}

function clearRoundTimer() {
  if (game.roundTimer) {
    clearTimeout(game.roundTimer);
    game.roundTimer = null;
  }
}

function resetPlayersForRound() {
  game.firstSubmitId = null;
  for (const player of game.players.values()) {
    player.answers = {};
    player.submitted = false;
    player.roundScore = 0;
    player.speedBonus = 0;
    player.categoryPoints = {};
    player.hintsUsed = 0;
    player.hintsByCategory = {};
    player.revealedHints = {};
  }
}

function calculateScores() {
  const mode = getMode();

  for (const player of game.players.values()) {
    player.roundScore = 0;
    player.speedBonus = 0;
    player.categoryPoints = {};
  }

  for (const key of mode.categories) {
    const entries = [];

    for (const player of game.players.values()) {
      const answer = normalizeText(player.answers[key], game.roomLang);
      const valid = startsWithLetter(answer, game.letter, game.roomLang);
      entries.push({ player, answer, valid });
    }

    const counts = new Map();
    for (const entry of entries) {
      if (!entry.valid) continue;
      counts.set(entry.answer, (counts.get(entry.answer) || 0) + 1);
    }

    for (const entry of entries) {
      let points = 0;
      if (entry.valid) {
        points = counts.get(entry.answer) === 1 ? mode.uniquePoints : mode.duplicatePoints;
        if (entry.player.hintsByCategory?.[key]) {
          points = Math.max(0, points - mode.hintPenalty);
        }
      }
      entry.player.categoryPoints[key] = points;
      entry.player.roundScore += points;
      entry.player.totalScore += points;
    }
  }

  if (game.firstSubmitId && mode.speedBonus > 0) {
    const speedPlayer = game.players.get(game.firstSubmitId);
    if (speedPlayer) {
      speedPlayer.speedBonus = mode.speedBonus;
      speedPlayer.roundScore += mode.speedBonus;
      speedPlayer.totalScore += mode.speedBonus;
    }
  }
}

function buildResults() {
  const mode = getMode();
  const totals = Array.from(game.players.values())
    .map((player) => ({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      roundScore: player.roundScore,
      speedBonus: player.speedBonus,
      totalScore: player.totalScore,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return {
    letter: game.letter,
    roomLang: game.roomLang,
    mode: game.mode,
    roundNumber: game.roundNumber,
    targetRounds: mode.targetRounds,
    isFinal: game.phase === "final",
    roundWinner: totals[0] || null,
    speedPlayer: game.firstSubmitId
      ? {
          id: game.firstSubmitId,
          name: game.players.get(game.firstSubmitId)?.name,
          avatar: game.players.get(game.firstSubmitId)?.avatar,
          bonus: game.players.get(game.firstSubmitId)?.speedBonus || 0,
        }
      : null,
    categories: mode.categories.map((key) => ({
      key,
      answers: Array.from(game.players.values()).map((player) => ({
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        answer: player.answers[key] || "",
        points: player.categoryPoints[key] || 0,
        valid: startsWithLetter(player.answers[key], game.letter, game.roomLang),
      })),
    })),
    totals,
  };
}

function finishRound() {
  if (game.phase !== "playing") return;

  clearRoundTimer();
  calculateScores();
  game.roundNumber += 1;

  const mode = getMode();
  if (mode.targetRounds && game.roundNumber >= mode.targetRounds) {
    game.phase = "final";
  } else {
    game.phase = "results";
  }

  broadcastState();
}

function scheduleRoundEnd() {
  clearRoundTimer();
  const remaining = game.roundEndsAt - Date.now();
  if (remaining <= 0) {
    finishRound();
    return;
  }
  game.roundTimer = setTimeout(finishRound, remaining + 50);
}

function getPublicState(socketId) {
  const mode = getMode();
  return {
    phase: game.phase,
    mode: game.mode,
    hostId: game.hostId,
    roomLang: game.roomLang,
    letter: game.letter,
    roundEndsAt: game.roundEndsAt,
    roundSeconds: mode.roundSeconds,
    roundNumber: game.roundNumber,
    targetRounds: mode.targetRounds,
    activeCategories: mode.categories,
    hintsEnabled: mode.hintsEnabled,
    maxHints: mode.maxHints,
    hintPenalty: mode.hintPenalty,
    playType: "online",
    you: socketId,
    isHost: socketId === game.hostId,
    players: Array.from(game.players.values()).map((player) => ({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      submitted: player.submitted,
      roundScore: player.roundScore,
      totalScore: player.totalScore,
      isHost: player.id === game.hostId,
      hintsUsed: player.hintsUsed || 0,
    })),
    myHints: (() => {
      const me = game.players.get(socketId);
      if (!me) return null;
      return {
        used: me.hintsUsed || 0,
        max: mode.maxHints,
        byCategory: { ...(me.hintsByCategory || {}) },
        revealed: { ...(me.revealedHints || {}) },
      };
    })(),
    results:
      game.phase === "results" || game.phase === "final" ? buildResults() : null,
  };
}

function broadcastState() {
  for (const [id, socket] of io.sockets.sockets) {
    socket.emit("game-state", getPublicState(id));
  }
}

function isHost(socketId) {
  return socketId === game.hostId;
}

function purgeDisconnectedPlayers() {
  for (const id of game.players.keys()) {
    if (!io.sockets.sockets.has(id)) {
      game.players.delete(id);
    }
  }
  if (game.hostId && !game.players.has(game.hostId)) {
    game.hostId = pickHostId();
    syncRoomLang();
  }
}

function getConnectedPlayers() {
  purgeDisconnectedPlayers();
  return Array.from(game.players.values());
}

function allActivePlayersSubmitted() {
  const active = getConnectedPlayers();
  if (active.length === 0) return false;
  return active.every((player) => player.submitted);
}

function maybeFinishRoundEarly() {
  if (game.phase !== "playing") return false;
  const connected = getConnectedPlayers();
  if (connected.length === 0) return false;
  if (connected.length === 1 && connected[0].submitted) {
    finishRound();
    return true;
  }
  if (!allActivePlayersSubmitted()) return false;
  finishRound();
  return true;
}

function pickAvatar(requested) {
  const id = normalizeAvatarId(requested);
  if (AVATARS.includes(id)) return id;
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

io.on("connection", (socket) => {
  socket.on("join", ({ name, lang, avatar }) => {
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      socket.emit("error-msg", "NAME_REQUIRED");
      return;
    }

    if (game.phase !== "lobby" && game.phase !== "results" && game.phase !== "final") {
      socket.emit("error-msg", "ROUND_IN_PROGRESS");
      return;
    }

    const playerLang = lang === "cs" ? "cs" : "en";

    game.players.set(socket.id, {
      id: socket.id,
      name: trimmed.slice(0, 24),
      lang: playerLang,
      avatar: pickAvatar(avatar),
      answers: {},
      submitted: false,
      roundScore: 0,
      totalScore: 0,
      speedBonus: 0,
      categoryPoints: {},
      hintsUsed: 0,
      hintsByCategory: {},
      revealedHints: {},
    });

    if (!game.hostId) {
      game.hostId = socket.id;
      game.roomLang = playerLang;
    } else {
      syncRoomLang();
    }

    broadcastState();
  });

  socket.on("set-mode", ({ mode }) => {
    if (!isHost(socket.id)) return;
    if (game.phase !== "lobby" && game.phase !== "results" && game.phase !== "final") return;
    if (!getModeConfig(mode)) return;

    game.mode = mode;
    if (mode !== "marathon") {
      game.roundNumber = 0;
    }
    broadcastState();
  });

  socket.on("set-lang", ({ lang }) => {
    const player = game.players.get(socket.id);
    if (!player) return;

    player.lang = lang === "cs" ? "cs" : "en";
    if (isHost(socket.id)) {
      game.roomLang = player.lang;
    }
    broadcastState();
  });

  socket.on("start-round", () => {
    if (!isHost(socket.id)) return;
    if (game.players.size < 1) return;
    if (game.phase !== "lobby" && game.phase !== "results") return;

    syncRoomLang();
    clearRoundTimer();
    resetPlayersForRound();
    game.phase = "spinning";
    game.letter = null;
    game.roundEndsAt = null;
    broadcastState();
  });

  socket.on("stop-spin", () => {
    if (!isHost(socket.id)) return;
    if (game.phase !== "spinning") return;

    syncRoomLang();
    const mode = getMode();
    game.letter = pickRandomLetter(game.roomLang);
    game.roundEndsAt = Date.now() + mode.roundSeconds * 1000;
    game.phase = "playing";
    scheduleRoundEnd();
    broadcastState();
  });

  socket.on("submit-answers", ({ answers }) => {
    const player = game.players.get(socket.id);
    if (!player || game.phase !== "playing" || player.submitted) return;

    const mode = getMode();
    player.answers = {};
    for (const key of mode.categories) {
      player.answers[key] = String(answers?.[key] || "").trim();
    }
    player.submitted = true;

    if (!game.firstSubmitId) {
      game.firstSubmitId = socket.id;
      io.emit("player-submitted", {
        name: player.name,
        avatar: player.avatar,
        first: true,
      });
    } else {
      io.emit("player-submitted", {
        name: player.name,
        avatar: player.avatar,
        first: false,
      });
    }

    if (maybeFinishRoundEarly()) return;
    broadcastState();
  });

  socket.on("use-hint", ({ category }) => {
    const player = game.players.get(socket.id);
    if (!player || game.phase !== "playing" || player.submitted) return;

    const mode = getMode();
    if (!mode.hintsEnabled) return;
    if (player.hintsUsed >= mode.maxHints) return;
    if (player.hintsByCategory[category]) return;
    if (!mode.categories.includes(category)) return;

    player.hintsUsed += 1;
    player.hintsByCategory[category] = true;
    player.revealedHints[category] = getHint(game.roomLang, category, game.letter);
    broadcastState();
  });

  socket.on("reset-game", () => {
    if (!isHost(socket.id)) return;

    clearRoundTimer();
    game.phase = "lobby";
    game.roundNumber = 0;
    game.letter = null;
    game.roundEndsAt = null;
    game.firstSubmitId = null;

    for (const player of game.players.values()) {
      player.answers = {};
      player.submitted = false;
      player.roundScore = 0;
      player.totalScore = 0;
      player.speedBonus = 0;
      player.categoryPoints = {};
      player.hintsUsed = 0;
      player.hintsByCategory = {};
      player.revealedHints = {};
    }

    broadcastState();
  });

  socket.on("disconnect", () => {
    game.players.delete(socket.id);

    if (game.hostId === socket.id) {
      game.hostId = pickHostId();
      syncRoomLang();
    }

    if (game.players.size === 0) {
      clearRoundTimer();
      game.phase = "lobby";
      game.mode = "classic";
      game.roundNumber = 0;
      game.letter = null;
      game.roundEndsAt = null;
      game.hostId = null;
      game.roomLang = "en";
      game.firstSubmitId = null;
      broadcastState();
      return;
    }

    if (maybeFinishRoundEarly()) return;
    broadcastState();
  });
});

server.listen(PORT, "0.0.0.0", () => {
  const addresses = getLocalAddresses();
  console.log(`\nOZWords server running on port ${PORT}`);
  console.log("On this computer:  http://localhost:" + PORT);
  if (addresses.length) {
    console.log("For others on LAN:");
    for (const ip of addresses) {
      console.log("  http://" + ip + ":" + PORT);
    }
  } else {
    console.log("Could not detect LAN IP — use ipconfig.");
  }
  console.log("");
});
