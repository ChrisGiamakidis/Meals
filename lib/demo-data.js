const crypto = require("node:crypto");

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${hash}`;
}

export const demoPasswordHash = createPasswordHash("demo1234");

export const demoUsers = [
  {
    displayName: "Ava Stone",
    email: "ava@example.com",
    bio: "Home cook sharing cozy soups and weekend bakes.",
  },
  {
    displayName: "Marco Chen",
    email: "marco@example.com",
    bio: "Street food hunter and pasta enthusiast.",
  },
  {
    displayName: "Leila Khan",
    email: "leila@example.com",
    bio: "Always chasing spicy dishes and new flavors.",
  },
];

export const demoPosts = [
  {
    seedKey: "welcome-ava",
    userEmail: "ava@example.com",
    title: "Slow Sunday ramen at home",
    cuisine: "Japanese",
    body: "I tried a miso broth with roasted mushrooms and a jammy egg. The key was simmering the broth slowly and finishing with chili oil.",
  },
  {
    seedKey: "welcome-marco",
    userEmail: "marco@example.com",
    title: "Late-night taco crawl",
    cuisine: "Mexican",
    body: "Best tacos I had this week were al pastor with pineapple salsa. The balance of sweet, smoky, and acid was perfect.",
  },
  {
    seedKey: "welcome-leila",
    userEmail: "leila@example.com",
    title: "Spice market discovery",
    cuisine: "Middle Eastern",
    body: "Picked up sumac, za'atar, and preserved lemon at the market. My next dinner is going to be built around those flavors.",
  },
];
