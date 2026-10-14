// Medical certificate offering — single source for the page, the contact form and SEO.
// Prices are in euro. Edit here and it flows everywhere.

export const CERTIFICATE_REASON = "Need a Medical Certificate";
// One fixed fee for every certificate type.
export const CERTIFICATE_PRICE = 50;
// Short note shown beside the price: every certificate needs a visit to the clinic.
export const CERTIFICATE_VISIT_NOTE = "In-clinic examination required";

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

export const certificateOptions = [
  ...certificates.map((c) => ({ id: c.id, label: c.title, price: c.price })),
  { id: "other", label: "Other / Not sure", price: null },
];

export const certificateSteps = [
  {
    title: "Visit the clinic",
    text: "Come to Kildare Clinic during opening hours and tell the team which certificate you need.",
  },
  {
    title: "Be examined by the doctor",
    text: "A GP will examine you in person and assess whether a certificate is applicable in your case.",
  },
  {
    title: "Receive your certificate",
    text: "If a certificate is applicable, the doctor will issue it to you.",
  },
];

export const certificateIncluded = [
  "Certificates for short-term, minor illness",
  "Travel fitness certificates, where clinically appropriate",
  "Examined in person and issued by Irish-registered GPs",
];

export const certificateNotIncluded = [
  "Backdated (retrospective) certificates",
  "Certificates without an in-person examination",
  "Long-term illness or detailed medical reports",
];

export const certificateWhen = [
  "Many employers ask for a certificate after a couple of days off sick.",
  "Colleges and schools may need one to excuse an absence.",
  "Airlines, tour operators and insurers can ask for written proof of fitness or inability to travel.",
];

export const certificateFaqs = [
  {
    question: "How do I get a medical certificate?",
    answer:
      "You need to visit Kildare Clinic in person. The doctor will examine you and, if a certificate is applicable in your case, will issue it to you.",
  },
  {
    question: "How much does a medical certificate cost?",
    answer:
      `All medical certificates cost €${CERTIFICATE_PRICE}.`,
  },
  {
    question: "Will I definitely get a certificate?",
    answer:
      "Certificates are only issued where the doctor considers it clinically appropriate. If a certificate can't be issued, the doctor will explain why.",
  },
  {
    question: "Who examines me?",
    answer:
      "You will be seen by an Irish-registered GP at Kildare Clinic, who will examine you and decide whether a certificate is applicable.",
  },
  {
    question: "Can I get a backdated certificate?",
    answer:
      "No. We can't issue backdated certificates. A certificate can only be issued after the doctor has examined you in person at the clinic.",
  },
];
