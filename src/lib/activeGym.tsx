import { createContext, useContext } from "react";

const ActiveGymContext = createContext<string | null>(null);

export const ActiveGymProvider = ActiveGymContext.Provider;

export function useActiveGymId() {
  return useContext(ActiveGymContext);
}