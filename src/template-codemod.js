import { readFileSync } from 'node:fs';

import { AST } from '@codemod-utils/ast-template';
import { createFiles, findFiles } from '@codemod-utils/files';
import { createHash } from 'crypto';
import { parse, stringify } from 'yaml';

import { CHECK_TRANSLATION } from './index.js';

function generateTranslationKey(text, filePath) {
  const hash = createHash('md5').update(text).digest('hex').slice(0, 8);
  return `${filePath}${hash}`;
}

function shouldTranslateString(text) {
  // don't translate if it is an empty string
  if (
    !text ||
    !text.trim() ||
    /^\d+$/.test(text) ||
    /^[^a-zA-Z]+$/.test(text)
  ) {
    return false;
  }
  return true;
}

function transform(node, filePath, translations) {
  const { builders } = AST;
  if (!shouldTranslateString(node.chars)) {
    return node;
  }

  const text = node.chars;
  const key = generateTranslationKey(text.trim(), filePath);
  const translationHelper = builders.mustache(builders.path('t'), [
    builders.string(key),
  ]);

  addTranslations({ key, text, translations });

  const nodes = [];

  if (text.match(/^(\s*)/) && text.match(/^(\s*)/)[1] !== '') {
    nodes.push(builders.text(text.match(/^(\s*)/)[1]));
  }

  nodes.push(translationHelper);

  if (text.match(/(\s*)$/) && text.match(/(\s*)$/)[1] !== '') {
    nodes.push(builders.text(text.match(/(\s*)$/)[1]));
  }

  if (nodes.length === 1) {
    return nodes[0];
  }

  return nodes;
}

// this function sets all of the translations as an object so that the yaml parser can turn it into a yaml file to be saved
function addTranslations({ key, text, translations }) {
  text = text.trim();
  const [, parentKey, childKey] = key.split('.');
  try {
    if (!translations[parentKey]) {
      translations[parentKey] = {};
    }
    translations[parentKey][childKey] = text;
  } catch (error) {
    console.error(`Error updating translations: ${error}`);
    throw error;
  }
}

function generateFilePath(path) {
  // this turns the file name into a snake_case key for the translation
  return path.replace(
    /^app\/(templates|controllers|routes|components)\/((?:[^/]+\/)*)([^/]+)\.(hbs|js)$/,
    (_match, type, folders, name) => {
      return `${type}.${folders}${name}.`
        .replace(/([A-Z])|([-\s])/g, '_')
        .toLowerCase();
    },
  );
}

function transformTemplate({
  template,
  filePath,
  originalTranslations: translations = {},
}) {
  const { builders } = AST;
  const traverse = AST.traverse();

  filePath = generateFilePath(filePath);

  const ast = traverse(template, {
    ElementNode(element) {
      if (element.children.length < 1) {
        return;
      }
      const children = element.children
        .map((node) => {
          // if there is a mustache statement in the template, it will probably need to be updated manually so we will add a message so that it is easy to find later
          if (
            node.type === 'MustacheStatement' &&
            node.path.original === 'if'
          ) {
            return [node, builders.comment(CHECK_TRANSLATION)];
          }
          // ignore any comments including the CHECK_TRANSLATION comments
          if (node.type === 'CommentStatement') {
            return [];
          }
          if (node.type !== 'TextNode') {
            return node;
          }
          return transform(node, filePath, translations);
        })
        .flat(Infinity);
      element.children = children;
    },
    BlockStatement(node) {
      if (!node.program && !node.inverse) {
        return node;
      }
      if (node.program) {
        node.program.body = node.program.body
          .map((n) => {
            if (n.type !== 'TextNode') {
              return n;
            }
            const result = transform(n, filePath, translations);
            return result;
          })
          .flat(Infinity);
      }
      if (node.inverse) {
        node.inverse.body = node.inverse.body
          .map((n) => {
            if (n.type !== 'TextNode') {
              return n;
            }
            const result = transform(n, filePath, translations);
            return result;
          })
          .flat(Infinity);
      }
    },
    AttrNode(node) {
      if (
        node.name !== 'placeholder' &&
        node.name !== '@placeholder' &&
        node.name !== 'label' &&
        node.name !== '@label'
      ) {
        return node;
      }
      const value = transform(node.value, filePath, translations);
      node.value = value;
    },
  });
  return { file: AST.print(ast), translations };
}

// this function will get all of the relevant template files, read them, get the relevant translation files, trigger the transform, then rewrite the files
export function runTemplateCodemod(options) {
  let pathGlob = (options.filter ?? 'app/') + '**/*.hbs';
  const filePaths = findFiles(pathGlob, options);

  const fileMap = new Map();

  let updatedTranslations = new Map();

  for (const filePath of filePaths) {
    const template = readFileSync(`${options.projectRoot}/${filePath}`, 'utf8');

    let originalTranslations = {};
    const translationFileType = filePath.split('app/')[1].split('/')[0];
    const translationFilePath = `translations/${translationFileType}/de-at.yaml`;

    if (updatedTranslations.has(translationFileType)) {
      originalTranslations = updatedTranslations.get(translationFileType);
    } else {
      try {
        const translationFile = readFileSync(
          `${options.projectRoot}/${translationFilePath}`,
          'utf8',
        );
        originalTranslations = parse(translationFile);
      } catch {
        console.log('translation file does not exist, one will be created');
      }
    }

    const { file, translations } = transformTemplate({
      template,
      filePath,
      originalTranslations,
    });

    // it is possible that after updating one file, the original translations are out of sync, so this updates the translations Map with the most recent translations
    updatedTranslations.set(translationFileType, translations);

    const yamlOutput = stringify(translations, {
      indent: 2,
      sortMapEntries: true,
    });

    fileMap.set(filePath, file);
    fileMap.set(translationFilePath, yamlOutput);
  }

  createFiles(fileMap, options);
}
