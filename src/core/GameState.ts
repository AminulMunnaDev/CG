import type { RoleId } from "../data/roles";

// Shared state between scenes.
export const state: { role: RoleId | null } = { role: null };