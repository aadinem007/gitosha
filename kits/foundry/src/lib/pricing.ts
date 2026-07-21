export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "₹999",
    cadence: "/month",
    amountPaise: 99900,
    description: "For solo builders validating a first product.",
    features: ["1 seat", "Core features", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹2,999",
    cadence: "/month",
    amountPaise: 299900,
    description: "For teams with paying customers.",
    features: ["5 seats", "Priority support", "Exports"],
    highlight: true,
  },
] as const;
