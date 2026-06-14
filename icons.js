const AVATARS = [
  "cat",
  "dog",
  "rabbit",
  "bird",
  "fish",
  "bug",
  "squirrel",
  "turtle",
  "butterfly",
  "fox",
  "panda",
  "lion",
  "frog",
  "unicorn",
  "octopus",
  "owl",
];

const AVATAR_ICONS = {
  cat: "lucide:cat",
  dog: "lucide:dog",
  rabbit: "lucide:rabbit",
  bird: "lucide:bird",
  fish: "lucide:fish",
  bug: "lucide:bug",
  squirrel: "lucide:squirrel",
  turtle: "lucide:turtle",
  butterfly: "lucide:butterfly",
  fox: "mdi:fox",
  panda: "mdi:panda",
  lion: "mdi:cat",
  frog: "mdi:frog",
  unicorn: "mdi:unicorn-variant",
  octopus: "mdi:octopus",
  owl: "mdi:owl",
};

const ICONS = {
  name: "lucide:user",
  city: "lucide:building-2",
  country: "lucide:globe-2",
  animal: "lucide:paw-print",
  plant: "lucide:leaf",
  food: "lucide:apple",
  thing: "lucide:package",
  note: "lucide:file-text",
  star: "lucide:star",
  zap: "lucide:zap",
  target: "lucide:target",
  school: "lucide:school",
  trophy: "lucide:trophy",
  soundOn: "lucide:volume-2",
  soundOff: "lucide:volume-x",
  hint: "lucide:lightbulb",
  check: "lucide:check",
  checkCircle: "lucide:circle-check",
  home: "lucide:house",
  offline: "lucide:smartphone",
  online: "lucide:wifi",
  book: "lucide:book-open",
  pencil: "lucide:pencil",
  dice: "lucide:dice-5",
  party: "lucide:party-popper",
  user: "lucide:user-round",
  crown: "lucide:crown",
};

const LEGACY_AVATARS = {
  "🦊": "fox",
  "🐼": "panda",
  "🦁": "lion",
  "🐸": "frog",
  "🦄": "unicorn",
  "🐙": "octopus",
  "🦋": "butterfly",
  "🐯": "lion",
  "🐨": "panda",
  "🐰": "rabbit",
  "🐶": "dog",
  "🐱": "cat",
  "🐻": "panda",
  "🐵": "cat",
  "🐧": "bird",
  "🦉": "owl",
};

function resolveIcon(icon) {
  if (!icon) return ICONS.user;
  if (String(icon).includes(":")) return icon;
  return ICONS[icon] || AVATAR_ICONS[icon] || icon;
}

function normalizeAvatarId(id) {
  if (!id) return AVATARS[0];
  if (AVATARS.includes(id)) return id;
  if (LEGACY_AVATARS[id]) return LEGACY_AVATARS[id];
  return AVATARS[0];
}

function renderIcon(icon, className = "icon") {
  const name = resolveIcon(icon);
  return `<iconify-icon icon="${name}" class="${className}" aria-hidden="true"></iconify-icon>`;
}

function renderAvatar(avatarId, className = "icon") {
  const id = normalizeAvatarId(avatarId);
  return renderIcon(AVATAR_ICONS[id] || AVATAR_ICONS.cat, className);
}

function setIcon(el, icon) {
  if (!el) return;
  el.innerHTML = renderIcon(icon, el.dataset.iconClass || "icon");
}

function setAvatar(el, avatarId) {
  if (!el) return;
  el.innerHTML = renderAvatar(avatarId, el.dataset.iconClass || "icon");
}

if (typeof module !== "undefined") {
  module.exports = { AVATARS, AVATAR_ICONS, ICONS, normalizeAvatarId };
}
