import { readFileSync } from 'node:fs';

import { AST } from '@codemod-utils/ast-javascript';
import { createFiles, findFiles } from '@codemod-utils/files';
import { francAll } from 'franc-min';

import { CHECK_TRANSLATION } from './index.js';

function transformClass(file, threshold = 1) {
  const traverse = AST.traverse();

  const ast = traverse(file, {
    visitLiteral(path) {
      const { node } = path;
      if (path.parentPath?.value?.type === 'ImportDeclaration') {
        return false;
      }
      if (typeof node.value !== 'string') {
        return false;
      }
      // exit early if the string has already been added
      if (node.value.endsWith(CHECK_TRANSLATION)) {
        return false;
      }
      const language = francAll(node.value, { minLength: 3 });
      const result = language.find((lang) => {
        return lang[0] === 'deu';
      });
      if (!result) {
        return false;
      }
      const [, germanDistance] = result;
      if (germanDistance >= threshold) {
        node.value += ' ' + CHECK_TRANSLATION;
      }
      return false;
    },
  });

  return AST.print(ast);
}

export function runClassCodemod(options) {
  let pathGlob = (options.filter ?? 'app/') + '**/*.js';
  const filePaths = findFiles(pathGlob, options);
  const fileMap = new Map();

  for (const filePath of filePaths) {
    const file = readFileSync(`${options.projectRoot}/${filePath}`, 'utf8');
    const output = transformClass(file, options.threshold);

    fileMap.set(filePath, output);
  }
  createFiles(fileMap, options);
}
