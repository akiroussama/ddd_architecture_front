const fs = require('fs');
const path = require('path');

// Read the mock-data.ts file
const filePath = path.join(__dirname, '../src/lib/mock-data.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Counter for generating unique pair IDs
let pairCounter = 3; // Starting from 3 since we already have pair-001 and pair-002

// Function to transform cas/einecs to casEinecsPairs
function transformSubstance(match, indent, casArray, einecs) {
  const pairId = `pair-${String(pairCounter).padStart(3, '0')}`;
  pairCounter++;

  // Parse the CAS array - it could be ["xxx"], ["xxx", "yyy"], or ["Not Available"]
  const casNumbers = casArray.match(/"([^"]+)"/g).map(s => s.slice(1, -1));

  // Build the casEinecsPairs array
  const pairs = casNumbers.map((cas, index) => {
    const id = index === 0 ? pairId : `pair-${String(pairCounter++).padStart(3, '0')}`;
    const einecsValue = einecs && index === 0 ? `\n${indent}      einecs: ${einecs},` : '';

    return `${indent}    {
${indent}      id: "${id}",
${indent}      cas: "${cas}",${einecsValue}
${indent}      source: "Regulatory list",
${indent}      createdAt: "2024-12-01T08:00:00Z",
${indent}      createdBy: "System"
${indent}    }`;
  }).join(',\n');

  return `${indent}casEinecsPairs: [\n${pairs}\n${indent}],`;
}

// Pattern to match cas and optional einecs fields
// This regex matches:
//   cas: ["xxx"],
//   einecs: "yyy",
// or
//   cas: ["xxx", "yyy"],
//   einecs: "zzz",
// or
//   cas: ["xxx"],
//   (no einecs)

const regex = /^(\s+)cas: (\[[^\]]+\]),\n(?:\1einecs: ("[\d-]+"),\n)?/gm;

content = content.replace(regex, (match, indent, casArray, einecs) => {
  return transformSubstance(match, indent, casArray, einecs);
});

// Write the updated content back
fs.writeFileSync(filePath, content, 'utf-8');

console.log(`✅ Migration complete! Updated ${pairCounter - 3} substances.`);
