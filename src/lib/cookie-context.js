import { createContext, useContext } from "react";

export const CookieContext = createContext(null);

export function useCookieConsent() {
  return useContext(CookieContext);
}
