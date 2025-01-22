#!/usr/bin/env node
'use strict';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { runCodemod } from '../src/index.js';

// Provide a title to the process in `ps`
process.title = 'ultimed-i18n';

// Set codemod options
const argv = yargs(hideBin(process.argv))
  .option('root', {
    describe: 'Where to run the codemod',
    type: 'string',
  })
  .option('filter', {
    describe:
      'Provide a path to reduce the scope of the codemod (i.e. --filter app/components/automations)',
    type: 'string',
  })
  .option('threshold', {
    describe:
      'Provide a number between 0 - 1 to set the threshold at which to point out german strings (this is only relevant for JS files). Default is 1 (i.e. --threshold 0.5)',
    type: 'number',
  })
  .parseSync();

const codemodOptions = {
  filter: argv['filter'],
  projectRoot: argv['root'] ?? process.cwd(),
  threshold: argv['threshold'],
};

runCodemod(codemodOptions);
