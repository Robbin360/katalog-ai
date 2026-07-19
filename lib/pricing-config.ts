export type PlanId = "free" | "pro" | "business";

export interface PricingPlan {
  id: PlanId;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  credits: number;
  description: string;
  capacity: string;
  renewal: string;
  cta: string;
  badge?: string;
  highlight: string;
  autoPilotBatch: string;
  brandRules: string;
  seats: string;
  features: string[];
}

export const PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "FREE",
    monthlyPrice: "$0",
    annualPrice: "$0",
    credits: 15,
    description: "Discover what's hurting your catalog. No credit card required.",
    capacity: "15 Credits",
    renewal: "Renews every month.",
    cta: "Start for free",
    highlight: "",
    autoPilotBatch: "N/A",
    brandRules: "None",
    seats: "1",
    features: [
      "15 AI credits per month",
      "SEO audit of your catalog",
      "Image and text search",
      "Up to 3 email reports",
      "No credit card required",
    ],
  },
  {
    id: "pro",
    name: "PRO",
    monthlyPrice: "$49",
    annualPrice: "$490",
    credits: 350,
    description: "AI-powered catalog optimization for your daily workflow.",
    capacity: "350 Credits",
    renewal: "Renews every month.",
    cta: "Get Pro",
    badge: "Recommended",
    highlight: "↳ Everything in Free, plus:",
    autoPilotBatch: "5 products/cycle",
    brandRules: "1 custom Brand Rule",
    seats: "Up to 3",
    features: [
      "Auto-Pilot (5 products per cycle)",
      "1 custom Brand Rule",
      "Up to 3 team seats",
      "Email support",
    ],
  },
  {
    id: "business",
    name: "BUSINESS",
    monthlyPrice: "$149",
    annualPrice: "$1490",
    credits: 800,
    description: "High-volume optimization with priority processing.",
    capacity: "800 Credits",
    renewal: "Renews every month.",
    cta: "Get Business",
    badge: "Lowest cost per credit",
    highlight: "↳ Everything in Pro, plus:",
    autoPilotBatch: "10 products/cycle",
    brandRules: "Unlimited Brand Rules",
    seats: "Up to 5",
    features: [
      "Auto-Pilot (10 products per cycle)",
      "Unlimited Brand Rules",
      "Priority processing queue",
      "Priority support",
    ],
  },
];

export function getPlan(id: PlanId): PricingPlan {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Plan ${id} not found`);
  return plan;
}

export const BUSINESS_CREDITS = 800;
export const PRO_CREDITS = 350;
export const FREE_CREDITS = 15;

export const EXTRA_CREDIT_COST = 0.25;
export const CREDIT_PACKS = [
  { price: 28, credits: 100, costPerCredit: 0.28 },
  { price: 130, credits: 500, costPerCredit: 0.26 },
  { price: 480, credits: 2000, costPerCredit: 0.24 },
];
