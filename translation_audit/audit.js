const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const FRONTEND_SRC = path.resolve(__dirname, '../frontend/src');
const INVENTORY_FILE = path.join(__dirname, 'inventory.json');

const UI_PROPS = new Set([
  'placeholder',
  'title',
  'alt',
  'label',
  'aria-label',
  'helpText',
  'errorMessage'
]);

const inventory = [];
let totalStrings = 0;
let usingT = 0;
let hardcoded = 0;

function getRoute(filePath) {
  const relative = path.relative(FRONTEND_SRC, filePath);
  if (relative.startsWith('pages' + path.sep)) {
    return path.basename(relative, path.extname(relative));
  }
  return 'Component: ' + path.basename(relative, path.extname(relative));
}

function addEntry(filePath, line, rawString, isTUsed, key = null) {
  inventory.push({
    file: path.relative(FRONTEND_SRC, filePath).replace(/\\/g, '/'),
    line,
    rawString: rawString.trim().replace(/\s+/g, ' '),
    alreadyUsingT: isTUsed ? 'yes' : 'no',
    i18nKey: key,
    route: getRoute(filePath)
  });
  totalStrings++;
  if (isTUsed) {
    usingT++;
  } else {
    hardcoded++;
  }
}

const files = glob.sync('**/*.{jsx,js,tsx,ts}', { cwd: FRONTEND_SRC, absolute: true });

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf-8');
  
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (e) {
    // If Babel fails to parse, it could be a simple file with non-standard syntax, just skip
    return;
  }

  traverse(ast, {
    CallExpression(path) {
      if (path.node.callee.type === 'Identifier' && path.node.callee.name === 't') {
        const arg = path.node.arguments[0];
        if (arg && arg.type === 'StringLiteral') {
          addEntry(file, path.node.loc.start.line, arg.value, true, arg.value);
        }
      }
    },
    JSXText(path) {
      const text = path.node.value;
      if (text.trim().length > 0) {
        addEntry(file, path.node.loc.start.line, text, false);
      }
    },
    JSXAttribute(path) {
      const name = path.node.name.name;
      if (UI_PROPS.has(name)) {
        if (path.node.value && path.node.value.type === 'StringLiteral') {
          const text = path.node.value.value;
          if (text.trim().length > 0) {
            addEntry(file, path.node.loc.start.line, text, false);
          }
        } else if (
          path.node.value &&
          path.node.value.type === 'JSXExpressionContainer' &&
          path.node.value.expression.type === 'StringLiteral'
        ) {
          const text = path.node.value.expression.value;
          if (text.trim().length > 0) {
            addEntry(file, path.node.loc.start.line, text, false);
          }
        }
      }
    }
  });
});

fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2));

console.log('--- AUDIT COMPLETE ---');
console.log(`Total user-facing strings found: ${totalStrings}`);
console.log(`Already using t(): ${usingT}`);
console.log(`Hardcoded (Backlog): ${hardcoded}`);
console.log(`Inventory saved to ${INVENTORY_FILE}`);
