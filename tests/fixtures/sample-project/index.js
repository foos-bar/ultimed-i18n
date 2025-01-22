import { convertFixtureToJson } from '@codemod-utils/tests';

const inputProject = convertFixtureToJson('sample-project/input');
const basicOutputProject = convertFixtureToJson('sample-project/output/basic');
const filterOutputProject = convertFixtureToJson('sample-project/output/filter');
const thresholdOutputProject = convertFixtureToJson('sample-project/output/threshold');

export { inputProject, basicOutputProject, filterOutputProject, thresholdOutputProject };
