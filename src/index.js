import { findFiles } from '@codemod-utils/files';

import { runClassCodemod } from './class-codemod.js';
import { runTemplateCodemod } from './template-codemod.js';

export const CHECK_TRANSLATION = '!CHECK TRANSLATION!';

export function getFilePaths(options, extension) {
  let pathGlobs = ['app/**/*.' + extension];
  if (options.filter) {
    pathGlobs = [options.filter, options.filter + '*/**/*.' + extension];
  }

  let filePaths = [];
  for (let pathGlob of pathGlobs) {
    filePaths.push(findFiles(pathGlob, options));
  }

  return filePaths.flat(Infinity);
}

export function runCodemod(options) {
  runTemplateCodemod(options);
  runClassCodemod(options);
}
