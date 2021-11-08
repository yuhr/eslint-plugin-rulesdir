/**
 * @fileoverview Allows a local ESLint rules directory to be used without a command-line flag
 * @author Teddy Katz
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

const extension = /\.c?js$/

const cache = {};
module.exports = {
  get rules() {
    const RULES_DIR = module.exports.RULES_DIR ?? [".eslint/rules"];
    const cacheKey = JSON.stringify(RULES_DIR);
    if (!cache[cacheKey]) {
      const rules = Array.isArray(RULES_DIR) ? RULES_DIR : [RULES_DIR];
      const rulesObject = {};
      rules.forEach((rulesDir) => {
        fs.readdirSync(rulesDir)
          .filter(filename => extension.test(filename))
          .map(filename => path.resolve(rulesDir, filename))
          .forEach((absolutePath) => {
            const ruleName = path.basename(absolutePath).replace(extension, "");
            if (rulesObject[ruleName]) {
              throw new Error(`eslint-plugin-rulesdir found two rules with the same name: ${ruleName}`);
            }
            rulesObject[ruleName] = require(absolutePath);
          });
      });
      cache[cacheKey] = rulesObject;
    }
    return cache[cacheKey];
  },
};
