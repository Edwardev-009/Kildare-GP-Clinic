import { createContext, useContext } from "react";

// Lets any button (header, home, contact page) open the appointment form.
export const AppointmentContext = createContext({ openAppointment: () => {} });

export function useAppointment() {
  return useContext(AppointmentContext);
}
