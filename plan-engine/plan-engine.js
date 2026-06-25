/**
 * SpaceSort Plan Engine
 * 
 * Core intelligence module that takes user input (space type, dimensions, photo description)
 * and generates a custom organization plan with product recommendations.
 * 
 * Usage:
 *   const plan = generatePlan({ spaceType: 'closet', width: 6, depth: 2, ... });
 *   console.log(plan);
 */

// Product database import point (full-stack engineer to wire up)
// const products = require('../data/product-database.json');

const SPACE_CONFIGS = {
  closet: {
    labels: ['Closet', 'Closet / Wardrobe'],
    default_unit: 'feet',
    typical_width_range: [2, 10],
    typical_height: 8,
    product_categories: ['bins', 'hangers', 'shoe_organizers', 'shelves', 'labels', 'hooks', 'drawer_dividers', 'jewelry_organizers'],
    common_issues: ['Overcrowded hanging space', 'Shoes piled on floor', 'No drawer storage', 'Hard to find items'],
    zone_order: ['top_shelf', 'hanging_rod', 'drawer_unit', 'shoe_zone', 'floor'],
    tips: [
      'Use matching velvet hangers to save space and look uniform',
      'Store off-season items on the highest shelf in labeled bins',
      'Use clear shoe boxes so you can see what is inside without opening'
    ],
    default_budget_tiers: {
      budget: { min: 40, max: 100 },
      standard: { min: 100, max: 300 },
      premium: { min: 300, max: 800 }
    }
  },
  pantry: {
    labels: ['Pantry', 'Food Pantry'],
    default_unit: 'inches',
    typical_width_range: [18, 60],
    typical_height: 60,
    product_categories: ['bins', 'racks', 'shelves', 'labels', 'drawer_dividers', 'hooks'],
    common_issues: ['Cans and jars mixed together', 'Expired food hidden', 'Inaccessible back rows', 'No labeling'],
    zone_order: ['top_shelf', 'middle_shelf', 'can_storage', 'snack_zone', 'floor'],
    tips: [
      'Group similar items together: cans, jars, pasta, snacks',
      'Use tiered shelf inserts to see cans at the back',
      'Label everything with expiration dates visible',
      'Store bulky appliances on the floor or lowest shelf'
    ],
    default_budget_tiers: {
      budget: { min: 25, max: 75 },
      standard: { min: 75, max: 200 },
      premium: { min: 200, max: 400 }
    }
  },
  garage: {
    labels: ['Garage', 'Workshop'],
    default_unit: 'feet',
    typical_width_range: [8, 24],
    typical_height: 10,
    product_categories: ['shelves', 'bins', 'hooks', 'carts', 'labels', 'racks'],
    common_issues: ['Cluttered floor', 'Tools scattered', 'No designated zones', 'Seasonal items mixed'],
    zone_order: ['wall_storage', 'shelving_zone', 'tool_area', 'floor', 'overhead'],
    tips: [
      'Zone your garage: tools, sports, seasonal, automotive, gardening',
      'Use heavy-duty steel shelving for heavy items',
      'Wall-mount everything possible to reclaim floor space',
      'Clear bins make it easy to find hardware and small parts'
    ],
    default_budget_tiers: {
      budget: { min: 50, max: 150 },
      standard: { min: 150, max: 500 },
      premium: { min: 500, max: 1500 }
    }
  },
  home_office: {
    labels: ['Home Office', 'Office', 'Study'],
    default_unit: 'feet',
    typical_width_range: [4, 12],
    typical_height: 8,
    product_categories: ['drawer_dividers', 'wall_organizers', 'carts', 'bins', 'labels', 'shelves', 'hooks'],
    common_issues: ['Paper clutter on desk', 'Cables everywhere', 'No filing system', 'Supplies spread'],
    zone_order: ['desk_surface', 'drawers', 'shelving', 'wall', 'floor'],
    tips: [
      'Clear your desk of everything except daily essentials',
      'Use drawer dividers to separate pens, paper clips, sticky notes',
      'Install a pegboard or wall grid for vertical storage',
      'Label file folders and storage boxes clearly'
    ],
    default_budget_tiers: {
      budget: { min: 30, max: 100 },
      standard: { min: 100, max: 300 },
      premium: { min: 300, max: 700 }
    }
  },
  kids_room: {
    labels: ["Kid's Room", "Children's Room", 'Nursery', 'Playroom'],
    default_unit: 'feet',
    typical_width_range: [6, 14],
    typical_height: 8,
    product_categories: ['bins', 'shelves', 'hooks', 'carts', 'underbed_storage', 'labels', 'racks'],
    common_issues: ['Toys everywhere', 'No categorized storage', 'Too much stuff', 'Kids cannot reach'],
    zone_order: ['toy_storage', 'book_shelf', 'closet_zone', 'under_bed', 'wall'],
    tips: [
      'Use low, open bins so kids can access toys independently',
      'Label bins with pictures + words for pre-readers',
      'Rotate toys seasonally to keep the room fresh',
      'Use under-bed storage for out-of-season clothes',
      'Create a book nook with a low shelf'
    ],
    default_budget_tiers: {
      budget: { min: 30, max: 80 },
      standard: { min: 80, max: 250 },
      premium: { min: 250, max: 500 }
    }
  },
  bathroom: {
    labels: ['Bathroom', 'Powder Room'],
    default_unit: 'inches',
    typical_width_range: [36, 96],
    typical_height: 96,
    product_categories: ['drawer_dividers', 'bins', 'hooks', 'shelves', 'labels', 'wall_organizers'],
    common_issues: ['Cluttered countertop', 'Medicine cabinet overflow', 'Towels not organized', 'No space for toiletries'],
    zone_order: ['countertop', 'medicine_cabinet', 'under_sink', 'towel_storage', 'wall'],
    tips: [
      'Keep countertop to only 3 essentials: soap, toothbrush holder, lotion',
      'Use drawer dividers for makeup and toiletries',
      'Install over-the-toilet shelving for extra storage',
      'Use clear acrylic organizers for a clean, spa-like look'
    ],
    default_budget_tiers: {
      budget: { min: 20, max: 60 },
      standard: { min: 60, max: 150 },
      premium: { min: 150, max: 350 }
    }
  },
  laundry_room: {
    labels: ['Laundry Room', 'Utility Room'],
    default_unit: 'inches',
    typical_width_range: [36, 120],
    typical_height: 96,
    product_categories: ['racks', 'bins', 'shelves', 'hooks', 'carts', 'labels'],
    common_issues: ['Detergent bottles spread', 'No sorting system', 'Lost socks', 'Drying rack takes space'],
    zone_order: ['countertop', 'wall_cabinet', 'sorter', 'supply_storage', 'wall'],
    tips: [
      'Install a wall-mounted drying rack to save floor space',
      'Use a 3-bin rolling sorter for lights, darks, and delicates',
      'Store detergents and supplies in clear bins on shelves above',
      'Hang an ironing board on the wall or door'
    ],
    default_budget_tiers: {
      budget: { min: 25, max: 75 },
      standard: { min: 75, max: 200 },
      premium: { min: 200, max: 400 }
    }
  }
};

function getSpaceConfig(spaceType) {
  const key = Object.keys(SPACE_CONFIGS).find(k => 
    k === spaceType || SPACE_CONFIGS[k].labels.some(l => l.toLowerCase() === spaceType.toLowerCase())
  );
  return key ? SPACE_CONFIGS[key] : SPACE_CONFIGS.closet; // default to closet
}

function classifyBudget(spaceType, budget) {
  const config = getSpaceConfig(spaceType);
  const tiers = config.default_budget_tiers;
  if (budget <= tiers.budget.max) return 'budget';
  if (budget <= tiers.standard.max) return 'standard';
  return 'premium';
}

function recommendProducts(spaceType, budget, productDb, constraints) {
  const config = getSpaceConfig(spaceType);
  const budgetTier = classifyBudget(spaceType, budget);
  const relevantProducts = productDb.filter(p => 
    p.use_cases.includes(spaceType) && 
    (budgetTier === 'premium' || p.price <= budget * 0.3) // no single item > 30% of total budget
  );

  // Score and sort products
  const scored = relevantProducts.map(p => {
    let score = 0;
    // Prefer higher rated
    score += p.rating * 10;
    // Prefer products that match the primary categories for this space
    if (config.product_categories.includes(p.category)) score += 20;
    // Prefer cheaper within the budget tier
    score += Math.max(0, 50 - (p.price / budget) * 50);
    // Boost affiliate-eligible products
    if (p.affiliate_eligible) score += 5;
    return { ...p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Ensure we cover at least 3 different categories
  const selected = [];
  const categoriesUsed = new Set();

  // Pick best product from each relevant category
  const categoryGroups = {};
  for (const p of scored) {
    if (!categoryGroups[p.category]) categoryGroups[p.category] = [];
    categoryGroups[p.category].push(p);
  }

  const priorityCategories = config.product_categories.filter(c => categoryGroups[c]);
  for (const cat of priorityCategories) {
    if (selected.length >= 8) break;
    const bestInCat = categoryGroups[cat]?.[0];
    if (bestInCat) {
      selected.push(bestInCat);
      categoriesUsed.add(cat);
    }
  }

  // Fill remaining slots with top-scored items not yet selected
  for (const p of scored) {
    if (selected.length >= 8) break;
    if (!selected.find(s => s.id === p.id)) {
      selected.push(p);
      categoriesUsed.add(p.category);
    }
  }

  return {
    products: selected,
    categories_used: Array.from(categoriesUsed),
    total_estimated_cost: selected.reduce((sum, p) => sum + p.price, 0)
  };
}

function generateSpaceDiagram(spaceType, dimensions) {
  const config = getSpaceConfig(spaceType);
  const width = dimensions.width || 6;
  const depth = dimensions.depth || 2;
  const height = dimensions.height || config.typical_height;

  const diagram = {
    layout_type: `${spaceType}_plan_view`,
    dimensions: { width, depth, height },
    zones: config.zone_order.map((zone, index) => ({
      zone,
      percentage_of_space: Math.round(100 / config.zone_order.length),
      type: zone === 'hanging_rod' ? 'hanging' : zone.includes('shelf') ? 'shelf' : 'storage',
      recommended_products: []
    })),
    // Simple text/ASCII diagram for now - full-stack can enhance with SVG
    ascii_plan: generateAsciiDiagram(spaceType, width, depth, config.zone_order)
  };

  return diagram;
}

function generateAsciiDiagram(spaceType, width, depth, zones) {
  // Simple schematic representation
  const wall = '━'.repeat(Math.max(20, Math.round(width * 4)));
  const side = '┃';
  const lines = [
    `┏${wall}┓`,
    `┃  ${spaceType.replace('_', ' ').toUpperCase()}  PLAN  ┃`,
    `┃${' '.repeat(Math.max(18, Math.round(width * 4) - 2))}┃`
  ];

  for (let i = 0; i < Math.min(zones.length, 5); i++) {
    const label = zones[i].replace('_', ' ');
    const padding = Math.max(1, Math.round(width * 4) - label.length - 4);
    lines.push(`┃  ${label}${' '.repeat(padding)}┃`);
  }

  lines.push(`┃${' '.repeat(Math.max(18, Math.round(width * 4) - 2))}┃`);
  lines.push(`┗${wall}┛`);
  lines.push(`  Width: ${width} ${width > 3 ? 'ft' : 'in'} | Depth: ${depth} ${depth > 3 ? 'ft' : 'in'}`);

  return lines.join('\n');
}

function generateAssemblyNotes(spaceType, products) {
  const notes = [
    '1. Clear the space completely before starting.',
    '2. Sort all items into categories: keep, donate, trash, relocate.',
    '3. Measure your space carefully before assembling any furniture.',
  ];

  const hasShelves = products.some(p => p.category === 'shelves');
  const hasHooks = products.some(p => p.category === 'hooks');
  const hasLabels = products.some(p => p.category === 'labels');

  if (hasShelves) {
    notes.push('4. Assemble shelves on the floor first, then stand them upright.');
    notes.push('5. Use a stud finder before anchoring shelves to walls.');
  }
  if (hasHooks) {
    notes.push('6. Wipe wall surface clean before applying adhesive hooks — wait 1 hour before hanging.');
  }
  if (hasLabels) {
    notes.push('7. Create your labels last, after everything is placed. This way you label what you actually store.');
  }

  notes.push('8. Step back and admire your organized space! Share your SpaceSort makeover on social media.');

  return notes;
}

function estimateTime(spaceType, productCount) {
  const baseHours = { closet: 3, pantry: 2, garage: 5, home_office: 2, kids_room: 3, bathroom: 1.5, laundry_room: 1.5 };
  const hours = (baseHours[spaceType] || 2) + (productCount * 0.25);
  return `${Math.ceil(hours)} hours`;
}

/**
 * Main plan generation function
 * @param {Object} input - User input
 * @param {string} input.spaceType - Type of space (closet, pantry, garage, home_office, kids_room, bathroom, laundry_room)
 * @param {number} input.width - Width of space
 * @param {number} [input.depth] - Depth of space
 * @param {number} [input.height] - Height of space
 * @param {number} input.budget - Total budget in dollars
 * @param {string} [input.style] - Preferred style (modern, minimal, rustic, etc.)
 * @param {string} [input.detail_level] - 'basic' or 'detailed'
 * @param {Array} [input.special_requirements] - Array of special needs
 * @param {Array} productDb - Array of product objects from product database
 * @returns {Object} Complete organization plan
 */
function generatePlan(input, productDb) {
  const config = getSpaceConfig(input.spaceType);
  const width = input.width || config.typical_width_range[0];
  const depth = input.depth || 2;
  const height = input.height || config.typical_height;
  const budget = input.budget || config.default_budget_tiers.standard.min;
  const style = input.style || 'modern';
  const isDetailed = input.detail_level !== 'basic';

  // Step 1: Analyze the space
  const recommendations = recommendProducts(input.spaceType, budget, productDb, {
    width, depth, height, style
  });

  // Step 2: Generate floor plan diagram
  const diagram = generateSpaceDiagram(input.spaceType, { width, depth, height });

  // Step 3: Assign products to zones
  const zoneAssignments = config.zone_order.map((zone, i) => {
    const assignedProducts = recommendations.products.filter((_, pi) => pi % config.zone_order.length === i);
    return {
      zone,
      products: assignedProducts.map(p => ({
        name: p.name,
        brand: p.brand,
        price: p.price,
        retailer: p.retailer,
        url: p.url,
        image: p.image,
        category: p.category
      })),
      instructions: getZoneInstructions(input.spaceType, zone)
    };
  });

  // Step 4: Build complete plan
  const plan = {
    plan_id: `plan-${Date.now()}`,
    generated_at: new Date().toISOString(),
    title: `${config.labels[0]} Organization Plan`,
    summary: `Custom ${config.labels[0].toLowerCase()} organization plan for a ${width}' × ${depth}' × ${height}' space on a $${budget} budget.`,
    
    space: {
      type: input.spaceType,
      dimensions: { width, depth, height },
      style_preference: style,
      estimated_time: estimateTime(input.spaceType, recommendations.products.length)
    },

    diagram: diagram,

    budget_tier: classifyBudget(input.spaceType, budget),
    budget_summary: {
      total_budget: budget,
      estimated_cost: recommendations.total_estimated_cost,
      remaining: budget - recommendations.total_estimated_cost
    },

    zones: zoneAssignments,

    shopping_list: recommendations.products.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      retailer: p.retailer,
      price: p.price,
      url: p.url,
      quantity: 1,
      affiliate_eligible: p.affiliate_eligible,
      rating: p.rating
    })),

    assembly_instructions: generateAssemblyNotes(input.spaceType, recommendations.products),

    organizing_tips: config.tips,

    retailer_breakdown: (() => {
      const breakdown = {};
      for (const p of recommendations.products) {
        if (!breakdown[p.retailer]) breakdown[p.retailer] = { count: 0, total: 0 };
        breakdown[p.retailer].count++;
        breakdown[p.retailer].total += p.price;
      }
      return breakdown;
    })()
  };

  if (isDetailed) {
    // Add space assessment section for detailed plans
    plan.space_assessment = {
      common_issues: config.common_issues,
      notes: generateAssessmentNotes(input),
      recommended_zone_sequence: config.zone_order
    };
  }

  return plan;
}

function getZoneInstructions(spaceType, zone) {
  const instructions = {
    closet: {
      top_shelf: 'Store off-season clothes and accessories in labeled bins',
      hanging_rod: 'Group by garment type (shirts, pants, dresses), then by color',
      drawer_unit: 'Use drawer dividers for folded clothes and accessories',
      shoe_zone: 'Stack shoe boxes or use an angled shoe rack',
      floor: 'Keep floor clear — store shoes, baskets, or a laundry hamper'
    },
    pantry: {
      top_shelf: 'Store lightweight, rarely-used items like party supplies',
      middle_shelf: 'Everyday items: canned goods, pasta, sauces at eye level',
      can_storage: 'Use tiered can dispensers for easy access',
      snack_zone: 'Dedicated zone for snacks, granola bars, and kids lunch items',
      floor: 'Heavy items like bulk drinks, pet food, or small appliances'
    },
    garage: {
      wall_storage: 'Install pegboard or wall rails for tools and equipment',
      shelving_zone: 'Heavy-duty shelves for bins of seasonal items and supplies',
      tool_area: 'Dedicated zone for power tools with a charging station',
      floor: 'Parking zone — keep clear for vehicles and large equipment',
      overhead: 'Overhead storage racks for bulky, lightweight items'
    },
    home_office: {
      desk_surface: 'Keep only your monitor, keyboard, and one personal item',
      drawers: 'Use dividers to separate pens, cables, sticky notes, and files',
      shelving: 'Shelf for reference books, binders, and decorative boxes',
      wall: 'Pegboard or grid for frequently used tools and supplies',
      floor: 'Filing cabinet, trash can, and small safe'
    },
    kids_room: {
      toy_storage: 'Low, open bins for toys — labeled with pictures',
      book_shelf: 'Low bookshelf with forward-facing book display',
      closet_zone: 'Adjustable closet rod lowered for child access',
      under_bed: 'Roll-out bins for out-of-season clothes and extra bedding',
      wall: 'Wall hooks for backpacks, robes, and dress-up clothes'
    },
    bathroom: {
      countertop: 'Limit to soap dispenser, toothbrush holder, and small plant',
      medicine_cabinet: 'Group by frequency of use — daily in front',
      under_sink: 'Stackable drawers or tiered shelves for cleaning supplies',
      towel_storage: 'Roll towels for a spa-like display',
      wall: 'Over-the-toilet shelving or wall-mounted cabinet'
    },
    laundry_room: {
      countertop: 'Folding station — keep clear for sorting',
      wall_cabinet: 'Detergent, dryer sheets, stain removers in labeled bins',
      sorter: '3-bin hamper for lights, darks, and delicates',
      supply_storage: 'Extra supplies in clear labeled bins',
      wall: 'Wall-mounted drying rack and ironing board'
    }
  };

  return instructions[spaceType]?.[zone] || `Organize this ${zone.replace('_', ' ')} zone`;
}

function generateAssessmentNotes(input) {
  const notes = [];
  
  if (input.special_requirements) {
    if (input.special_requirements.includes('kids')) {
      notes.push('Consider child-safe, low-height storage solutions for easy access.');
      notes.push('Use rounded-edge bins to prevent injuries.');
    }
    if (input.special_requirements.includes('elderly') || input.special_requirements.includes('accessibility')) {
      notes.push('Prioritize easy-reach zones at 24-48 inches height.');
      notes.push('Use pull-out drawers rather than deep shelves.');
    }
    if (input.special_requirements.includes('rental')) {
      notes.push('Use damage-free Command hooks and removable adhesive solutions.');
      notes.push('Avoid drilling into walls where possible.');
    }
  }

  return notes;
}

// Export for Node.js or bundler
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generatePlan,
    getSpaceConfig,
    SPACE_CONFIGS,
    classifyBudget,
    recommendProducts
  };
}