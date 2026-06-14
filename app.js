let socket = null;
let offlineEngine = null;
let playType = getPlayType();
let gameState = null;
let spinInterval = null;
let timerInterval = null;
let joined = false;
let selectedAvatar = AVATARS[0];
let lastPhase = null;
let lastRoundNumber = 0;
let tipIndex = 0;
let tipInterval = null;
const activityLog = [];

const RING_CIRC = 2 * Math.PI * 54;

const els = {
  joinForm: document.getElementById("joinForm"),
  joinBtn: document.getElementById("joinBtn"),
  playerName: document.getElementById("playerName"),
  joinHint: document.getElementById("joinHint"),
  avatarGrid: document.getElementById("avatarGrid"),
  lobbyPanel: document.getElementById("lobbyPanel"),
  roleBadge: document.getElementById("roleBadge"),
  roleBanner: document.getElementById("roleBanner"),
  lanUrl: document.getElementById("lanUrl"),
  copyLinkBtn: document.getElementById("copyLinkBtn"),
  qrBox: document.getElementById("qrBox"),
  qrCode: document.getElementById("qrCode"),
  qrLabel: document.getElementById("qrLabel"),
  leaveBtn: document.getElementById("leaveBtn"),
  joinRules: document.getElementById("joinRules"),
  playerCount: document.getElementById("playerCount"),
  playerList: document.getElementById("playerList"),
  modeSection: document.getElementById("modeSection"),
  modeGrid: document.getElementById("modeGrid"),
  hostActions: document.getElementById("hostActions"),
  waitMsg: document.getElementById("waitMsg"),
  startRoundBtn: document.getElementById("startRoundBtn"),
  lobbySection: document.getElementById("lobbySection"),
  letterSection: document.getElementById("letterSection"),
  letterDisplay: document.getElementById("letterDisplay"),
  stopBtn: document.getElementById("stopBtn"),
  spinWaitMsg: document.getElementById("spinWaitMsg"),
  spinModeBadge: document.getElementById("spinModeBadge"),
  gameSection: document.getElementById("gameSection"),
  selectedLetter: document.getElementById("selectedLetter"),
  fields: document.getElementById("fields"),
  fieldsProgress: document.getElementById("fieldsProgress"),
  fieldsProgressFill: document.getElementById("fieldsProgressFill"),
  gameForm: document.getElementById("gameForm"),
  resultBox: document.getElementById("resultBox"),
  timer: document.getElementById("timer"),
  timerRingFg: document.getElementById("timerRingFg"),
  timerWidget: document.getElementById("timerWidget"),
  submitStatus: document.getElementById("submitStatus"),
  submitAvatars: document.getElementById("submitAvatars"),
  submitBtn: document.getElementById("submitBtn"),
  gameModeBadge: document.getElementById("gameModeBadge"),
  gameRoundBadge: document.getElementById("gameRoundBadge"),
  resultsSection: document.getElementById("resultsSection"),
  resultsLetter: document.getElementById("resultsLetter"),
  resultsContent: document.getElementById("resultsContent"),
  scoreboard: document.getElementById("scoreboard"),
  podium: document.getElementById("podium"),
  highlights: document.getElementById("highlights"),
  nextRoundBtn: document.getElementById("nextRoundBtn"),
  newGameBtn: document.getElementById("newGameBtn"),
  resultsWaitMsg: document.getElementById("resultsWaitMsg"),
  soundBtn: document.getElementById("soundBtn"),
  homeBtn: document.getElementById("homeBtn"),
  stepper: document.getElementById("stepper"),
  schoolTipText: document.getElementById("schoolTipText"),
  activityList: document.getElementById("activityList"),
  hintsBar: document.getElementById("hintsBar"),
  keyboardHint: document.getElementById("keyboardHint"),
  modeHintsNote: document.getElementById("modeHintsNote"),
  playTypeGrid: document.getElementById("playTypeGrid"),
  infoBox: document.querySelector(".info-box"),
  activityFeed: document.getElementById("activityFeed"),
};

const appEl = document.querySelector(".app");

function setAppPhase(phase) {
  const mapped = phase === "final" ? "results" : phase || "lobby";
  appEl.classList.remove("is-lobby", "is-spinning", "is-playing", "is-results");
  appEl.classList.add(`is-${mapped}`);
}

function isOffline() {
  return playType === "offline";
}

function isOnline() {
  return playType === "online";
}

function isSoloGame(state) {
  if (!state) return isOffline();
  return isOffline() || state.players.length <= 1;
}

function ensureOnlineSocket() {
  if (socket) return socket;
  socket = io();
  bindOnlineEvents();
  return socket;
}

function emitAction(action, payload) {
  if (isOffline()) {
    if (!offlineEngine) return;
    if (action === "join") offlineEngine.join(payload.name, payload.avatar, payload.lang);
    if (action === "set-mode") offlineEngine.setMode(payload.mode);
    if (action === "set-lang") offlineEngine.setLang(payload.lang);
    if (action === "start-round") offlineEngine.startRound();
    if (action === "stop-spin") offlineEngine.stopSpin();
    if (action === "submit-answers") offlineEngine.submit(payload.answers);
    if (action === "reset-game") offlineEngine.resetGame();
    if (action === "use-hint") offlineEngine.useHint(payload.category);
    return;
  }
  ensureOnlineSocket().emit(action, payload);
}

function updateSharePanel(url) {
  if (!url || isOffline()) {
    els.qrBox?.classList.add("hidden");
    return;
  }
  els.qrBox?.classList.remove("hidden");
  if (els.qrCode) {
    els.qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(url)}`;
    els.qrCode.alt = url;
  }
  if (els.qrLabel) els.qrLabel.textContent = t("qrScan");
}

function leaveRoom() {
  joined = false;
  gameState = null;
  activityLog.length = 0;
  stopSpinAnimation();
  stopTimer();

  if (isOffline()) {
    offlineEngine = null;
  } else if (socket) {
    socket.disconnect();
    socket = null;
  }

  els.joinForm.classList.remove("hidden");
  els.lobbyPanel.classList.add("hidden");
  els.joinHint.classList.add("hidden");
  setAppPhase("lobby");
  renderActivityFeed();
  updateHomeButton();
  showSection(els.lobbySection);
}

function updateHomeButton() {
  if (!els.homeBtn) return;
  const show = joined || (gameState && gameState.phase !== "lobby");
  els.homeBtn.classList.toggle("hidden", !show);
  els.homeBtn.innerHTML = renderIcon("home", "icon-md");
  els.homeBtn.setAttribute("aria-label", t("homeBtn"));
  els.homeBtn.title = t("homeBtn");
}

function goHome() {
  if (!joined && (!gameState || gameState.phase === "lobby")) return;
  leaveRoom();
  showToast(t("homeBtn"));
}

function updateSubmitButtonState(categories) {
  if (!gameState || gameState.phase !== "playing") return;
  const me = gameState.players.find((p) => p.id === gameState.you);
  if (me?.submitted) return;

  let filled = 0;
  categories.forEach((key) => {
    const field = els.fields.querySelector(`[data-key="${key}"]`);
    if (field?.classList.contains("filled")) filled += 1;
  });

  const allFilled = filled === categories.length;
  els.submitBtn.classList.toggle("btn-ready", allFilled);
  els.submitBtn.classList.toggle("btn-pulse", allFilled);
}

function initStaticIcons() {
  setIcon(document.getElementById("mascotA"), "book");
  setIcon(document.getElementById("mascotB"), "pencil");
  setIcon(document.getElementById("tipIcon"), "hint");
  setIcon(document.getElementById("phaseIcon"), "dice");
  document.querySelectorAll("[data-icon]").forEach((el) => setIcon(el, el.dataset.icon));
  updateSoundIcon(isSoundEnabled());
}

function updateSoundIcon(on) {
  els.soundBtn.innerHTML = renderIcon(on ? "soundOn" : "soundOff", "icon-md");
  els.soundBtn.setAttribute("aria-label", on ? t("soundOn") : t("soundOff"));
}

function renderModeBadge(el, mode) {
  if (!el) return;
  const meta = MODES[mode] || MODES.classic;
  el.innerHTML = `${renderIcon(meta.icon, "icon-sm")} ${modeLabel(mode)}`;
}

function renderPlayTypeSelector() {
  document.getElementById("pickPlayTypeLabel").textContent = t("pickPlayType");
  document.getElementById("playOfflineLabel").textContent = t("playOffline");
  document.getElementById("playOfflineDesc").textContent = t("playOfflineDesc");
  document.getElementById("playOnlineLabel").textContent = t("playOnline");
  document.getElementById("playOnlineDesc").textContent = t("playOnlineDesc");

  els.playTypeGrid.querySelectorAll(".play-type-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.play === playType);
    card.onclick = () => {
      playType = card.dataset.play;
      setPlayType(playType);
      renderPlayTypeSelector();
    };
  });
}

function updateHintsBar(state) {
  if (!state || state.phase !== "playing") {
    els.hintsBar.textContent = "";
    els.hintsBar.classList.add("hidden");
    return;
  }
  const cfg = getClientModeConfig(state.mode);
  els.hintsBar.classList.remove("hidden");
  if (!cfg.hintsEnabled) {
    els.hintsBar.textContent = t("hintsDisabled");
    return;
  }
  const used = state.myHints?.used ?? 0;
  const max = state.myHints?.max ?? cfg.maxHints;
  els.hintsBar.textContent =
    t("hintsLeft", { left: max - used, max }) +
    " · " +
    t("hintPenaltyNote", { n: state.hintPenalty ?? cfg.hintPenalty });
}

function requestHint(category) {
  if (!gameState || gameState.phase !== "playing") return;
  if (gameState.myHints?.byCategory?.[category]) {
    showToast(t("hintAlreadyUsed"));
    return;
  }
  const left = (gameState.myHints?.max ?? 0) - (gameState.myHints?.used ?? 0);
  if (left <= 0) {
    showToast(t("noHintsLeft"));
    return;
  }
  emitAction("use-hint", { category });
  showToastHtml(`${renderIcon("hint", "icon-sm")} ${t("hintBtn")}`);
}

function applyRevealedHints(state) {
  const revealed = state?.myHints?.revealed || {};
  Object.entries(revealed).forEach(([key, text]) => {
    const field = els.fields.querySelector(`[data-key="${key}"]`);
    if (!field) return;
    let hintEl = field.querySelector(".hint-text");
    if (!hintEl) {
      hintEl = document.createElement("p");
      hintEl.className = "hint-text";
      field.appendChild(hintEl);
    }
    hintEl.textContent = text;
    const hintBtn = field.querySelector(".hint-btn");
    if (hintBtn) hintBtn.disabled = true;
  });
}

function bindOnlineEvents() {
  socket.on("game-state", (state) => {
    if (isOffline()) return;
    const wasJoined = joined;
    const prevNames = gameState?.players?.map((p) => p.id) || [];

    if (state.players.some((p) => p.id === state.you)) {
      joined = true;
      if (!wasJoined) {
        sfxJoin();
        showPhaseBanner("school", t("phaseLobby"));
      }
    }

    state.players.forEach((p) => {
      if (!prevNames.includes(p.id) && p.id !== state.you) {
        pushActivity(
          `${renderAvatar(p.avatar, "icon-xs")} ${t("activityJoin", { name: p.name })}`
        );
      }
    });

    applyState(state);
  });

  socket.on("player-submitted", ({ name, avatar, first }) => {
    if (isOffline()) return;
    const msg = first ? t("toastFirst", { name }) : t("toastSubmitted", { name });
    showToastHtml(`${renderAvatar(avatar, "icon-xs")} ${msg}`);
  });

  socket.on("error-msg", (code) => {
    if (isOffline()) return;
    els.joinHint.textContent = translateError(code);
    els.joinHint.classList.remove("hidden");
  });
}

function pickRandomLetter(lang) {
  const alphabet = getAlphabet(lang);
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function hideAllSections() {
  els.lobbySection.classList.add("hidden");
  els.letterSection.classList.add("hidden");
  els.gameSection.classList.add("hidden");
  els.resultsSection.classList.add("hidden");
}

function showSection(sectionEl) {
  hideAllSections();
  sectionEl.classList.remove("hidden");
  sectionEl.classList.remove("animate-in");
  void sectionEl.offsetWidth;
  sectionEl.classList.add("animate-in");
}

function getRoomLang(state) {
  return state?.roomLang === "cs" ? "cs" : "en";
}

function setRingProgress(circleEl, remaining, total) {
  if (!circleEl) return;
  const ratio = Math.max(0, Math.min(1, remaining / total));
  circleEl.style.strokeDashoffset = String(RING_CIRC * (1 - ratio));
  circleEl.classList.toggle("urgent", remaining <= 10 && remaining > 0);
}

function stopSpinAnimation() {
  if (spinInterval) {
    clearInterval(spinInterval);
    spinInterval = null;
  }
  els.letterDisplay.classList.remove("spinning");
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  els.timerWidget?.classList.remove("urgent");
  resetTickTracking();
}

function startSpinAnimation(lang) {
  stopSpinAnimation();
  els.letterDisplay.classList.add("spinning");
  spinInterval = setInterval(() => {
    els.letterDisplay.textContent = pickRandomLetter(lang);
  }, 50);
}

function startSyncedTimer(roundEndsAt, roundSeconds) {
  stopTimer();

  const tick = () => {
    const remaining = Math.max(0, Math.ceil((roundEndsAt - Date.now()) / 1000));
    els.timer.textContent = remaining > 0 ? formatTime(remaining) : t("timeUp");
    setRingProgress(els.timerRingFg, remaining, roundSeconds);
    els.timerWidget?.classList.toggle("urgent", remaining <= 10 && remaining > 0);
    sfxCountdownTick(remaining);
    if (remaining <= 0) stopTimer();
  };

  tick();
  timerInterval = setInterval(tick, 200);
}

function updateStepper(phase) {
  const stepMap = {
    lobby: "lobby",
    spinning: "spinning",
    playing: "playing",
    results: "results",
    final: "results",
  };
  const current = stepMap[phase] || "lobby";
  const order = ["lobby", "spinning", "playing", "results"];
  const currentIdx = order.indexOf(current);

  els.stepper.querySelectorAll(".step").forEach((step) => {
    const stepName = step.dataset.step;
    const idx = order.indexOf(stepName);
    step.classList.remove("active", "done");
    if (idx < currentIdx) step.classList.add("done");
    if (stepName === current) step.classList.add("active");
  });
}

function getPhaseBanner(phase) {
  const map = {
    spinning: { icon: "dice", text: t("phaseSpin") },
    playing: { icon: "pencil", text: t("phasePlay") },
    results: { icon: "party", text: t("phaseResults") },
    final: { icon: "trophy", text: t("phaseFinal") },
  };
  return map[phase] || null;
}

function maybeShowPhaseBanner(prevPhase, newPhase) {
  if (prevPhase === newPhase) return;
  const banner = getPhaseBanner(newPhase);
  if (banner) showPhaseBanner(banner.icon, banner.text);
}

function startSchoolTips() {
  const tips = STRINGS[getLang()].schoolTips;
  if (!tips?.length) return;
  tipIndex = 0;
  els.schoolTipText.textContent = tips[0];
  if (tipInterval) clearInterval(tipInterval);
  tipInterval = setInterval(() => {
    tipIndex = (tipIndex + 1) % tips.length;
    els.schoolTipText.style.opacity = "0";
    setTimeout(() => {
      els.schoolTipText.textContent = tips[tipIndex];
      els.schoolTipText.style.opacity = "1";
    }, 250);
  }, 4500);
}

function pushActivity(message) {
  activityLog.unshift(message);
  if (activityLog.length > 6) activityLog.pop();
  renderActivityFeed();
}

function renderActivityFeed() {
  document.getElementById("activityTitle").textContent = t("activityTitle");
  if (activityLog.length === 0) {
    els.activityList.innerHTML = `<li>${t("activityEmpty")}</li>`;
    return;
  }
  els.activityList.innerHTML = activityLog.map((msg) => `<li>${msg}</li>`).join("");
}

function renderSubmitAvatars(state) {
  els.submitAvatars.innerHTML = state.players
    .map(
      (p) =>
        `<div class="submit-avatar${p.submitted ? " done" : ""}" title="${p.name}">${renderAvatar(p.avatar, "icon-md")}</div>`
    )
    .join("");
}

function bindFieldInteractions(letter, lang, state) {
  const categories = getActiveCategories(state);
  els.fields.querySelectorAll(".field").forEach((field) => {
    const key = field.dataset.key;
    const input = field.querySelector("input");

    input.addEventListener("input", () => {
      const value = input.value.trim();
      const valid = value && startsWithLetter(value, letter, lang);
      field.classList.toggle("filled", !!valid);
      updateFieldsProgress(categories);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const inputs = [...els.fields.querySelectorAll("input:not([disabled])")];
      const idx = inputs.indexOf(input);
      if (idx >= 0 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      } else {
        els.submitBtn.focus();
      }
    });

    const hintBtn = field.querySelector(".hint-btn");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => requestHint(key));
    }
  });
  updateFieldsProgress(categories);
  applyRevealedHints(state);
}

function updateFieldsProgress(categories) {
  let filled = 0;
  categories.forEach((key) => {
    const field = els.fields.querySelector(`[data-key="${key}"]`);
    if (field?.classList.contains("filled")) filled += 1;
  });
  const total = categories.length || 1;
  els.fieldsProgress.textContent = t("fieldsProgress", {
    done: filled,
    total: categories.length,
  });
  if (els.fieldsProgressFill) {
    els.fieldsProgressFill.style.width = `${Math.round((filled / total) * 100)}%`;
  }
  updateSubmitButtonState(categories);
}

function renderAvatars() {
  els.avatarGrid.innerHTML = AVATARS.map(
    (id) =>
      `<button type="button" class="avatar-btn${id === selectedAvatar ? " selected" : ""}" data-avatar="${id}">${renderAvatar(id, "icon-lg")}</button>`
  ).join("");

  els.avatarGrid.querySelectorAll(".avatar-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedAvatar = btn.dataset.avatar;
      renderAvatars();
    });
  });
}

function renderModeGrid(state) {
  els.modeGrid.innerHTML = Object.keys(MODES)
    .map((mode) => {
      const meta = MODES[mode];
      const selected = state.mode === mode ? " selected" : "";
      return `
        <button type="button" class="mode-card${selected}" data-mode="${mode}" style="--mode-color:${meta.color}">
          <span class="mode-icon">${renderIcon(meta.icon, "icon-lg")}</span>
          <span class="mode-name">${modeLabel(mode)}</span>
          <span class="mode-desc">${modeDesc(mode)}</span>
        </button>
      `;
    })
    .join("");

  els.modeGrid.querySelectorAll(".mode-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (!state.isHost && !isOffline()) return;
      emitAction("set-mode", { mode: card.dataset.mode });
      els.modeHintsNote.textContent = modeHintsDesc(card.dataset.mode);
    });
  });
}

function playerStatus(player, phase) {
  if (phase === "playing") {
    if (player.submitted) return `<span class="status status-done">${t("statusDone")}</span>`;
    return `<span class="status status-wait">${t("statusWaiting")}</span>`;
  }
  return `<span class="status status-ready">${t("statusReady")}</span>`;
}

function renderPlayerCards(state) {
  els.playerList.innerHTML = state.players
    .map(
      (player, i) => `
        <div class="player-card" style="animation-delay:${i * 0.06}s">
          <span class="avatar">${renderAvatar(player.avatar, "icon-lg")}</span>
          <div class="info">
            <div class="name">${player.name}${player.isHost ? ` ${renderIcon("crown", "icon-xs icon-gold")}` : ""}</div>
            <div class="score">${player.totalScore} ${t("pointsShort")}</div>
          </div>
          ${playerStatus(player, state.phase)}
        </div>
      `
    )
    .join("");
}

function renderFields(letter, disabled, categories, state) {
  const cfg = getClientModeConfig(state?.mode);
  const hintsEnabled = cfg.hintsEnabled && state?.phase === "playing";
  const revealed = state?.myHints?.byCategory || {};

  els.fields.innerHTML = categories
    .map((key, i) => {
      const label = categoryLabel(key);
      const iconKey = CATEGORY_ICONS[key] || "note";
      const hintBtn = hintsEnabled
        ? `<button type="button" class="hint-btn" title="${t("hintBtn")}" ${revealed[key] ? "disabled" : ""}>${renderIcon("hint", "icon-sm")}</button>`
        : "";
      return `
        <div class="field" data-key="${key}" data-cat="${key}" style="animation-delay:${i * 0.05}s">
          <div class="field-row">
            <span class="field-icon">${renderIcon(iconKey, "icon-md")}</span>
            <div class="field-body">
              <label for="${key}">${label}</label>
              <input id="${key}" name="${key}" type="text" autocomplete="off" placeholder="${t("fieldPlaceholder", { letter })}" ${disabled ? "disabled" : ""}>
            </div>
            <div class="field-actions">
              ${hintBtn}
              <span class="field-check" aria-hidden="true">${renderIcon("check", "icon-sm")}</span>
            </div>
          </div>
          <p class="error-msg hidden"></p>
        </div>
      `;
    })
    .join("");

  if (!disabled) bindFieldInteractions(letter, getRoomLang(state), state);
  else applyRevealedHints(state);
}

function validateAnswers(letter, lang, categories) {
  let allValid = true;
  const values = {};

  categories.forEach((key) => {
    const label = categoryLabel(key);
    const field = els.fields.querySelector(`[data-key="${key}"]`);
    const input = field.querySelector("input");
    const errorMsg = field.querySelector(".error-msg");
    const value = input.value.trim();

    values[key] = value;
    field.classList.remove("invalid");
    errorMsg.classList.add("hidden");

    if (!value) {
      allValid = false;
      field.classList.add("invalid");
      errorMsg.textContent = t("fieldRequired", { label });
      errorMsg.classList.remove("hidden");
      return;
    }

    if (!startsWithLetter(value, letter, lang)) {
      allValid = false;
      field.classList.add("invalid");
      errorMsg.textContent = t("fieldMustStart", { letter });
      errorMsg.classList.remove("hidden");
    }
  });

  return { allValid, values };
}

function renderPodium(totals) {
  const top = totals.slice(0, 3);
  if (!top.length) {
    els.podium.innerHTML = "";
    return;
  }

  const order = top.length >= 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : [top[0]];
  const placeClass = ["second", "first", "third"];

  els.podium.innerHTML = order
    .map((player, i) => {
      const cls = placeClass[i] || "first";
      return `
        <div class="podium-place ${cls}">
          <div class="podium-bar"><div class="podium-avatar">${renderAvatar(player.avatar, "icon-xl")}</div></div>
          <div class="podium-name">${player.name}</div>
          <div class="podium-score">${player.totalScore} ${t("pointsShort")}</div>
        </div>
      `;
    })
    .join("");
}

function applyStaticText() {
  document.title = t("title");
  document.getElementById("appTitle").textContent = t("title");
  document.getElementById("appSubtitle").textContent = t("subtitle");
  document.getElementById("appTagline").textContent = t("tagline");
  document.getElementById("joinRoomLabel").textContent = t("joinRoom");
  document.getElementById("pickAvatarLabel").textContent = t("pickAvatar");
  els.playerName.placeholder = t("yourName");
  els.joinBtn.textContent = t("join");
  document.getElementById("inRoomLabel").textContent = t("inRoom");
  document.getElementById("shareUrlLabel").textContent = t("shareUrl");
  els.copyLinkBtn.textContent = t("copyLink");
  document.getElementById("playersLabel").textContent = t("players");
  document.getElementById("pickModeLabel").textContent = t("pickMode");
  els.startRoundBtn.textContent = t("startRound");
  els.waitMsg.textContent = t("waitHost");
  document.getElementById("spinLabel").textContent = t("letterDraw");
  els.stopBtn.textContent = t("stop");
  els.spinWaitMsg.textContent = t("hostDrawing");
  document.getElementById("roundLetterLabel").textContent = t("roundLetter");
  els.submitBtn.innerHTML = `${t("submitAnswers")} ${renderIcon("check", "icon-sm")}`;
  document.getElementById("roundResultsTitle").textContent = t("roundResults");
  document.getElementById("resultsLetterLabel").textContent = t("letter") + ":";
  els.nextRoundBtn.textContent = t("nextRound");
  els.newGameBtn.textContent = t("newGame");
  els.resultsWaitMsg.textContent = t("waitHost");
  document.getElementById("legalNotice").textContent = t("legalNotice");
  document.getElementById("creditsMadeBy").textContent = t("creditsMadeBy") + " ";
  if (els.joinRules) els.joinRules.textContent = t("gameRules");
  if (els.leaveBtn) els.leaveBtn.textContent = t("leaveRoom");
  updateHomeButton();
  if (els.keyboardHint) els.keyboardHint.textContent = t("keyboardHint");
  initStaticIcons();
  updateSoundIcon(isSoundEnabled());
  renderPlayTypeSelector();

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === getLang());
  });

  initFloatingLetters(getLang());
  startSchoolTips();
  renderActivityFeed();
}

function renderLobby(state) {
  showSection(els.lobbySection);

  if (joined) {
    els.joinForm.classList.add("hidden");
    els.lobbyPanel.classList.remove("hidden");

    const isHost = state.isHost;
    els.roleBadge.textContent = isHost ? t("host") : t("player");
    els.roleBadge.classList.toggle("teacher-badge", isHost);

    els.roleBanner.classList.remove("hidden", "teacher", "student");
    if (isOffline()) {
      els.roleBanner.classList.add("student");
      els.roleBanner.textContent = t("offlineWelcome");
    } else {
      els.roleBanner.classList.add(isHost ? "teacher" : "student");
      els.roleBanner.textContent = isHost ? t("teacherWelcome") : t("studentWelcome");
    }

    els.infoBox.classList.toggle("hidden", isOffline());
    els.activityFeed.classList.toggle("hidden", isOffline());
    const shareUrl = window.location.origin;
    els.lanUrl.textContent = shareUrl;
    updateSharePanel(shareUrl);
    els.leaveBtn.classList.remove("hidden");
    els.playerCount.textContent = String(state.players.length);
    renderPlayerCards(state);

    if (isHost || isOffline()) {
      els.modeSection.classList.remove("hidden");
      renderModeGrid(state);
      els.modeHintsNote.textContent = modeHintsDesc(state.mode);
      els.hostActions.classList.remove("hidden");
      els.waitMsg.classList.add("hidden");
      els.startRoundBtn.disabled = isOffline() ? false : state.players.length < 1;
    } else {
      els.modeSection.classList.add("hidden");
      els.hostActions.classList.add("hidden");
      els.waitMsg.classList.remove("hidden");
    }
  } else {
    els.joinForm.classList.remove("hidden");
    els.lobbyPanel.classList.add("hidden");
    els.leaveBtn.classList.add("hidden");
  }
}

function renderSpinning(state) {
  showSection(els.letterSection);
  renderModeBadge(els.spinModeBadge, state.mode);
  startSpinAnimation(getRoomLang(state));

  if (state.isHost) {
    els.stopBtn.classList.remove("hidden");
    els.spinWaitMsg.classList.add("hidden");
    els.stopBtn.disabled = false;
  } else {
    els.stopBtn.classList.add("hidden");
    els.spinWaitMsg.classList.remove("hidden");
  }
}

function renderPlaying(state, prevPhase) {
  showSection(els.gameSection);
  stopSpinAnimation();

  const roomLang = getRoomLang(state);
  const categories = getActiveCategories(state);

  if (prevPhase === "spinning") {
    els.selectedLetter.textContent = state.letter;
    els.letterDisplay.textContent = state.letter;
    els.letterDisplay.classList.add("reveal");
    sfxStop();
    setTimeout(() => els.letterDisplay.classList.remove("reveal"), 600);
  } else {
    els.selectedLetter.textContent = state.letter;
  }

  renderModeBadge(els.gameModeBadge, state.mode);

  if (state.targetRounds) {
    els.gameRoundBadge.textContent = t("roundProgress", {
      current: state.roundNumber + 1,
      total: state.targetRounds,
    });
    els.gameRoundBadge.classList.remove("hidden");
  } else if (state.roundNumber > 0) {
    els.gameRoundBadge.textContent = t("roundLabel", { n: state.roundNumber + 1 });
    els.gameRoundBadge.classList.remove("hidden");
  } else {
    els.gameRoundBadge.classList.add("hidden");
  }

  const me = state.players.find((p) => p.id === state.you);
  const alreadySubmitted = me?.submitted;

  if (!els.fields.children.length || els.fields.querySelector("input")?.disabled !== alreadySubmitted) {
    renderFields(state.letter, alreadySubmitted, categories, state);
    if (prevPhase === "spinning" && !alreadySubmitted) {
      requestAnimationFrame(() => {
        els.fields.querySelector("input:not([disabled])")?.focus({ preventScroll: true });
      });
    }
  } else {
    applyRevealedHints(state);
  }

  startSyncedTimer(state.roundEndsAt, state.roundSeconds);
  updateHintsBar(state);

  const submittedCount = state.players.filter((p) => p.submitted).length;
  if (alreadySubmitted && isSoloGame(state)) {
    els.submitStatus.textContent = t("scoringNow");
  } else {
    els.submitStatus.textContent = t("submittedCount", {
      done: submittedCount,
      total: state.players.length,
    });
  }
  renderSubmitAvatars(state);

  els.submitBtn.disabled = alreadySubmitted;
  if (alreadySubmitted) {
    els.submitBtn.innerHTML = `${t("submitted")} ${renderIcon("checkCircle", "icon-sm")}`;
  } else {
    els.submitBtn.innerHTML = `${t("submitAnswers")} ${renderIcon("check", "icon-sm")}`;
  }
  els.submitBtn.classList.remove("btn-ready", "btn-pulse");
  if (!alreadySubmitted) updateSubmitButtonState(categories);
  if (els.keyboardHint) {
    els.keyboardHint.classList.toggle("hidden", alreadySubmitted);
  }
  els.resultBox.classList.add("hidden");
}

function renderResults(state, prevPhase) {
  showSection(els.resultsSection);
  stopSpinAnimation();
  stopTimer();

  const { results } = state;
  const isFinal = state.phase === "final" || results.isFinal;

  document.getElementById("roundResultsTitle").textContent = isFinal
    ? t("finalResults")
    : t("roundResults");

  if (results.letter) els.resultsLetter.textContent = results.letter;
  renderPodium(results.totals);

  const winner = results.roundWinner;
  const speed = results.speedPlayer;
  els.highlights.innerHTML = `
    <div class="highlight-card">
      <div class="label">${t("roundWinner")}</div>
      <div class="value">${winner ? `${renderAvatar(winner.avatar, "icon-sm")} ${winner.name}` : "—"}</div>
    </div>
    <div class="highlight-card">
      <div class="label">${t("speedKing")}</div>
      <div class="value">${speed?.name ? `${renderIcon("zap", "icon-sm icon-gold")} ${speed.name} (${t("speedBonus", { n: speed.bonus })})` : "—"}</div>
    </div>
  `;

  els.resultsContent.innerHTML = results.categories
    .map(
      (category, i) => `
        <div class="result-category" data-cat="${category.key}" style="animation-delay:${i * 0.06}s">
          <h3>${renderIcon(CATEGORY_ICONS[category.key] || "note", "icon-sm")} ${categoryLabel(category.key)}</h3>
          <ul>
            ${category.answers
              .map(
                (entry) =>
                  `<li><span>${renderAvatar(entry.avatar, "icon-xs")} <strong>${entry.name}:</strong> ${entry.answer || t("emptyAnswer")}</span><span class="points">+${entry.points}</span></li>`
              )
              .join("")}
          </ul>
        </div>
      `
    )
    .join("");

  els.scoreboard.innerHTML = `
    <h3>${t("standings")}</h3>
    <ol>
      ${results.totals
        .map((player) =>
          `<li>${renderAvatar(player.avatar, "icon-xs")} ${t("scoreLine", {
            name: player.name,
            total: player.totalScore,
            round: player.roundScore,
          })}</li>`
        )
        .join("")}
    </ol>
  `;

  if (state.isHost) {
    els.nextRoundBtn.classList.toggle("hidden", isFinal);
    els.newGameBtn.classList.toggle("hidden", !isFinal);
    els.resultsWaitMsg.classList.add("hidden");
  } else {
    els.nextRoundBtn.classList.add("hidden");
    els.newGameBtn.classList.add("hidden");
    els.resultsWaitMsg.classList.remove("hidden");
  }

  if (prevPhase === "playing") {
    launchConfetti();
    sfxWin();
  }
}

function applyState(state) {
  const prevPhase = lastPhase;
  setAppPhase(state.phase);
  maybeShowPhaseBanner(prevPhase, state.phase);
  updateStepper(state.phase);

  if (prevPhase === "spinning" && state.phase === "playing") {
    pushActivity(t("activityStart"));
  }

  lastPhase = state.phase;
  lastRoundNumber = state.roundNumber;
  gameState = state;
  updateHomeButton();

  if ((state.phase === "lobby" || state.phase === "final") && !joined) {
    renderLobby(state);
    return;
  }

  if (!joined) {
    renderLobby(state);
    return;
  }

  switch (state.phase) {
    case "lobby":
      renderLobby(state);
      break;
    case "spinning":
      renderSpinning(state);
      break;
    case "playing":
      renderPlaying(state, prevPhase);
      break;
    case "results":
    case "final":
      renderResults(state, prevPhase);
      break;
    default:
      renderLobby(state);
  }
}

function changeLanguage(lang) {
  setLang(lang);
  applyStaticText();
  renderAvatars();
  if (joined) {
    if (isOffline()) offlineEngine.setLang(lang);
    else emitAction("set-lang", { lang });
  }
  if (gameState) applyState(gameState);
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => changeLanguage(btn.dataset.lang));
});

els.soundBtn.addEventListener("click", () => {
  const on = toggleSound();
  updateSoundIcon(on);
});

els.homeBtn.addEventListener("click", () => goHome());

els.leaveBtn.addEventListener("click", () => leaveRoom());

els.copyLinkBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.origin);
    els.copyLinkBtn.textContent = t("copied");
    setTimeout(() => {
      els.copyLinkBtn.textContent = t("copyLink");
    }, 2000);
  } catch (_) {}
});

els.joinBtn.addEventListener("click", () => {
  const name = els.playerName.value.trim();
  if (!name) {
    els.joinHint.textContent = t("errEnterNameFirst");
    els.joinHint.classList.remove("hidden");
    return;
  }
  els.joinHint.classList.add("hidden");

  if (isOffline()) {
    offlineEngine = createOfflineGame((state) => applyState(state));
    offlineEngine.join(name, selectedAvatar, getLang());
    joined = true;
    sfxJoin();
    showPhaseBanner("offline", t("offlineWelcome"));
    return;
  }

  ensureOnlineSocket().emit("join", { name, lang: getLang(), avatar: selectedAvatar });
});

els.playerName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") els.joinBtn.click();
});

els.startRoundBtn.addEventListener("click", () => emitAction("start-round"));
els.stopBtn.addEventListener("click", () => {
  els.stopBtn.disabled = true;
  emitAction("stop-spin");
});
els.nextRoundBtn.addEventListener("click", () => emitAction("start-round"));
els.newGameBtn.addEventListener("click", () => emitAction("reset-game"));

els.gameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!gameState || gameState.phase !== "playing") return;

  const me = gameState.players.find((p) => p.id === gameState.you);
  if (me?.submitted) return;

  const roomLang = getRoomLang(gameState);
  const categories = getActiveCategories(gameState);
  const { allValid, values } = validateAnswers(gameState.letter, roomLang, categories);
  els.resultBox.classList.remove("hidden", "success", "error");

  if (!allValid) {
    els.resultBox.classList.add("error");
    els.resultBox.textContent = t("fixErrors");
    const firstInvalid = els.fields.querySelector(".field.invalid input");
    firstInvalid?.focus({ preventScroll: false });
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  emitAction("submit-answers", { answers: values });
  sfxSubmit();

  if (gameState?.phase === "results" || gameState?.phase === "final") {
    return;
  }

  els.resultBox.classList.remove("hidden", "success", "error");
  if (isSoloGame(gameState)) {
    els.submitStatus.textContent = t("scoringNow");
    return;
  }

  els.resultBox.classList.add("success");
  els.resultBox.textContent = t("answersSent");
});

setLang(getLang());
renderAvatars();
applyStaticText();
setAppPhase("lobby");
if (isOnline()) ensureOnlineSocket();
