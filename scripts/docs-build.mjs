#!/usr/bin/env -S yarn zx
import { join } from 'path';
import { writeFile, readFile } from 'fs/promises';
import glob from 'glob'; 

import 'zx/globals';


// function sideBarPosition(idx) {
//   return `sidebar_position: ${idx}
//   ---

//   `;
// }

const BUILD_TARGET_DIR = './docsDist';
const DOCS_LINK_REGEX = /\]\s*\((.\/)?docs\//gm;

async function fixLinksToDocs(readmeSource, destDir) {
  const readme = (await readFile(readmeSource)).toString();
  const fixedReadme = readme.replace(DOCS_LINK_REGEX, '](')
  const destFile = join(destDir, 'README.md');
  await writeFile(destFile, fixedReadme);
}


async function copyPackageDocumentation(packageBase, destDir, idx) {
  const fromReadmePath = join(packageBase, 'README.md');
  const filesToCopy = glob.sync(join(packageBase, 'docs/*'));
  const destCategoryFile = join(destDir, '_category_.yml');

  await $`mkdir ${destDir}`;
  await fixLinksToDocs(fromReadmePath, destDir);
  await $([`cp -r ${filesToCopy.join(' ')} ${destDir}`])
  await $`echo 'position: ${idx}' > ${destCategoryFile}`
}

await $`rm -rf ${BUILD_TARGET_DIR}`

await copyPackageDocumentation(process.cwd(), BUILD_TARGET_DIR, 1);

await $`yarn typedoc`;
