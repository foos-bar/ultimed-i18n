import { assertFixture, loadFixture, test } from '@codemod-utils/tests';

import { runCodemod } from '../../src/index.js';
import {
  basicOutputProject,
  filterOutputProject,
  inputProject,
  thresholdOutputProject,
} from '../fixtures/sample-project/index.js';
import { codemodOptions } from '../helpers/shared-test-setups/sample-project.js';

test('the codemod works', function () {
  loadFixture(inputProject, codemodOptions);

  runCodemod(codemodOptions);

  assertFixture(basicOutputProject, codemodOptions);

  // Check idempotence
  runCodemod(codemodOptions);

  assertFixture(basicOutputProject, codemodOptions);
});

test('the codemod works with a filter', function () {
  codemodOptions.filter = 'app/components';
  loadFixture(inputProject, codemodOptions);
  runCodemod(codemodOptions);

  assertFixture(filterOutputProject, codemodOptions);

  // Check idempotence
  runCodemod(codemodOptions);

  assertFixture(filterOutputProject, codemodOptions);
  codemodOptions.filter = undefined;
});

test('the codemod works with a threshold', function () {
  codemodOptions.threshold = 0.5;
  loadFixture(inputProject, codemodOptions);

  runCodemod(codemodOptions);

  assertFixture(thresholdOutputProject, codemodOptions);

  // Check idempotence
  runCodemod(codemodOptions);

  assertFixture(thresholdOutputProject, codemodOptions);
  codemodOptions.threshold = undefined;
});
