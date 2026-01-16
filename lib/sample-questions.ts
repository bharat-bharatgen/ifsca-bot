/**
 * Sample questions for IFSCA Regulatory Assistant
 * Generated from source documents covering FinTech, Ancillary Services, and related regulations
 */

export const SAMPLE_QUESTIONS = [
  // Fees & Registration (4)
  {
    id: 1,
    category: 'Fees & Registration',
    question: 'What are the fees for registering as an Ancillary Service Provider in IFSC?',
  },
  {
    id: 2,
    category: 'Fees & Registration',
    question: 'What is the application fee for FinTech Entity authorization?',
  },
  {
    id: 3,
    category: 'Fees & Registration',
    question: 'What documents are required for Ancillary Service Provider registration?',
  },
  {
    id: 4,
    category: 'Fees & Registration',
    question: 'What is the minimum owned fund requirement for Finance Companies in IFSC?',
  },

  // FinTech Grants & Incentives (4)
  {
    id: 5,
    category: 'Grants & Incentives',
    question: 'What is the maximum grant amount available under the FinTech Start-up Grant?',
  },
  {
    id: 6,
    category: 'Grants & Incentives',
    question: 'What are the eligibility criteria for the Proof of Concept (PoC) Grant?',
  },
  {
    id: 7,
    category: 'Grants & Incentives',
    question: 'What expenses can be reimbursed under the FinTech Incentive Scheme?',
  },
  {
    id: 8,
    category: 'Grants & Incentives',
    question: 'What is the Green FinTech Grant and how much funding is available?',
  },

  // Permitted Activities (3)
  {
    id: 9,
    category: 'Permitted Activities',
    question: 'What business activities can Ancillary Service Providers undertake in IFSC?',
  },
  {
    id: 10,
    category: 'Permitted Activities',
    question: 'What is the difference between TechFin and FinTech services?',
  },
  {
    id: 11,
    category: 'Permitted Activities',
    question: 'What services fall under Fund Administration in IFSC?',
  },

  // Sandbox & Authorization (3)
  {
    id: 12,
    category: 'Sandbox & Authorization',
    question: 'What is the difference between Regulatory Sandbox and Innovation Sandbox?',
  },
  {
    id: 13,
    category: 'Sandbox & Authorization',
    question: 'How long can a FinTech entity operate in the Regulatory Sandbox?',
  },
  {
    id: 14,
    category: 'Sandbox & Authorization',
    question: 'What are the requirements for FinTech Entity authorization in IFSC?',
  },

  // Compliance & Currency (3)
  {
    id: 15,
    category: 'Compliance & Currency',
    question: 'What currencies can IFSC entities transact in?',
  },
  {
    id: 16,
    category: 'Compliance & Currency',
    question: 'What are the KYC and AML requirements for entities in IFSC?',
  },
  {
    id: 17,
    category: 'Compliance & Currency',
    question: 'Can IFSC entities maintain INR accounts for administrative expenses?',
  },

  // Entity Structure (3)
  {
    id: 18,
    category: 'Entity Structure',
    question: 'What are the options for setting up an entity in GIFT IFSC?',
  },
  {
    id: 19,
    category: 'Entity Structure',
    question: 'What are the tax benefits available for units in IFSC?',
  },
  {
    id: 20,
    category: 'Entity Structure',
    question: 'What is a Global/Regional Corporate Treasury Centre and its requirements?',
  },
];

/**
 * Get random questions from the sample set
 */
export function getRandomQuestions(count: number = 4): typeof SAMPLE_QUESTIONS {
  const shuffled = [...SAMPLE_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
