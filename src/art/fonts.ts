export const FONT_BN = "'Noto Sans Bengali','Hind Siliguri','Kalpurush','Nirmala UI',sans-serif";
export const FONT_TITLE = "'Galada','Noto Sans Bengali','Nirmala UI',sans-serif";

// Waits for web fonts (max 2.5s) so pre-rendered Bangla signboards use them.
export async function loadFonts(): Promise<void> {
  if (!("fonts" in document)) return;
  const jobs = [
    document.fonts.load("800 40px 'Noto Sans Bengali'", "ছিনতাই"),
    document.fonts.load("400 40px 'Galada'", "ছিনতাই"),
  ];
  await Promise.race([Promise.allSettled(jobs), new Promise((r) => setTimeout(r, 2500))]);
}
