const CLIENT_MODES = {
  classic: {
    roundSeconds: 120,
    categories: ["name", "city", "country", "animal", "plant", "food", "thing"],
    hintsEnabled: true,
    maxHints: 3,
    hintPenalty: 2,
    targetRounds: null,
  },
  blitz: {
    roundSeconds: 45,
    categories: ["name", "city", "country", "animal", "plant", "food", "thing"],
    hintsEnabled: false,
    maxHints: 0,
    hintPenalty: 0,
    targetRounds: null,
  },
  mini: {
    roundSeconds: 60,
    categories: ["name", "city", "animal", "food"],
    hintsEnabled: true,
    maxHints: 2,
    hintPenalty: 1,
    targetRounds: null,
  },
  school: {
    roundSeconds: 180,
    categories: ["name", "city", "country", "animal", "plant", "food", "thing"],
    hintsEnabled: true,
    maxHints: 5,
    hintPenalty: 1,
    targetRounds: null,
  },
  marathon: {
    roundSeconds: 90,
    categories: ["name", "city", "country", "animal", "plant", "food", "thing"],
    hintsEnabled: true,
    maxHints: 2,
    hintPenalty: 2,
    targetRounds: 5,
  },
};

function getClientModeConfig(mode) {
  return CLIENT_MODES[mode] || CLIENT_MODES.classic;
}

function createEmptyPlayer(id, name, avatar, isHost) {
  return {
    id,
    name,
    avatar,
    submitted: false,
    roundScore: 0,
    totalScore: 0,
    isHost,
    hintsUsed: 0,
    hintsByCategory: {},
    revealedHints: {},
  };
}

function createOfflineGame(onUpdate) {
  const PLAYER_ID = "offline-player";
  let roundTimer = null;

  const game = {
    phase: "lobby",
    mode: "classic",
    roomLang: "en",
    letter: null,
    roundEndsAt: null,
    roundNumber: 0,
    player: null,
  };

  function getMode() {
    return getClientModeConfig(game.mode);
  }

  function clearTimer() {
    if (roundTimer) {
      clearTimeout(roundTimer);
      roundTimer = null;
    }
  }

  function emit() {
    onUpdate(getState());
  }

  function resetRoundFields() {
    if (!game.player) return;
    game.player.answers = {};
    game.player.submitted = false;
    game.player.roundScore = 0;
    game.player.hintsUsed = 0;
    game.player.hintsByCategory = {};
    game.player.revealedHints = {};
    game.player.categoryPoints = {};
  }

  function calculateScores() {
    const mode = getMode();
    const p = game.player;
    p.roundScore = 0;
    p.categoryPoints = {};

    for (const key of mode.categories) {
      const answer = normalizeText(p.answers?.[key], game.roomLang);
      const valid = startsWithLetter(answer, game.letter, game.roomLang);
      let points = 0;
      if (valid) {
        points = mode.uniquePoints;
        if (p.hintsByCategory[key]) {
          points = Math.max(0, points - mode.hintPenalty);
        }
      }
      p.categoryPoints[key] = points;
      p.roundScore += points;
      p.totalScore += points;
    }
  }

  function buildResults() {
    const mode = getMode();
    const p = game.player;
    return {
      letter: game.letter,
      roomLang: game.roomLang,
      mode: game.mode,
      roundNumber: game.roundNumber,
      targetRounds: mode.targetRounds,
      isFinal: game.phase === "final",
      roundWinner: p ? { name: p.name, avatar: p.avatar, totalScore: p.totalScore, roundScore: p.roundScore } : null,
      speedPlayer: null,
      categories: mode.categories.map((key) => ({
        key,
        answers: [
          {
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            answer: p.answers?.[key] || "",
            points: p.categoryPoints?.[key] || 0,
            valid: startsWithLetter(p.answers?.[key], game.letter, game.roomLang),
          },
        ],
      })),
      totals: p
        ? [{ id: p.id, name: p.name, avatar: p.avatar, roundScore: p.roundScore, totalScore: p.totalScore }]
        : [],
    };
  }

  function finishRound() {
    if (game.phase !== "playing") return;
    clearTimer();
    calculateScores();
    game.roundNumber += 1;
    const mode = getMode();
    game.phase = mode.targetRounds && game.roundNumber >= mode.targetRounds ? "final" : "results";
    emit();
  }

  function getState() {
    const mode = getMode();
    const players = game.player ? [game.player] : [];
    return {
      phase: game.phase,
      mode: game.mode,
      playType: "offline",
      hostId: PLAYER_ID,
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
      you: PLAYER_ID,
      isHost: true,
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        submitted: p.submitted,
        roundScore: p.roundScore,
        totalScore: p.totalScore,
        isHost: true,
        hintsUsed: p.hintsUsed,
      })),
      myHints: game.player
        ? {
            used: game.player.hintsUsed,
            max: mode.maxHints,
            byCategory: { ...game.player.hintsByCategory },
            revealed: { ...game.player.revealedHints },
          }
        : null,
      results: game.phase === "results" || game.phase === "final" ? buildResults() : null,
    };
  }

  return {
    join(name, avatar, lang) {
      game.roomLang = lang === "cs" ? "cs" : "en";
      game.player = createEmptyPlayer(PLAYER_ID, name.slice(0, 24), avatar, true);
      game.player.answers = {};
      game.player.categoryPoints = {};
      emit();
    },
    setMode(mode) {
      if (!CLIENT_MODES[mode]) return;
      game.mode = mode;
      if (mode !== "marathon") game.roundNumber = 0;
      emit();
    },
    setLang(lang) {
      game.roomLang = lang === "cs" ? "cs" : "en";
      emit();
    },
    startRound() {
      if (!game.player) return;
      clearTimer();
      resetRoundFields();
      game.phase = "spinning";
      game.letter = null;
      game.roundEndsAt = null;
      emit();
    },
    stopSpin() {
      if (game.phase !== "spinning") return;
      const mode = getMode();
      game.letter = pickRandomLetter(game.roomLang);
      game.roundEndsAt = Date.now() + mode.roundSeconds * 1000;
      game.phase = "playing";
      clearTimer();
      roundTimer = setTimeout(finishRound, mode.roundSeconds * 1000 + 50);
      emit();
    },
    useHint(category) {
      if (game.phase !== "playing" || !game.player) return null;
      const mode = getMode();
      if (!mode.hintsEnabled) return null;
      if (game.player.hintsUsed >= mode.maxHints) return null;
      if (game.player.hintsByCategory[category]) return null;
      if (!mode.categories.includes(category)) return null;

      game.player.hintsUsed += 1;
      game.player.hintsByCategory[category] = true;
      const hint = getHint(game.roomLang, category, game.letter);
      game.player.revealedHints[category] = hint;
      emit();
      return hint;
    },
    submit(answers) {
      if (game.phase !== "playing" || !game.player || game.player.submitted) return;
      const mode = getMode();
      game.player.answers = {};
      for (const key of mode.categories) {
        game.player.answers[key] = String(answers?.[key] || "").trim();
      }
      game.player.submitted = true;
      finishRound();
    },
    resetGame() {
      clearTimer();
      game.phase = "lobby";
      game.roundNumber = 0;
      game.letter = null;
      game.roundEndsAt = null;
      if (game.player) {
        game.player.totalScore = 0;
        resetRoundFields();
      }
      emit();
    },
    getState,
  };
}

function pickRandomLetter(lang) {
  const alphabet = getAlphabet(lang);
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}
