import { createContext, useContext } from "react";
import { openingSchedule, buildHours } from "../data/content.js";

// Clinic opening hours. Defaults to the schedule built into the site (so prerendered pages and visitors without
// the API still see correct hours); ClinicHoursProvider swaps in the dashboard's "Website Clinic Timing" when it loads.
export const ClinicHoursContext = createContext({ schedule: openingSchedule, ...buildHours(openingSchedule) });

export const useClinicHours = () => useContext(ClinicHoursContext);
