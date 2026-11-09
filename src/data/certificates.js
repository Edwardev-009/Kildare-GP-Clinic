// Medical certificate offering — single source for the page, the contact form and SEO.
// Prices are in euro. Edit here and it flows everywhere.

export const CERTIFICATE_REASON = "Need a Medical Certificate";
// One fixed fee for every certificate type.
export const CERTIFICATE_PRICE = 30;
// Short note shown beside the price: certificates are handled online, no clinic visit.
export const CERTIFICATE_ONLINE_NOTE = "Online, no clinic visit";
// Turnaround promised on the page (the doctor's call comes first).
export const CERTIFICATE_TURNAROUND = "within 1–2 hours";

export const certificates = [
  {
    id: "sick",
    title: "Sick Certificate",
    price: CERTIFICATE_PRICE,
    icon: "Thermometer",
    summary:
      "An official note from a GP confirming you're unwell and unfit for work or study, for short-term minor illness.",
    points: [
      "For minor illness such as colds, flu, stomach bugs or migraine",
      "Accepted by employers, colleges and schools",
      "Number of days is decided by the doctor",
    ],
  },
  {
    id: "unfit-travel",
    title: "Unfit for Travel Certificate",
    price: CERTIFICATE_PRICE,
    icon: "PlaneTakeoff",
    summary:
      "A GP certificate stating you are medically unfit to travel, commonly needed for airline, hotel or travel insurance claims.",
    points: [
      "Useful when illness forces you to cancel or postpone a trip",
      "Supports travel insurance and booking claims",
      "Issued only where clinically appropriate",
    ],
  },
  {
    id: "fit-travel",
    title: "Fit to Travel Certificate",
    price: CERTIFICATE_PRICE,
    icon: "PlaneLanding",
    summary:
      "A GP certificate confirming you are medically fit to travel, for airlines, tour operators or insurers that ask for one.",
    points: [
      "For travellers who need written confirmation of fitness",
      "Helpful after illness, during pregnancy or with a managed condition",
      "Issued only where clinically appropriate",
    ],
  },
  {
    id: "return-to-work",
    title: "Return-to-Work / Fit for Work Certificate",
    price: CERTIFICATE_PRICE,
    icon: "BriefcaseMedical",
    summary:
      "A GP certificate confirming you have recovered and are fit to return to work or study.",
    points: [
      "For employers who need confirmation after a period of illness",
      "Confirms you are fit to resume your normal duties",
      "Doctor verifies your recovery before issuing",
    ],
  },
];

export const certificateSteps = [
  {
    title: "Request and pay online",
    text: "Choose your certificate, fill in a short form and pay securely by card or PayPal. There is no need to visit the clinic.",
  },
  {
    title: "A doctor calls you",
    text: "One of our Irish-registered GPs phones you to ask a few questions about the reason for your certificate.",
  },
  {
    title: "Receive your certificate",
    text: `If a certificate is appropriate, it is sent to you by email or WhatsApp ${CERTIFICATE_TURNAROUND}.`,
  },
];

export const certificateIncluded = [
  "Certificates for short-term, minor illness",
  "Travel fitness certificates, where clinically appropriate",
  "A phone consultation with an Irish-registered GP",
  "Your certificate sent by email or WhatsApp",
];

export const certificateNotIncluded = [
  "Backdated (retrospective) certificates",
  "Certificates the doctor decides are not clinically appropriate (you are refunded)",
  "Long-term illness or detailed medical reports",
];

export const certificateWhen = [
  "Many employers ask for a certificate after a couple of days off sick.",
  "Colleges and schools may need one to excuse an absence.",
  "Airlines, tour operators and insurers can ask for written proof of fitness or inability to travel.",
];

export const certificateFaqs = [
  {
    question: "Can I get a medical certificate online in Ireland?",
    answer:
      `Yes. Request your certificate on this page, pay online and a Kildare Clinic GP will phone you. If a certificate is appropriate, it is sent to you ${CERTIFICATE_TURNAROUND} by email or WhatsApp. You do not need to visit the clinic.`,
  },
  {
    question: "Do I need to visit the clinic?",
    answer:
      "No. The whole process is online and by phone. The doctor speaks to you by phone instead of seeing you in person.",
  },
  {
    question: "How much does an online medical certificate cost?",
    answer:
      `Every medical certificate costs €${CERTIFICATE_PRICE}, paid online by card or PayPal when you make the request.`,
  },
  {
    question: "How long does it take to get my certificate?",
    answer:
      `The doctor calls you after your payment, and an approved certificate is sent ${CERTIFICATE_TURNAROUND}, during clinic opening hours.`,
  },
  {
    question: "Will I definitely get a certificate?",
    answer:
      "Certificates are only issued where the doctor considers it clinically appropriate. If a certificate can't be issued, the doctor will explain why and you will be refunded in full.",
  },
  {
    question: "Can I get a backdated certificate?",
    answer:
      "No. We can't issue backdated certificates.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Yes. Payment is taken on the secure pages of Stripe (card, Apple Pay, Google Pay) or PayPal. Kildare Clinic never sees or stores your card details.",
  },
];

export const certificateOptions = [
  ...certificates.map((c) => ({ id: c.id, label: c.title, price: c.price })),
  { id: "other", label: "Other / Not sure", price: null },
];
