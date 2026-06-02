export interface Question {
  id: string;
  topic: string;
  prompt: string;
  choices: string[];
  answer: number; // index into choices
  explanation: string;
}

/**
 * Seed question set. In production these are served from Supabase (the admin
 * panel manages hundreds across topics); this representative set ships so the
 * quiz works before the DB is connected.
 */
export const QUESTIONS: Question[] = [
  {
    id: "q-ethics-1",
    topic: "Ethics",
    prompt:
      "Under the CFA Standards, a member who receives material non-public information must:",
    choices: [
      "Trade only for clients, not personally",
      "Not act or cause others to act on it",
      "Disclose it to all clients simultaneously",
      "Wait 24 hours before trading",
    ],
    answer: 1,
    explanation:
      "Standard II(A) Material Nonpublic Information prohibits acting or causing others to act on such information.",
  },
  {
    id: "q-quant-1",
    topic: "Quantitative Methods",
    prompt:
      "An investment grows from £100 to £121 over two years. The compound annual growth rate is closest to:",
    choices: ["10.0%", "10.5%", "21.0%", "11.0%"],
    answer: 0,
    explanation: "(121/100)^(1/2) − 1 = 1.21^0.5 − 1 = 1.10 − 1 = 10.0%.",
  },
  {
    id: "q-econ-1",
    topic: "Economics",
    prompt: "All else equal, an increase in the policy rate most likely causes the domestic currency to:",
    choices: ["Depreciate", "Appreciate", "Remain unchanged", "Become non-convertible"],
    answer: 1,
    explanation:
      "Higher rates attract capital inflows, increasing demand for the currency and causing appreciation.",
  },
  {
    id: "q-fra-1",
    topic: "Financial Reporting",
    prompt:
      "Under IFRS, interest paid may be classified in the cash flow statement as:",
    choices: [
      "Operating or financing",
      "Investing only",
      "Operating only",
      "Financing only",
    ],
    answer: 0,
    explanation:
      "IFRS allows interest paid to be classified as either operating or financing; US GAAP requires operating.",
  },
  {
    id: "q-equity-1",
    topic: "Equity",
    prompt:
      "A stock with a required return of 10% and a constant dividend growth of 4% pays a £2 dividend next year. Its value (Gordon growth) is closest to:",
    choices: ["£20", "£33", "£50", "£14"],
    answer: 1,
    explanation: "P = D1 / (r − g) = 2 / (0.10 − 0.04) = 2 / 0.06 ≈ £33.33.",
  },
  {
    id: "q-fi-1",
    topic: "Fixed Income",
    prompt: "The price of an option-free bond and its yield to maturity are:",
    choices: [
      "Positively related",
      "Inversely related",
      "Unrelated",
      "Equal at par only",
    ],
    answer: 1,
    explanation: "Bond prices fall as yields rise — they are inversely related.",
  },
  {
    id: "q-deriv-1",
    topic: "Derivatives",
    prompt: "At initiation, the value of a forward contract to both parties is typically:",
    choices: ["Positive to the long", "Zero", "Positive to the short", "Equal to the premium"],
    answer: 1,
    explanation:
      "Forwards have zero value at initiation (no premium changes hands); value accrues as the price moves.",
  },
  {
    id: "q-pm-1",
    topic: "Portfolio Management",
    prompt: "Adding an asset with low correlation to a portfolio most likely:",
    choices: [
      "Increases total risk",
      "Reduces diversification",
      "Reduces portfolio risk for a given return",
      "Has no effect",
    ],
    answer: 2,
    explanation:
      "Low-correlation assets improve the risk/return trade-off, reducing portfolio variance.",
  },
  {
    id: "q-alt-1",
    topic: "Alternatives",
    prompt: "Compared with traditional investments, hedge funds typically have:",
    choices: [
      "Higher liquidity",
      "Lower fees",
      "Higher fees and lower liquidity",
      "Daily redemption",
    ],
    answer: 2,
    explanation: "Hedge funds generally charge higher (often 2/20) fees with lock-ups and gates.",
  },
  {
    id: "q-quant-2",
    topic: "Quantitative Methods",
    prompt: "The probability of at least one head in two fair coin tosses is:",
    choices: ["25%", "50%", "75%", "100%"],
    answer: 2,
    explanation: "1 − P(no heads) = 1 − (0.5 × 0.5) = 1 − 0.25 = 75%.",
  },
];

export const TOPICS = Array.from(new Set(QUESTIONS.map((q) => q.topic)));
