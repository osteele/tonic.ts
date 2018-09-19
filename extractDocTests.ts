import * as fs from 'fs';
import * as process from 'process';

function updateImports(src: string): string {
  src = src.replace(/^import (.+) from 'tonic'/gm, "import $1 from '../src'");
  src = src.replace(/^$/m, "import { stringify } from './docTestHelpers';\n");
  return src;
}

function replaceArrows(src: string): string {
  const squiggly = /^([^/\n].+);\s*\/\/ ~> (.+)/m;
  src = src.replace(/^([^/\n].+);\s*\/\/ => (.+)/gm, 'expect($1).toEqual($2);');
  src = src.replace(RegExp(squiggly.source, squiggly.flags + 'g'), (s) => {
    const m = s.match(squiggly)!;
    return `expect(stringify(${m[1]})).toBe(${JSON.stringify(m[2])});`;
  });
  return src;
}

const content: string = fs.readFileSync('./README.md', 'utf8');
const m = content.match(/^\s*```\s*typescript\n(.+?)```/ims);

if (m === null) {
  console.error('Error: no matching code blocks');
  process.exit(1);
}

let src = m![1];
src = updateImports(src);
src = replaceArrows(src);
src = src.replace(
  /(.+?)\n\n(.+)/ms,
  `$1

describe('README', () => {
  it('checks out', () => {
$2
  });
});\n`,
);
src = '// tslint:disable:ordered-imports quotemark\n' + src;
// src += fs.readFileSync('./test/docTestHelpers.ts', 'utf8');
fs.writeFileSync('./test/docs.test.ts', src);
