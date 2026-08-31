/**
 * Data Quality Verification Script
 * Validates the 28-District Andhra Pradesh Master Dataset
 */

import { AP_STATE, AP_DISTRICTS_DATA, AP_ALL_MANDALS_FLAT } from '../src/data/andhraPradeshMasterData.js';

console.log('=====================================================');
console.log('🔍 ANDHRA PRADESH LOCATION MASTER DATA VALIDATION');
console.log('=====================================================');

let errors = 0;

// 1. Verify State
if (!AP_STATE || AP_STATE.name !== 'Andhra Pradesh' || AP_STATE.code !== 'AP') {
  console.error('❌ State validation failed: Invalid state configuration');
  errors++;
} else {
  console.log(`✓ State: ${AP_STATE.name} (${AP_STATE.code}), Country: ${AP_STATE.country}`);
}

// 2. Verify District Count
const districtCount = AP_DISTRICTS_DATA.length;
console.log(`✓ Total Districts: ${districtCount}`);
if (districtCount !== 28) {
  console.error(`❌ District count discrepancy: expected 28, found ${districtCount}`);
  errors++;
}

// 3. Verify Unique District Names & IDs
const districtNames = new Set();
const districtIds = new Set();
const districtCodes = new Set();

AP_DISTRICTS_DATA.forEach(d => {
  if (districtNames.has(d.name.toLowerCase())) {
    console.error(`❌ Duplicate district name: ${d.name}`);
    errors++;
  }
  districtNames.add(d.name.toLowerCase());

  if (districtIds.has(d.id)) {
    console.error(`❌ Duplicate district ID: ${d.id}`);
    errors++;
  }
  districtIds.add(d.id);

  if (districtCodes.has(d.code)) {
    console.error(`❌ Duplicate district code: ${d.code}`);
    errors++;
  }
  districtCodes.add(d.code);

  // Check mandal duplicates within district
  const mandalSet = new Set();
  d.mandals.forEach(m => {
    if (mandalSet.has(m.toLowerCase())) {
      console.error(`❌ Duplicate mandal in district "${d.name}": ${m}`);
      errors++;
    }
    mandalSet.add(m.toLowerCase());
  });
});

// 4. Verify Total Mandals
const totalMandals = AP_ALL_MANDALS_FLAT.length;
console.log(`✓ Total Verified Mandals Across All 28 Districts: ${totalMandals}`);

// 5. Check Orphan Mandals
AP_ALL_MANDALS_FLAT.forEach(m => {
  if (!districtIds.has(m.districtId)) {
    console.error(`❌ Orphan mandal found without valid districtId: ${m.name} (${m.districtId})`);
    errors++;
  }
});

// Summary breakdown table
console.log('\n--- District-wise Mandal Breakdown ---');
AP_DISTRICTS_DATA.forEach((d, idx) => {
  console.log(`${String(idx + 1).padStart(2, '0')}. ${d.name.padEnd(30, ' ')} [${d.code}] : ${d.mandals.length} Mandals (HQ: ${d.headquarters})`);
});

console.log('=====================================================');
if (errors === 0) {
  console.log('🎉 ALL 28 DISTRICTS & MANDAL MASTER DATA VALIDATION PASSED 100%');
  console.log('=====================================================');
  process.exit(0);
} else {
  console.error(`❌ VALIDATION FAILED WITH ${errors} ERRORS`);
  console.log('=====================================================');
  process.exit(1);
}
