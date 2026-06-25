/**
 * Quick test to verify the plan engine works correctly
 */
const path = require('path');

// Load product database
const productDb = require('../data/product-database.json');

// Load plan engine
const { generatePlan, getSpaceConfig, classifyBudget } = require('./plan-engine');

// Test 1: Basic plan generation
console.log('=== TEST 1: Standard Closet Plan ===');
try {
  const plan = generatePlan({
    spaceType: 'closet',
    width: 6,
    depth: 2,
    height: 8,
    budget: 200,
    style: 'modern',
    detail_level: 'detailed'
  }, productDb.products);

  console.log('✓ Plan generated successfully');
  console.log('  Title:', plan.title);
  console.log('  Items recommended:', plan.shopping_list.length);
  console.log('  Estimated cost:', plan.budget_summary.estimated_cost);
  console.log('  Budget tier:', plan.budget_tier);
  console.log('  Retailers:', Object.keys(plan.retailer_breakdown).join(', '));
} catch (e) {
  console.log('✗ Closet plan failed:', e.message);
}

// Test 2: Pantry plan (budget)
console.log('\n=== TEST 2: Budget Pantry Plan ===');
try {
  const plan = generatePlan({
    spaceType: 'pantry',
    width: 30,
    depth: 12,
    height: 60,
    budget: 75,
    detail_level: 'basic'
  }, productDb.products);

  console.log('✓ Pantry plan generated successfully');
  console.log('  Items recommended:', plan.shopping_list.length);
  console.log('  Estimated cost:', plan.budget_summary.estimated_cost);
  console.log('  Budget tier:', plan.budget_tier);
} catch (e) {
  console.log('✗ Pantry plan failed:', e.message);
}

// Test 3: Garage (premium budget)
console.log('\n=== TEST 3: Premium Garage Plan ===');
try {
  const plan = generatePlan({
    spaceType: 'garage',
    width: 12,
    depth: 8,
    height: 10,
    budget: 800,
    style: 'heavy-duty',
    detail_level: 'detailed'
  }, productDb.products);

  console.log('✓ Garage plan generated successfully');
  console.log('  Items recommended:', plan.shopping_list.length);
  console.log('  Estimated cost:', plan.budget_summary.estimated_cost);
  console.log('  Budget tier:', plan.budget_tier);
  console.log('  Zones defined:', plan.zones.length);
  console.log('  Assembly steps:', plan.assembly_instructions.length);
} catch (e) {
  console.log('✗ Garage plan failed:', e.message);
}

// Test 4: Space config lookup
console.log('\n=== TEST 4: Space Config Lookup ===');
try {
  const config = getSpaceConfig('kids_room');
  console.log('✓ Kids room config found');
  console.log('  Labels:', config.labels.join(', '));
  console.log('  Product categories:', config.product_categories.join(', '));
  console.log('  Tips count:', config.tips.length);
} catch (e) {
  console.log('✗ Config lookup failed:', e.message);
}

// Test 5: Budget classification
console.log('\n=== TEST 5: Budget Classification ===');
try {
  console.log('  Closet $75 ->', classifyBudget('closet', 75));
  console.log('  Closet $200 ->', classifyBudget('closet', 200));
  console.log('  Garage $100 ->', classifyBudget('garage', 100));
  console.log('  Garage $400 ->', classifyBudget('garage', 400));
  console.log('  Garage $1200 ->', classifyBudget('garage', 1200));
} catch (e) {
  console.log('✗ Budget classification failed:', e.message);
}

console.log('\n=== ALL TESTS COMPLETE ===');