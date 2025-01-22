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
  .parseSync();

const codemodOptions = {
  filter: argv['filter'],
  projectRoot: argv['root'] ?? process.cwd(),
};

runCodemod(codemodOptions);
