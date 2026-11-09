import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppointmentContext } from "../lib/appointment-context.js";

// Every "Book an Appointment" button (header, home, contact) goes to the online booking page.
export default function AppointmentProvider({ children }) {
  const navigate = useNavigate();
  const openAppointment = useCallback(() => navigate("/book"), [navigate]);
  const value = useMemo(() => ({ openAppointment }), [openAppointment]);
  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>;
}
