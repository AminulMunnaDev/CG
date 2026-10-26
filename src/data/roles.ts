export type RoleId = "commuter" | "rickshaw" | "police" | "thief" | "uncle";

export interface Role {
  id: RoleId;
  nameBn: string;
  nameEn: string;
  lines: [string, string]; // two short Bangla lines shown on the card
  color: string;           // card theme colour (#rrggbb)
  stats: { speed: number; aware: number; risk: number }; // 1..5
  badge?: string;
}

export const ROLES: Role[] = [
  {
    id: "commuter",
    nameBn: "যাত্রী",
    nameEn: "The Commuter",
    lines: ["ফোন-ব্যাগ সামলে বাড়ি ফেরো।", "সন্দেহজনক বাইক দেখলেই চিৎকার!"],
    color: "#2f6fd6",
    stats: { speed: 3, aware: 4, risk: 3 },
  },
  {
    id: "rickshaw",
    nameBn: "রিকশাচালক",
    nameEn: "The Rickshaw Puller",
    lines: ["প্যাডেল চালাও, যাত্রী বাঁচাও।", "ছিনতাইকারীকে পেছনে ফেলো!"],
    color: "#1f9d55",
    stats: { speed: 4, aware: 3, risk: 3 },
  },
  {
    id: "police",
    nameBn: "পুলিশ",
    nameEn: "The Police",
    lines: ["টহলে নামো, দ্রুত ধরো।", "ধরলে আবার জামিন—সামলাও!"],
    color: "#4a6a9c",
    stats: { speed: 3, aware: 5, risk: 2 },
  },
  {
    id: "thief",
    nameBn: "ছিনতাইকারী",
    nameEn: "The Snatcher",
    lines: ["ছোঁ মেরে পালাও, সময় কম!", "ধরা পড়লে জনতার হাতে..."],
    color: "#b3261e",
    stats: { speed: 5, aware: 2, risk: 5 },
    badge: "ঝুঁকিপূর্ণ",
  },
  {
    id: "uncle",
    nameBn: "চা-দোকানদার চাচা",
    nameEn: "The Tea-Stall Uncle",
    lines: ["সব দেখেন, কিছু বলেন না!", "কখন মুখ খুলবেন—তোমার হাতে।"],
    color: "#e08a1e",
    stats: { speed: 1, aware: 5, risk: 1 },
  },
];