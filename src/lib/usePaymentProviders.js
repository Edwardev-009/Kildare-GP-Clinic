import { useEffect, useState } from "react";
import { getPaymentProviders } from "./booking.js";

// Which payment methods to offer. Asked once per page load. Until the answer arrives only the card option is shown
// (so a method that is switched off is never clickable); if the question fails, both are offered as before.
let cached = null;

export default function usePaymentProviders() {
  const [providers, setProviders] = useState(cached || ["stripe"]);

  useEffect(() => {
    if (cached) return undefined;
    const controller = new AbortController();
    getPaymentProviders(controller.signal)
      .then((list) => {
        cached = list.length ? list : ["stripe"];
        setProviders(cached);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        cached = ["stripe"];
        setProviders(cached);
      });
    return () => controller.abort();
  }, []);

  return providers;
}