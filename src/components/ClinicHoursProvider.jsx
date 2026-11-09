import { useEffect, useMemo, useState } from "react";
import { openingSchedule, buildHours } from "../data/content.js";
import { ClinicHoursContext } from "../lib/clinic-hours-context.js";
import { LIVE, getClinicHours } from "../lib/booking.js";

// The first render always uses the built-in schedule, so the prerendered HTML and the hydrated page match.
// After mount, the dashboard's schedule (if the API is connected and returns a valid one) replaces it.
export default function ClinicHoursProvider({ children }) {
  const [schedule, setSchedule] = useState(openingSchedule);

  useEffect(() => {
    if (!LIVE) return undefined;
    const ctrl = new AbortController();
    getClinicHours(ctrl.signal)
      .then((live) => {
        if (live) setSchedule(live);
      })
      .catch(() => {
        /* keep the built-in hours */
      });
    return () => ctrl.abort();
  }, []);

  const value = useMemo(() => ({ schedule, ...buildHours(schedule) }), [schedule]);
  return <ClinicHoursContext.Provider value={value}>{children}</ClinicHoursContext.Provider>;
}
