export const DEFAULT_GYM_NAME = "GYM NAME";

export const getActiveGymStorageKey = (ownerId: string) =>
  `mygympal-active-gym-${ownerId}`;