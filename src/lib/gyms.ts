export const DEFAULT_GYM_NAME = "GYM NAME";

export const getActiveGymStorageKey = (ownerId: string) =>
  `mygympal-active-gym-${ownerId}`;

export function resolveActiveGym<T extends { id: string }>(gyms: T[], storedId: string | null) {
  return gyms.find((gym) => gym.id === storedId) ?? gyms[0] ?? null;
}