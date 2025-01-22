import { runTemplateCodemod } from './template-codemod.js';

/**
 * NOTES
 * All strings are hashed in the same way, meaning that the same string will have the same hash, this can be updated manually if needed
 * The codemod will not attempt to change any mustache statements so they will need manual attention. The codemod will add a comment with the string !CHECK TRANSLATION! to make it easier to find
 * provide --filter to the command to reduce the scope of the changes, i.e. --filter app/components/forms
 * provide --threshold to raise/lower the threshold of what is perceived as a german word within JS files - default is 0.9
 */

export const CHECK_TRANSLATION = '!CHECK TRANSLATION!';

export function runCodemod(options) {
  runTemplateCodemod(options);
}
/**
 * PICKUP:
 * get all JS files
 * add tests for the optional parameters
 * see if there is a better way to sort the yaml keys
 **/
