// Central place for clinic details so every page stays in sync.
// Update names, hours or copy here — it flows through the whole site.

export const clinic = {
  name: "Kildare Clinic",
  tagline: "Your Health, Our Priority",
  strapline: "Local care for a healthier Kildare",
  address: "Claregate Street, Kildare, R51 P635",
  phone: "085 867 8192",
  phoneHref: "tel:+353858678192",
  whatsappNumber: "353858678192",
  email: "info@kildaredoc.ie",
  website: "www.kildaredoc.ie",
};

export const whatsappLink = (message) =>
  `https://wa.me/${clinic.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const hours = [
  { day: "Monday", time: "9:00 AM – 5:00 PM" },
  { day: "Tuesday", time: "9:00 AM – 5:00 PM" },
  { day: "Wednesday", time: "9:00 AM – 5:00 PM" },
  { day: "Thursday", time: "9:00 AM – 5:00 PM" },
  { day: "Friday", time: "9:00 AM – 5:00 PM" },
  { day: "Saturday", time: "9:00 AM – 2:00 PM" },
  { day: "Sunday", time: "9:00 AM – 2:00 PM" },
];

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
    title: "Vaccinations & Travel Advice",
    text: "Seasonal flu jabs, routine immunisations and pre-travel consultations before you head abroad.",
    icon: "Syringe",
  },
  {
    title: "Chronic Disease Management",
    text: "Ongoing monitoring and support for diabetes, blood pressure, asthma and other long-term conditions.",
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
  { name: "Dr. Aoife Byrne", role: "Lead General Practitioner" },
  { name: "Dr. Niall Fitzgerald", role: "General Practitioner" },
  { name: "Maria Kelly", role: "Practice Nurse" },
  { name: "Sarah O'Connor", role: "Clinic Manager" },
  { name: "David Murphy", role: "Patient Coordinator" },
  { name: "Emma Walsh", role: "Receptionist" },
];

export const testimonials = [
  {
    quote:
      "I was seen within twenty minutes on a walk-in visit — no fuss, and the doctor actually took the time to listen.",
    name: "Ciara N.",
    detail: "Kildare town",
  },
  {
    quote:
      "Booked my travel vaccinations a week before a trip and the whole visit took less than half an hour.",
    name: "Padraig L.",
    detail: "Newbridge",
  },
  {
    quote:
      "My father's blood pressure is checked here every month. Same nurse each time, which makes a real difference.",
    name: "Órla M.",
    detail: "Kildare town",
  },
  {
    quote:
      "Easiest GP visit I've had in years — messaged on WhatsApp, walked in an hour later, sorted.",
    name: "Tomás R.",
    detail: "Monasterevin",
  },
];

export const faqs = [
  {
    question: "Do I need an appointment to see a GP at Kildare Clinic?",
    answer:
      "No — Kildare Clinic is a walk-in practice, open seven days a week. You're welcome to arrive without booking and you'll be seen in the order you arrive. We also take booked appointments for visits that suit planning ahead, such as travel vaccinations.",
  },
  {
    question: "What are Kildare Clinic's opening hours?",
    answer:
      "We're open Monday to Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 1:00 PM. We're closed on Sundays.",
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
