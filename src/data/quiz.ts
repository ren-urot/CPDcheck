import type { QuizQuestion } from "../types";

export const quizQuestions: Record<string, QuizQuestion[]> = {
  "1": [
    {
      id: "q1",
      question: "Under the current ethical framework, what is the primary obligation of a financial advisor?",
      options: [
        "Maximise client returns at all costs",
        "Act in the best interests of the client",
        "Follow employer instructions without question",
        "Minimise regulatory reporting obligations",
      ],
      correct: 1,
      explanation: "The best interests duty requires advisors to prioritise the client's interests above their own.",
    },
    {
      id: "q2",
      question: "Which of the following is NOT a core principle of the FASEA Code of Ethics?",
      options: ["Trustworthy", "Profitable", "Competent", "Respectful"],
      correct: 1,
      explanation: "The FASEA Code of Ethics includes: Trustworthy, Competent, Honest, Fair, Diligent and Respectful. Profitability is not a code principle.",
    },
    {
      id: "q3",
      question: "A client asks you to recommend a product that pays higher commissions but is not in their best interest. What should you do?",
      options: [
        "Recommend the product if the client insists",
        "Decline and recommend the most appropriate product",
        "Recommend the product but document the client's request",
        "Refer the client to another advisor",
      ],
      correct: 1,
      explanation: "Advisors must always act in the client's best interests regardless of commission structures.",
    },
  ],
  "2": [
    {
      id: "q1",
      question: "What is the maximum number of members allowed in an SMSF?",
      options: ["2", "4", "6", "8"],
      correct: 2,
      explanation: "As of 1 July 2021, the maximum number of SMSF members was increased from 4 to 6.",
    },
    {
      id: "q2",
      question: "SMSF trustees must ensure the fund operates for what sole purpose?",
      options: ["Tax minimisation", "Provision of retirement benefits", "Wealth accumulation", "Asset protection"],
      correct: 1,
      explanation: "The sole purpose test requires that an SMSF is maintained for the sole purpose of providing retirement benefits to members.",
    },
  ],
  "4": [
    {
      id: "q1",
      question: "What is the most effective way to confirm client understanding during a meeting?",
      options: [
        "Ask yes/no questions",
        "Use open-ended questions and summarise responses",
        "Send a follow-up email after the meeting",
        "Provide a written statement of advice",
      ],
      correct: 1,
      explanation: "Open-ended questions encourage clients to express their understanding in their own words, which is the most reliable confirmation method.",
    },
  ],
  "6": [
    {
      id: "q1",
      question: "Which retirement income strategy involves drawing down principal over a set period?",
      options: [
        "Account-based pension",
        "Defined benefit pension",
        "Life annuity",
        "Transition to retirement income stream",
      ],
      correct: 0,
      explanation: "An account-based pension draws down accumulated superannuation balance (including principal) over the member's retirement.",
    },
    {
      id: "q2",
      question: "What is the minimum annual drawdown rate for an account-based pension for a person aged 65-74?",
      options: ["2.5%", "4%", "5%", "6%"],
      correct: 2,
      explanation: "The standard minimum drawdown rate for ages 65-74 is 5% per annum (temporarily reduced rates may apply in some years).",
    },
  ],
};
