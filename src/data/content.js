// Central place for clinic details so every page stays in sync.
// Update names, hours or copy here — it flows through the whole site.

const clinicAddress = {
  streetAddress: "Claregate Street",
  addressLocality: "Kildare",
  postalCode: "R51 P635",
  addressCountry: "IE",
};

export const clinic = {
  name: "Kildare Clinic",
  tagline: "Your Health, Our Priority",
  strapline: "Local care for a healthier Kildare",
  address: `${clinicAddress.streetAddress}, ${clinicAddress.addressLocality}, ${clinicAddress.postalCode}`,
  structuredAddress: clinicAddress,
  phone: "085 867 8192",
  phoneHref: "tel:+353858678192",
  whatsappNumber: "353858678192",
  email: "info@kildaredoc.ie",
  website: "www.kildaredoc.ie",
};

export const whatsappLink = (message) =>
  `https://wa.me/${clinic.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const openingSchedule = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => ({
  day,
  sessions: index < 4 ? [{ opens: "10:00", closes: "14:00" }, { opens: "17:00", closes: "20:00" }] : [],
}));

export function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

export const hours = openingSchedule.map(({ day, sessions }) => ({
  day,
  time: sessions.length ? sessions.map(({ opens, closes }) => `${formatTime(opens)} – ${formatTime(closes)}`).join(" & ") : "OFF (For Now)",
  off: !sessions.length,
}));

const shiftHours = (index) => openingSchedule.map(({ day, sessions }) => ({
  day,
  time: sessions[index] ? `${formatTime(sessions[index].opens)} – ${formatTime(sessions[index].closes)}` : "OFF (For Now)",
  off: !sessions[index],
}));

export const hoursMorning = shiftHours(0);
export const hoursEvening = shiftHours(1);
export const hoursSummary = `Monday–Saturday: ${hours[0].time}. Sunday: closed for now.`;

export const services = [
  {
    title: "General Practice",
    text: "Everyday GP consultations for illness, injury and ongoing health concerns, with no appointment required.",
    icon: "Stethoscope",
  },
  {
    title: "Family Healthcare",
    text: "Care for every stage of life, from children's check-ups to health reviews for parents and grandparents.",
    icon: "Users",
  },
  {
    title: "Travel Advice",
    text: "Health guidance before you travel abroad, including advice on recommended vaccines, malaria prevention and precautions for your destination.",
    icon: "Plane",
  },
  {
    title: "Disease Management",
    text: "Ongoing monitoring and support for diabetes, blood pressure, asthma and other long-term conditions, with regular reviews to keep your health on track.",
    icon: "ClipboardCheck",
  },
  
];

export const process = [
  {
    step: "01",
    title: "Walk in or call ahead",
    text: "Come to Claregate Street during opening hours, or WhatsApp us to check waiting times before you travel.",
  },
  {
    step: "02",
    title: "Register at the desk",
    text: "Our front desk will take your details and let you know roughly how long the wait will be.",
  },
  {
    step: "03",
    title: "See the doctor",
    text: "A GP will see you in a private consultation room — no rushed five-minute slots.",
  },
  {
    step: "04",
    title: "Leave with a plan",
    text: "You'll leave with a clear next step, whether that's a prescription, referral or follow-up date.",
  },
];

export const team = [
  { name: "Dr. S.Rasool", role: "Lead General Practitioner" },
  { name: "Dr. Sania Batool", role: "General Practitioner" },
  { name: "Muqadas", role: "Physiotherapist" },
  // { name: "Sarah O'Connor", role: "Clinic Manager" },
  // { name: "David Murphy", role: "Patient Coordinator" },
  // { name: "Emma Walsh", role: "Receptionist" },
];

export const testimonials = [
  {
    name: "Bronwyn Redmond",
    text: "I went twice and highly recommend this GPs Practice. Absolutely excellent service! My regular GP is booked out 2 weeks in advance, I work and wanted to avoid KDOC and hospital ED. I reallly appreciated the walk-in service, weekend opening,.The receptionist is very welcoming and professional, the service efficient. I was particularly impressed with Dr Haidar, the medical assessment was very thorough, he explained his findings, diagnosis and gave the appropriate trestment, discussed plan going forward. He was caring, no corners were cut or prompts needed.",
  },
  {
    name: "Laura Keogh",
    text: "Such a great service to have. Was give time to attend once I called and was seen quickly. Dr Rasool is such an attentive, kind and caring doctor. Highly recommend.",
  },
  {
    name: "Aislinn Mcfadden",
    text: "Fantastic service for the community. I had a great experience , and met with a lovely doctor. Cheaper than my own GP or KDoc!",
  },
  {
    name: "Brigid O Driscoll",
    text: "Just been to visit the Doctors.\nThis is an excellent service, very friendly receptionist.\nThe Doctor is just so lovely he actually listens and talks to you.\nWould highly recommend.",
  },
  {
    name: "Maurice Whelan",
    text: "Really great service. Dr. Rasool was very welcoming and went through everything in great detail. Would highly recommend.",
  },
];

export const faqs = [
  {
    question: "Do I need an appointment to see a GP at Kildare Clinic?",
    answer:
      "No — Kildare Clinic is a walk-in practice. You're welcome to arrive without booking during opening hours and you'll be seen in the order you arrive. We also take booked appointments for visits that suit planning ahead, such as travel vaccinations.",
  },
  {
    question: "What are Kildare Clinic's opening hours?",
    answer:
      hoursSummary,
  },
  {
    question: "Where is Kildare Clinic located?",
    answer:
      "The clinic is on Claregate Street, Kildare, R51 P635 — look for the black and gold signage.",
  },
  {
    question: "Can I book a travel vaccination or flu jab?",
    answer:
      "Yes. Message us on WhatsApp or call the clinic to arrange a travel health consultation or seasonal flu vaccination, ideally a few weeks before you travel.",
  },
];

export const blogPosts = [
  {
    tag: "Seasonal Health",
    title: "Do you need the flu vaccine this year?",
    excerpt:
      "Flu season in Ireland typically runs from October to March. Here's who should prioritise a jab and when to get it done.",
    date: "September 2026",
    readTime: "4 min read",
  },
  {
    tag: "Travel Health",
    title: "Planning a trip abroad? Book your travel consultation early",
    excerpt:
      "Some travel vaccines need several weeks to take effect. We walk through what to check before you book flights.",
    date: "August 2026",
    readTime: "5 min read",
  },
  {
    tag: "Long-Term Conditions",
    title: "Living with high blood pressure: a practical guide",
    excerpt:
      "Small, consistent habits make the biggest difference to blood pressure readings over time. Here's where to start.",
    date: "August 2026",
    readTime: "6 min read",
  },
  {
    tag: "Clinic News",
    title: "Why we kept walk-in consultations when other clinics didn't",
    excerpt:
      "Booking systems work for some, but not everyone can plan illness in advance. Here's our reasoning for staying walk-in first.",
    date: "July 2026",
    readTime: "3 min read",
  },
  {
    tag: "Family Health",
    title: "A parent's checklist for childhood immunisations",
    excerpt:
      "A simple, age-by-age guide to Ireland's primary childhood immunisation schedule and what each one protects against.",
    date: "July 2026",
    readTime: "5 min read",
  },
  {
    tag: "Everyday Health",
    title: "When to see a GP versus when to wait it out",
    excerpt:
      "Not every symptom needs a same-day visit. A short guide to help you judge when it's worth walking in.",
    date: "June 2026",
    readTime: "4 min read",
  },
];
