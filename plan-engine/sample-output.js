/**
 * Sample generated plan output
 * 
 * This is an example of what the plan engine outputs when a user submits
 * a space description. Created for the full-stack engineer to understand
 * the output format and build the UI around it.
 */

const { generatePlan } = require('./plan-engine');
const productDb = require('../data/product-database.json'); // Will need relative path fix

// Example 1: Walk-in closet
const closetPlan = generatePlan({
  spaceType: 'closet',
  width: 6,
  depth: 3,
  height: 8,
  budget: 250,
  style: 'modern',
  detail_level: 'detailed',
  special_requirements: []
}, productDb.products);

console.log('\n=== CLOSET PLAN SAMPLE ===');
console.log(JSON.stringify(closetPlan, null, 2));

// Example 2: Pantry
const pantryPlan = generatePlan({
  spaceType: 'pantry',
  width: 24,
  depth: 12,
  height: 60,
  budget: 100,
  style: 'minimal',
  detail_level: 'basic',
  special_requirements: ['rental']
}, productDb.products);

console.log('\n=== PANTRY PLAN SAMPLE ===');
console.log(JSON.stringify(pantryPlan, null, 2));

// Example 3: Garage
const garagePlan = generatePlan({
  spaceType: 'garage',
  width: 12,
  depth: 6,
  height: 10,
  budget: 400,
  style: 'heavy-duty',
  detail_level: 'detailed',
  special_requirements: []
}, productDb.products);

console.log('\n=== GARAGE PLAN SAMPLE ===');
console.log(JSON.stringify(garagePlan, null, 2));