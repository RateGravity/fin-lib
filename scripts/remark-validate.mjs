#!/usr/bin/env -S yarn node

import { args } from 'unified-args';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
import remarkValidateLinks from 'remark-validate-links';

const extensions = ['md', 'markdown', 'mdown', 'mkdn', 'mkd', 'mdwn', 'mkdown', 'ron'];

const IGNORED_RULES = new Set([
  'missing-heading',
]);

function ignoreHeadingLinksPlugin() {
  return (_, file) => {
    file.messages = file.messages.filter((m) => !IGNORED_RULES.has(m.ruleId));
  };
}

await args({
  processor: remark().use(remarkPresetLintConsistent).use(remarkValidateLinks).use(remarkMdx).use(ignoreHeadingLinksPlugin),
  name: 'remark',
  description: 'Custom remark cli implementation due to yarn / esm loader',
  version: '0.0.0',
  pluginPrefix: 'remark',
  extensions,
  packageField: 'remarkConfig',
  rcName: '.remarkrc',
  ignoreName: '.remarkignore'
});

