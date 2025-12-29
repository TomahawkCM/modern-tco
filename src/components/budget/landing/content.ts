export const LANDING_CONTENT = {
  brand: {
    name: "BudgetPro",
    product: "Budget App",
  },
  hero: {
    badge: "Privacy-First • Local-Only • Zero Tracking",
    headline: "Master Your Money without Selling Your Data.",
    subhead:
      "The power of a spreadsheet. The simplicity of an app. Experience financial clarity with the only budget app that guarantees your data never leaves your device.",
    primaryCta: {
      label: "Start Local Protocol (Free)",
      href: "/budget-app/auth/signup",
    },
    secondaryCta: {
      label: "Log in",
      href: "/budget-app/auth/login",
    },
    finePrint: "No bank credentials required. No account needed for local mode.",
  },
  trust: [
    {
      title: "Your Device, Your Data",
      description: "Data stays in your browser's IndexedDB. We literally cannot see it.",
    },
    {
      title: "Spreadsheet Power",
      description: "Bulk edit, pivot, and analyze like a pro without the formula headaches.",
    },
    {
      title: "Offline Speed",
      description: "Zero latency. Works on a mountain top or in a subway tunnel.",
    },
    {
      title: "Manual Rituals",
      description: "Import wizard makes the Friday Money Review a satisfying habit.",
    },
  ],
  outcomes: [
    {
      title: "Stop Fighting Aggregators",
      description: "No more broken connections or re-auth loops. You control the data input.",
    },
    {
      title: "Privacy by Design",
      description: "We don't sell your data because we don't have it. Period.",
    },
    {
      title: "Future-Proof Planning",
      description: "Model retirement, loan payoffs, and savings goals in one integrated view.",
    },
    {
      title: "Subscription Killer",
      description: "Spot recurring drains on your wallet that other apps miss.",
    },
  ],
  features: [
    {
      title: "Local Dashboard",
      description: "Net worth, cash flow, and category breakdown. Instant load times.",
      href: "/budget-app",
    },
    {
      title: "Import Wizard",
      description: "Smart CSV mapper for BMO, Home Trust, and customizable custom formats.",
      href: "/budget-app/import",
    },
    {
      title: "Receipt OCR",
      description: "Scan receipts locally with Tesseract.js. No cloud processing.",
      href: "/budget-app/ocr",
    },
    {
      title: "Category Budgets",
      description: "Zero-based or rollover budgeting with granular category control.",
      href: "/budget-app/budgets",
    },
    {
      title: "Retirement Calculator",
      description: "Project your freedom date with compound interest visualizations.",
      href: "/budget-app/planning/retirement",
    },
    {
      title: "Privacy Shield",
      description: "Optional client-side encryption for an extra layer of security.",
      href: "/budget-app/settings",
    },
  ],
  howItWorks: [
    {
      title: "Import",
      description: "Drag & drop CSVs or scan receipts. AI maps the columns locally.",
    },
    {
      title: "Review",
      description: "Quick categorization with smart rules and bulk actions.",
    },
    {
      title: "Plan",
      description: "Assign every dollar a job and forecast your future net worth.",
    },
  ],
  pricing: {
    eyebrow: "Fair Pricing",
    title: "Local is Free. Sync is Pro.",
    description:
      "Start with the powerful Local Protocol. Upgrade later if you need multi-device sync.",
    priceLabel: "Free Forever",
    cta: {
      label: "Start Local Protocol",
      href: "/budget-app/auth/signup",
    },
    secondary: {
      label: "View Pro Features",
      href: "#pricing",
    },
    guarantee: "No credit card required for Local Protocol.",
  },
  faq: [
    {
      q: "Is my data really private?",
      a: "Yes. In Local Protocol, data never leaves your device. It lives in IndexedDB within your browser.",
    },
    {
      q: "How do I back up my data?",
      a: "You can export a full JSON backup at any time. We also recommend regular CSV exports.",
    },
    {
      q: "What is 'Sync' Pro?",
      a: "Coming soon: An optional subscription to sync encrypted data between devices via Supabase.",
    },
    {
      q: "Do you connect to banks?",
      a: "No. We believe manual import is safer, more reliable, and builds better financial awareness.",
    },
  ],
} as const;
