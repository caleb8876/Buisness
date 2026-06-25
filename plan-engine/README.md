# SpaceSort Plan Engine

The core AI intelligence behind SpaceSort. This engine takes user input about a messy space and generates a complete custom organization plan with product recommendations, layout diagram, and assembly instructions.

## Files

| File | Description |
|------|-------------|
| `plan-engine.js` | The main engine — generates plans from space descriptions |
| `sample-output.js` | Sample output (run with `node` to see example plans) |

## How It Works

1. **Space Analysis** — User provides space type, dimensions, budget, and optional style
2. **Product Matching** — Engine scores and selects products from the database by relevance, rating, and budget fit
3. **Zone Planning** — Each space type has a defined zone order (e.g., top shelf → hanging rod → shoes → floor)
4. **Diagram Generation** — A text-based floor plan is generated showing zone layout
5. **Shopping List** — All recommended products are compiled with prices, retailers, and affiliate links

## API

```js
const { generatePlan } = require('./plan-engine');
const plan = generatePlan({
  spaceType: 'closet',       // closet | pantry | garage | home_office | kids_room | bathroom | laundry_room
  width: 6,                  // in feet (or inches for smaller spaces)
  depth: 2,                  // in same unit as width
  height: 8,                 // in same unit as width
  budget: 200,               // total budget in USD
  style: 'modern',           // modern | minimal | rustic | heavy-duty
  detail_level: 'detailed',  // basic or detailed
  special_requirements: ['rental']  // kids | elderly | accessibility | rental
}, productDatabase.products);
```

## Product Database Structure

Products should be stored in a JSON array with this schema:

```json
{
  "id": "unique-id",
  "name": "Product Name",
  "brand": "Brand",
  "category": "bins|shelves|hangers|labels|drawer_dividers|racks|hooks|carts|shoe_organizers|jewelry_organizers|underbed_storage|wall_organizers",
  "retailer": "amazon|ikea|target|container_store",
  "url": "https://...",
  "price": 19.99,
  "description": "Short description",
  "use_cases": ["closet", "pantry"],
  "specs": { ... },
  "affiliate_eligible": true,
  "rating": 4.5
}
```

## Plan Output Schema

The `generatePlan` function returns:

```
{
  plan_id,        // unique ID
  title,          // e.g. "Closet Organization Plan"
  summary,        // one-line summary
  space:          // space type & dimensions
  diagram:        // layout diagram (zones + ASCII)
  budget_tier,    // "budget" | "standard" | "premium"
  budget_summary, // total, estimated cost, remaining
  zones: [{       // zone assignments with product recs
    zone, products[], instructions
  }],
  shopping_list: [{ // full product details with affiliate links
    id, name, brand, category, retailer, price, url, affiliate_eligible, rating
  }],
  assembly_instructions: [],  // step-by-step
  organizing_tips: [],
  retailer_breakdown: {},     // count + total per retailer
  space_assessment: {}        // (detailed mode only)
}
```

## Budget Tiers (by space type)

| Space | Budget | Standard | Premium |
|-------|--------|----------|---------|
| Closet | $40-100 | $100-300 | $300-800 |
| Pantry | $25-75 | $75-200 | $200-400 |
| Garage | $50-150 | $150-500 | $500-1,500 |
| Home Office | $30-100 | $100-300 | $300-700 |
| Kid's Room | $30-80 | $80-250 | $250-500 |
| Bathroom | $20-60 | $60-150 | $150-350 |
| Laundry Room | $25-75 | $75-200 | $200-400 |

## Integration Guide for Full-Stack Engineer

1. Import `plan-engine.js` into the Node.js backend
2. Wire up the `product-database.json` file (served from `/data/` directory)
3. Create API endpoints that accept space descriptions and return plan JSON
4. Render plans in React using the schema above
5. Affiliate links in `shopping_list[].url` should be wrapped with the SpaceSort affiliate tag