import { useCallback, useMemo, useState } from "react";
import AppointmentModal from "./AppointmentModal.jsx";
import { AppointmentContext } from "../lib/appointment-context.js";

// Keeps the appointment form's open/closed state in one place. The form is only
// rendered while open, so nothing extra is prerendered or shipped to the HTML.
export default function AppointmentProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openAppointment = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ openAppointment }), [openAppointment]);

  return (
    <AppointmentContext.Provider value={value}>
      {children}
      {open && <AppointmentModal onClose={close} />}
    </AppointmentContext.Provider>
  );
}
