const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const FRONTEND_SRC = path.resolve(__dirname, '../frontend/src');
const INVENTORY_FILE = path.join(__dirname, 'inventory.json');
const EN_LOCALE_FILE = path.join(FRONTEND_SRC, 'locales/en/translation.json');

const inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));

// Load existing English translations
let enTranslations = {};
if (fs.existsSync(EN_LOCALE_FILE)) {
  enTranslations = JSON.parse(fs.readFileSync(EN_LOCALE_FILE, 'utf8'));
}

const UI_PROPS = new Set([
  'placeholder',
  'title',
  'alt',
  'label',
  'aria-label',
  'helpText',
  'errorMessage'
]);

function toCamelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

function getRoute(filePath) {
  const relative = path.relative(FRONTEND_SRC, filePath);
  let name = path.basename(relative, path.extname(relative));
  return name.charAt(0).toLowerCase() + name.slice(1); // camelCase file name
}

function generateKey(filePath, text) {
  const componentName = getRoute(filePath);
  // Create a short identifier from text (up to 4 words)
  const shortText = text.split(' ').slice(0, 4).join(' ');
  const textKey = toCamelCase(shortText);
  return `${componentName}.${textKey || 'text'}`;
}

// Group inventory by file
const fileGroups = {};
inventory.forEach(item => {
  if (item.alreadyUsingT === 'no') {
    const fullPath = path.resolve(FRONTEND_SRC, item.file);
    if (!fileGroups[fullPath]) fileGroups[fullPath] = [];
    fileGroups[fullPath].push(item);
  }
});

let modifiedFiles = 0;

Object.keys(fileGroups).forEach(file => {
  const code = fs.readFileSync(file, 'utf-8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (e) {
    console.error(`Error parsing ${file}: ${e.message}`);
    return;
  }

  let modified = false;
  let useTranslationImported = false;

  traverse(ast, {
    Program(path) {
      // Check if useTranslation is imported
      path.traverse({
        ImportDeclaration(importPath) {
          if (importPath.node.source.value === 'react-i18next') {
            importPath.node.specifiers.forEach(spec => {
              if (spec.imported && spec.imported.name === 'useTranslation') {
                useTranslationImported = true;
              }
            });
          }
        }
      });
    },
    JSXText(path) {
      const text = path.node.value;
      if (text.trim().length > 0) {
        const cleanedText = text.trim().replace(/\s+/g, ' ');
        const key = generateKey(file, cleanedText);
        
        // Add to EN locale
        const parts = key.split('.');
        if (!enTranslations[parts[0]]) enTranslations[parts[0]] = {};
        enTranslations[parts[0]][parts[1]] = cleanedText;

        // Replace node with {t('key')}
        path.replaceWith(
          t.jsxExpressionContainer(
            t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
          )
        );
        modified = true;
      }
    },
    JSXAttribute(path) {
      const name = path.node.name.name;
      if (UI_PROPS.has(name)) {
        if (path.node.value && path.node.value.type === 'StringLiteral') {
          const text = path.node.value.value;
          if (text.trim().length > 0) {
            const cleanedText = text.trim().replace(/\s+/g, ' ');
            const key = generateKey(file, cleanedText);
            
            const parts = key.split('.');
            if (!enTranslations[parts[0]]) enTranslations[parts[0]] = {};
            enTranslations[parts[0]][parts[1]] = cleanedText;

            path.node.value = t.jsxExpressionContainer(
              t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
            );
            modified = true;
          }
        } else if (
          path.node.value &&
          path.node.value.type === 'JSXExpressionContainer' &&
          path.node.value.expression.type === 'StringLiteral'
        ) {
          const text = path.node.value.expression.value;
          if (text.trim().length > 0) {
            const cleanedText = text.trim().replace(/\s+/g, ' ');
            const key = generateKey(file, cleanedText);
            
            const parts = key.split('.');
            if (!enTranslations[parts[0]]) enTranslations[parts[0]] = {};
            enTranslations[parts[0]][parts[1]] = cleanedText;

            path.node.value.expression = t.callExpression(
              t.identifier('t'), [t.stringLiteral(key)]
            );
            modified = true;
          }
        }
      }
    }
  });

  if (modified) {
    // We need to ensure `const { t } = useTranslation();` is in the component.
    // This is hard to do safely in AST for all varied component structures (arrows, functions, classes).
    // We will rely on manual or a separate pass to add `useTranslation` if missing.
    // For now, we just output the modified code.

    // If we want to add import, we can do it textually at the top if useTranslationImported is false
    // But Babel generator is enough for the AST changes.
    const output = generate(ast, { retainLines: true, retainFunctionParens: true }, code);
    let finalCode = output.code;

    if (!useTranslationImported && finalCode.includes('useTranslation')) {
       // Just a simple prepend for missing imports
       finalCode = `import { useTranslation } from 'react-i18next';\n` + finalCode;
    }

    fs.writeFileSync(file, finalCode);
    modifiedFiles++;
  }
});

// Save english translations
fs.writeFileSync(EN_LOCALE_FILE, JSON.stringify(enTranslations, null, 2));

console.log(`--- MIGRATION COMPLETE ---`);
console.log(`Modified ${modifiedFiles} files.`);
console.log(`Updated EN locale keys.`);
