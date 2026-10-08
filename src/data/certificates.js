// Medical certificate offering — single source for the page, the contact form and SEO.
// Prices are in euro. Edit here and it flows everywhere.

export const CERTIFICATE_REASON = "Need a Medical Certificate";
export const CERTIFICATE_TURNAROUND = "Within 5 hours";

export const certificates = [
  {
    id: "sick",
    title: "Sick Certificate",
    price: 30,
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
    price: 40,
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
    price: 40,
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
    price: 30,
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
    title: "Send your request",
    text: "Choose your certificate and fill in a short form with your details and what you need it for.",
  },
  {
    title: "Pay and speak to the doctor",
    text: "We email you a secure payment link, and one of our GPs calls you to verify your request.",
  },
  {
    title: "Receive your certificate",
    text: "Once approved, your certificate is issued and sent to you securely by email.",
  },
];

export const certificateIncluded = [
  "Certificates for short-term, minor illness",
  "Travel fitness certificates, where clinically appropriate",
  "Reviewed and issued by Irish-registered GPs",
];

export const certificateNotIncluded = [
  "Backdated (retrospective) certificates",
  "Certificates that need a physical examination",
  "Long-term illness or detailed medical reports",
];

export const certificateWhen = [
  "Many employers ask for a certificate after a couple of days off sick.",
  "Colleges and schools may need one to excuse an absence.",
  "Airlines, tour operators and insurers can ask for written proof of fitness or inability to travel.",
];

export const certificateFaqs = [
  {
    question: "How quickly will I receive my medical certificate?",
    answer:
      "Certificates are issued within 5 hours once the doctor has verified your request. You'll first receive a payment link by email, and a GP will call you to verify your details.",
  },
  {
    question: "How much does a medical certificate cost?",
    answer:
      "Sick and Return-to-Work certificates cost €30. Unfit for Travel and Fit to Travel certificates cost €40.",
  },
  {
    question: "Will I definitely get a certificate?",
    answer:
      "Certificates are only issued where the doctor considers it clinically appropriate. If a certificate can't be issued, the doctor will explain why and, where needed, advise you to be seen in person.",
  },
  {
    question: "Who reviews my request?",
    answer:
      "Every request is reviewed by an Irish-registered GP at Kildare Clinic, who will call you to verify your request before a certificate is issued.",
  },
  {
    question: "Can I get a backdated certificate?",
    answer:
      "No. We can't issue backdated certificates, or certificates that require a physical examination. For those, please visit the clinic during opening hours.",
  },
];
