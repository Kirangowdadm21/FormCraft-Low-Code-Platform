const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const FRONTEND_SRC = path.resolve(__dirname, '../frontend/src');

const files = glob.sync('**/*.{jsx,tsx}', { cwd: FRONTEND_SRC, absolute: true });

let fixedFiles = 0;

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf-8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (e) {
    return;
  }

  let needsT = false;
  let hasUseTranslation = false;
  let hasImport = false;

  traverse(ast, {
    CallExpression(path) {
      if (path.node.callee.name === 't') {
        needsT = true;
      }
      if (path.node.callee.name === 'useTranslation') {
        hasUseTranslation = true;
      }
    },
    ImportDeclaration(path) {
      if (path.node.source.value === 'react-i18next') {
        hasImport = true;
      }
    }
  });

  if (needsT && !hasUseTranslation) {
    let modified = false;
    
    // Insert import if missing
    if (!hasImport) {
      ast.program.body.unshift(
        t.importDeclaration(
          [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
          t.stringLiteral('react-i18next')
        )
      );
      modified = true;
    }

    // Insert const { t } = useTranslation(); into the main component function
    traverse(ast, {
      FunctionDeclaration(path) {
        if (
          path.node.id && 
          path.node.id.name && 
          /^[A-Z]/.test(path.node.id.name) // React Component
        ) {
          path.node.body.body.unshift(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                t.objectPattern([
                  t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)
                ]),
                t.callExpression(t.identifier('useTranslation'), [])
              )
            ])
          );
          modified = true;
        }
      },
      ArrowFunctionExpression(path) {
        if (
          path.parent.type === 'VariableDeclarator' &&
          path.parent.id.name &&
          /^[A-Z]/.test(path.parent.id.name) &&
          path.node.body.type === 'BlockStatement'
        ) {
          path.node.body.body.unshift(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                t.objectPattern([
                  t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)
                ]),
                t.callExpression(t.identifier('useTranslation'), [])
              )
            ])
          );
          modified = true;
        }
      }
    });

    if (modified) {
      const output = generate(ast, { retainLines: false, retainFunctionParens: true }, code);
      fs.writeFileSync(file, output.code);
      fixedFiles++;
    }
  }
});

console.log(`Fixed missing useTranslation() in ${fixedFiles} files.`);
