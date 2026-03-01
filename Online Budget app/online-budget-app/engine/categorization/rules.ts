import type { PatternRule } from "./types";

/**
 * Pattern rules for rule-based transaction categorization.
 * Each rule maps a regex pattern to a category key (matching categories.key in DB).
 * Rules are tested in order — first match wins.
 * All patterns are case-insensitive.
 *
 * Category keys must match seeded values from migration 004_seed_system_categories.
 */
export const PATTERN_RULES: readonly PatternRule[] = [
  // ─── Food & Dining: Groceries ──────────────────────────────
  { pattern: /walmart|wal-mart/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.9 },
  { pattern: /whole\s*foods/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /costco|cost co/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.9 },
  { pattern: /kroger/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /safeway/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /trader\s*joe/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /aldi/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /publix/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /sobeys|loblaws|no\s*frills|metro\s*(?:inc|grocery)/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /tesco|sainsbury|asda|lidl|waitrose|morrisons/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /carrefour|leclerc|auchan/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /grocery|supermarket|supermarch/i, categoryKey: "groceries", parentKey: "food_dining", confidence: 0.85 },

  // ─── Food & Dining: Coffee ─────────────────────────────────
  { pattern: /starbucks/i, categoryKey: "coffee_shops", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /tim\s*horton/i, categoryKey: "coffee_shops", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /dunkin/i, categoryKey: "coffee_shops", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /second\s*cup|peet'?s\s*coffee|blue\s*bottle/i, categoryKey: "coffee_shops", parentKey: "food_dining", confidence: 0.95 },

  // ─── Food & Dining: Fast Food ──────────────────────────────
  { pattern: /mcdonald/i, categoryKey: "fast_food", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /burger\s*king/i, categoryKey: "fast_food", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /wendy'?s/i, categoryKey: "fast_food", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /subway/i, categoryKey: "fast_food", parentKey: "food_dining", confidence: 0.9 },
  { pattern: /taco\s*bell|chipotle|chick-?fil-?a|popeyes|kfc|pizza\s*hut/i, categoryKey: "fast_food", parentKey: "food_dining", confidence: 0.95 },

  // ─── Food & Dining: Delivery ───────────────────────────────
  { pattern: /uber\s*eats/i, categoryKey: "food_delivery", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /doordash|door\s*dash/i, categoryKey: "food_delivery", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /skip\s*the\s*dishes/i, categoryKey: "food_delivery", parentKey: "food_dining", confidence: 0.95 },
  { pattern: /grubhub|postmates|deliveroo|just\s*eat/i, categoryKey: "food_delivery", parentKey: "food_dining", confidence: 0.95 },

  // ─── Food & Dining: Restaurants ────────────────────────────
  { pattern: /restaurant|ristorante|bistro|brasserie|diner/i, categoryKey: "restaurants", parentKey: "food_dining", confidence: 0.85 },

  // ─── Transportation: Gas & Fuel ────────────────────────────
  { pattern: /shell\s*(?:oil|gas|station)?/i, categoryKey: "gas_fuel", parentKey: "transportation", confidence: 0.9 },
  { pattern: /exxon|mobil|chevron|bp\s|texaco|sunoco|marathon\s*petro/i, categoryKey: "gas_fuel", parentKey: "transportation", confidence: 0.95 },
  { pattern: /esso|petro-?can|husky|pioneer\s*gas/i, categoryKey: "gas_fuel", parentKey: "transportation", confidence: 0.95 },
  { pattern: /gas\s*station|fuel|petrol/i, categoryKey: "gas_fuel", parentKey: "transportation", confidence: 0.85 },

  // ─── Transportation: Public Transit ────────────────────────
  { pattern: /uber(?!\s*eats)/i, categoryKey: "public_transit", parentKey: "transportation", confidence: 0.9 },
  { pattern: /lyft/i, categoryKey: "public_transit", parentKey: "transportation", confidence: 0.95 },
  { pattern: /transit|metro\s*(?:card|pass|fare)|bus\s*pass|subway\s*fare/i, categoryKey: "public_transit", parentKey: "transportation", confidence: 0.9 },

  // ─── Transportation: Parking ───────────────────────────────
  { pattern: /parking|parkade|park\s*meter/i, categoryKey: "parking", parentKey: "transportation", confidence: 0.9 },

  // ─── Bills & Utilities ─────────────────────────────────────
  { pattern: /hydro|electric(?:ity)?.*(?:bill|util|power)/i, categoryKey: "electricity", parentKey: "bills_utilities", confidence: 0.9 },
  { pattern: /water\s*(?:bill|util)/i, categoryKey: "water", parentKey: "bills_utilities", confidence: 0.9 },
  { pattern: /comcast|xfinity|at&?t\s*internet|verizon\s*fios|rogers\s*internet|bell\s*internet|shaw/i, categoryKey: "internet", parentKey: "bills_utilities", confidence: 0.9 },
  { pattern: /t-?mobile|verizon\s*wireless|at&?t\s*wireless|rogers\s*wireless|bell\s*mobility|telus/i, categoryKey: "phone", parentKey: "bills_utilities", confidence: 0.9 },
  { pattern: /geico|state\s*farm|allstate|progressive|farmers\s*ins|intact|sun\s*life|manulife/i, categoryKey: "insurance", parentKey: "bills_utilities", confidence: 0.9 },

  // ─── Shopping: Clothing ────────────────────────────────────
  { pattern: /zara|h&m|gap\s|old\s*navy|uniqlo|nike|adidas|lululemon|nordstrom/i, categoryKey: "clothing", parentKey: "shopping", confidence: 0.9 },

  // ─── Shopping: Electronics ─────────────────────────────────
  { pattern: /apple\.com|apple\s*store|best\s*buy|micro\s*center|b&h\s*photo/i, categoryKey: "electronics", parentKey: "shopping", confidence: 0.9 },

  // ─── Shopping: Home Goods ──────────────────────────────────
  { pattern: /ikea|home\s*depot|lowe'?s|bed\s*bath|wayfair|pottery\s*barn/i, categoryKey: "home_goods", parentKey: "shopping", confidence: 0.9 },

  // ─── Shopping: Personal Care ───────────────────────────────
  { pattern: /sephora|ulta|bath\s*&\s*body/i, categoryKey: "personal_care", parentKey: "shopping", confidence: 0.9 },

  // ─── Shopping: General ─────────────────────────────────────
  { pattern: /amazon|amzn/i, categoryKey: "shopping", parentKey: "shopping", confidence: 0.85 },
  { pattern: /target/i, categoryKey: "shopping", parentKey: "shopping", confidence: 0.85 },
  { pattern: /ebay/i, categoryKey: "shopping", parentKey: "shopping", confidence: 0.85 },

  // ─── Entertainment: Streaming ──────────────────────────────
  { pattern: /netflix/i, categoryKey: "streaming", parentKey: "entertainment", confidence: 0.95 },
  { pattern: /spotify/i, categoryKey: "streaming", parentKey: "entertainment", confidence: 0.95 },
  { pattern: /apple\s*music|apple\s*tv|itunes/i, categoryKey: "streaming", parentKey: "entertainment", confidence: 0.95 },
  { pattern: /disney\s*\+|disneyplus|hulu|hbo\s*max|paramount|peacock|crave/i, categoryKey: "streaming", parentKey: "entertainment", confidence: 0.95 },
  { pattern: /youtube\s*(?:premium|music)/i, categoryKey: "streaming", parentKey: "entertainment", confidence: 0.95 },

  // ─── Entertainment: Games ──────────────────────────────────
  { pattern: /steam(?:games|powered)?|playstation|xbox|nintendo/i, categoryKey: "games", parentKey: "entertainment", confidence: 0.9 },

  // ─── Entertainment: Movies ─────────────────────────────────
  { pattern: /cineplex|amc\s*theat|regal\s*cinema|movie|cinema/i, categoryKey: "movies_theater", parentKey: "entertainment", confidence: 0.9 },

  // ─── Health & Fitness: Gym ─────────────────────────────────
  { pattern: /goodlife|planet\s*fitness|ymca|anytime\s*fitness|equinox|orangetheory/i, categoryKey: "gym_fitness", parentKey: "health_fitness", confidence: 0.95 },
  { pattern: /gym|fitness\s*(?:club|center)/i, categoryKey: "gym_fitness", parentKey: "health_fitness", confidence: 0.85 },

  // ─── Health & Fitness: Medical ─────────────────────────────
  { pattern: /pharmacy|cvs|walgreens|shoppers\s*drug|rexall|rite\s*aid/i, categoryKey: "pharmacy", parentKey: "health_fitness", confidence: 0.9 },
  { pattern: /doctor|medical|clinic|hospital|dentist|optometrist/i, categoryKey: "medical", parentKey: "health_fitness", confidence: 0.85 },

  // ─── Housing ───────────────────────────────────────────────
  { pattern: /rent\s*(?:payment|due)|landlord|property\s*mgmt/i, categoryKey: "rent_mortgage", parentKey: "housing", confidence: 0.9 },
  { pattern: /mortgage/i, categoryKey: "rent_mortgage", parentKey: "housing", confidence: 0.95 },

  // ─── Education ─────────────────────────────────────────────
  { pattern: /university|college|tuition/i, categoryKey: "tuition", parentKey: "education", confidence: 0.9 },
  { pattern: /udemy|coursera|skillshare|masterclass|linkedin\s*learning/i, categoryKey: "online_courses", parentKey: "education", confidence: 0.95 },

  // ─── Pets ──────────────────────────────────────────────────
  { pattern: /petsmart|petco|pet\s*valu/i, categoryKey: "pet_supplies", parentKey: "pets", confidence: 0.95 },
  { pattern: /veterinar|vet\s*clinic|animal\s*hospital/i, categoryKey: "veterinary", parentKey: "pets", confidence: 0.9 },

  // ─── Travel: Flights ───────────────────────────────────────
  { pattern: /air\s*canada|united\s*air|delta\s*air|american\s*air|southwest|westjet|ryanair|easyjet/i, categoryKey: "flights", parentKey: "travel", confidence: 0.95 },
  { pattern: /airline|airways|flight/i, categoryKey: "flights", parentKey: "travel", confidence: 0.85 },

  // ─── Travel: Hotels ────────────────────────────────────────
  { pattern: /marriott|hilton|hyatt|holiday\s*inn|airbnb|vrbo|booking\.com|expedia/i, categoryKey: "hotels_lodging", parentKey: "travel", confidence: 0.95 },
  { pattern: /hotel|motel|lodge|hostel/i, categoryKey: "hotels_lodging", parentKey: "travel", confidence: 0.85 },

  // ─── Miscellaneous: Donations ──────────────────────────────
  { pattern: /donation|charity|red\s*cross|united\s*way|gofundme/i, categoryKey: "donations", parentKey: "miscellaneous", confidence: 0.9 },

  // ─── Miscellaneous: Bank Fees ──────────────────────────────
  { pattern: /(?:bank|service|monthly|account)\s*fee|nsf\s*fee|overdraft/i, categoryKey: "bank_fees", parentKey: "miscellaneous", confidence: 0.9 },

  // ─── Income: Salary ────────────────────────────────────────
  { pattern: /payroll|salary|direct\s*dep|pay\s*cheque|paycheque|paycheck/i, categoryKey: "salary", parentKey: "income", confidence: 0.9 },

  // ─── Income: Freelance ─────────────────────────────────────
  { pattern: /freelance|contract\s*pay|invoice\s*pay/i, categoryKey: "freelance", parentKey: "income", confidence: 0.85 },

  // ─── Income: Investment ────────────────────────────────────
  { pattern: /dividend|interest\s*(?:income|earn|pay)/i, categoryKey: "investment_income", parentKey: "income", confidence: 0.9 },

  // ─── Transfers ─────────────────────────────────────────────
  { pattern: /transfer\s*(?:to|from|between)/i, categoryKey: "account_transfer", parentKey: "transfers", confidence: 0.9 },
  { pattern: /e-?transfer|interac\s*(?:send|recv)/i, categoryKey: "account_transfer", parentKey: "transfers", confidence: 0.9 },
  { pattern: /credit\s*card\s*payment|cc\s*payment/i, categoryKey: "credit_card_payment", parentKey: "transfers", confidence: 0.9 },
] as const;
