import { clinic, team } from "./content.js";

export const physioPath = "/physiotherapy";
export const physiotherapist = team.find((member) => member.role === "Physiotherapist");
export const physioDescription = `Physiotherapy with ${physiotherapist.name} at ${clinic.name} on Claregate Street, Kildare Town. Call the clinic to discuss your needs and arrange a physio appointment.`;

export const physioSteps = [
  { title: "Tell us what you need", text: "Call or WhatsApp the clinic to ask about physiotherapy. Let us know whether this is your first visit or a follow-up, and confirm an appointment time before travelling." },
  { title: "Prepare for your visit", text: "Bring a list of current medicines and any relevant referral letters or reports you already have. Wear comfortable clothing that allows you to move and discuss any access needs when booking." },
  { title: "Discuss a plan", text: "A physiotherapy visit may include a conversation about your symptoms, an assessment of movement and advice about next steps. Your plan depends on your individual needs and the assessment." },
];

export const physioFaqs = [
  { question: "Where can I find a physio in Kildare Town?", answer: `Kildare Clinic offers physiotherapy with ${physiotherapist.name} at ${clinic.address}. Call ${clinic.phone} to discuss your needs and arrange an appointment.` },
  { question: "How do I book a physiotherapy appointment?", answer: `Call ${clinic.phone} or WhatsApp Kildare Clinic. Confirm your appointment before travelling. The clinic's walk-in GP service does not mean a physio slot is immediately available.` },
  { question: "Are physiotherapy hours the same as the clinic's hours?", answer: "Yes. Physiotherapy uses the same opening hours shown on this page. Contact the clinic to confirm an available appointment within those hours." },
  { question: "Do I need a GP referral for physiotherapy?", answer: "Contact the clinic to confirm what is needed for your visit. If you have a referral letter or relevant reports, bring them with you. Referral requirements for an insurance claim should be checked with your insurer." },
  { question: "How much does a physio appointment cost?", answer: "Contact the clinic to confirm the fee before booking. Ask whether the fee is for an initial assessment or a follow-up visit, and check any insurance requirements with your insurer." },
];

export const physioArticle = {
  path: "/blog/kildare-physio-first-appointment",
  tag: "Physiotherapy",
  title: "Kildare physio: a guide to your first appointment",
  description: "Looking for a physio in Kildare? Learn how to prepare for your first appointment, what to ask and how to contact Kildare Clinic on Claregate Street.",
  excerpt: "A practical guide to choosing a physiotherapy appointment, preparing for your visit and asking the right questions at Kildare Clinic.",
  date: "9 October 2026",
  datePublished: "2026-10-09",
  sections: [
    {
      id: "finding-a-physio",
      title: "Finding a physio in Kildare Town",
      paragraphs: [
        "When you are looking for a Kildare physio, the most useful first step is to explain what you need help with and ask whether the service is suitable for you. Location matters, but so do appointment availability, the clinician's experience with your concern and a clear explanation of what a first visit involves.",
        `Kildare Clinic is on Claregate Street, Kildare Town, ${clinic.structuredAddress.postalCode}. Our team includes ${physiotherapist.name}, our physiotherapist, alongside our GPs. Contact reception to discuss a physiotherapy appointment; you can also ask which type of consultation to arrange if you are unsure.`,
      ],
    },
    {
      id: "physio-or-gp",
      title: "Should I arrange physiotherapy or see a GP?",
      paragraphs: [
        "Physiotherapy focuses on movement and physical function. An assessment can help a clinician understand how a problem affects everyday activities and discuss an appropriate plan. The right starting point depends on your symptoms and medical history.",
        "For back pain, HSE guidance says to contact a GP if it is not improving after a few weeks, interferes with everyday activities, is very severe or is worsening. A GP may refer you to a physiotherapist or specialist. If symptoms need urgent attention, do not wait for a routine physiotherapy appointment. See the linked HSE guidance for signs that need urgent assessment.",
      ],
    },
    {
      id: "before-you-book",
      title: "Questions to ask before booking",
      paragraphs: [
        "A short call can make your first visit easier to plan. Describe your concern, how long it has been present and whether you have already seen a clinician. Ask about any particular service you need rather than assuming every physiotherapy clinic offers the same treatments.",
      ],
      items: [
        "Is this the right appointment for my concern, and who will I see?",
        "What times are available, and how long should I allow for the visit?",
        "What is the fee for an initial assessment and for follow-up visits?",
        "Should I bring a referral letter, medical report or anything else?",
        "If I plan to claim through insurance, what must I confirm with my insurer?",
      ],
    },
    {
      id: "prepare-for-your-visit",
      title: "How to prepare for your first appointment",
      paragraphs: [
        "Think about what you would like to get back to doing, such as being comfortable at your desk, walking further or returning to an activity. Note when your symptoms began, what seems to affect them and which everyday tasks have become difficult. This gives you a useful starting point for the conversation.",
        "Bring your current medicine list and relevant reports or referral letters you already have. Comfortable clothing can make movement easier during an assessment. Tell reception about access needs or any questions about the visit when booking, so they can advise you before you arrive.",
      ],
    },
    {
      id: "during-the-appointment",
      title: "What might happen during the appointment?",
      paragraphs: [
        "The clinician may ask about your concern, health history and goals, and assess how you move. They can explain their findings and discuss the next steps with you. Advice, exercises or follow-up appointments depend on the assessment; a first visit does not come with a guaranteed treatment or recovery time.",
        "Before you leave, ask what the plan means for your usual activities, how to follow any advice safely and when to seek a further review. If an exercise or instruction is unclear, ask for an explanation. Your own plan should guide you rather than a routine copied from a general article.",
      ],
    },
    {
      id: "plan-a-local-visit",
      title: "Plan your visit to Kildare Clinic",
      paragraphs: [
        `Call ${clinic.phone} or WhatsApp reception to arrange physiotherapy with ${physiotherapist.name}. Physio appointments use the clinic's shared opening hours, listed on our physiotherapy and contact pages. Confirm a time before travelling: the walk-in GP service does not guarantee an immediately available physio appointment.`,
      ],
    },
  ],
  sources: [
    { title: "HSE: Back pain — when to contact a GP", url: "https://www2.hse.ie/conditions/back-pain/" },
  ],
};
