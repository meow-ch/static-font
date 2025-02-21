#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.join(__dirname, '..');
const FONTS_DIR = path.join(PACKAGE_ROOT, 'assets', 'font');
const LICENSE_DIR = path.join(PACKAGE_ROOT, 'assets', 'license');
const TARGET_DIR = path.join(process.cwd(), 'public', 'assets', 'font');

async function getFontList() {
  const files = await fs.readdir(FONTS_DIR);
  return files.filter(file => file.endsWith('.woff2'));
}

async function copyFont(font) {
  await fs.mkdir(TARGET_DIR, { recursive: true });
  await fs.copyFile(
    path.join(FONTS_DIR, font),
    path.join(TARGET_DIR, font)
  );
}

async function getLicense(font) {
  const baseName = path.parse(font).name;
  const licensePath = path.join(LICENSE_DIR, `${baseName}.txt`);
  console.log('Looking for license at:', licensePath);
  
  try {
    const exists = await fs.access(licensePath).then(() => true).catch(() => false);
    if (!exists) {
      console.log('License file not found:', licensePath);
      return '';
    }
    
    const license = await fs.readFile(licensePath, 'utf-8');
    console.log('License found:', license);
    return license.replace(/\n/g, ' ').trim();
  } catch (err) {
    console.error('Error reading license:', err);
    return '';
  }
}

async function generateCSSRule(font) {
  const fontName = path.parse(font).name;
  const license = await getLicense(font);
  const licenseComment = license ? ` /* ${license} */` : '';
  
  return `@font-face {
  font-family: '${fontName}';
  src: url('/assets/font/${font}') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, /* Basic Latin + Latin-1 Supplement */
                 U+0100-017F, /* Latin Extended-A */
                 U+0180-024F, /* Latin Extended-B */
                 U+1E00-1EFF, /* Latin Extended Additional */
                 U+2000-206F, /* General Punctuation */
                 U+2070-209F, /* Superscripts and Subscripts */
                 U+20A0-20CF, /* Currency Symbols */
                 U+2100-214F, /* Letterlike Symbols */
                 U+2150-218F; /* Number Forms */
}${licenseComment}`;
}

async function main() {
  const fonts = await getFontList();
  const args = process.argv.slice(2);
  
  let selectedFonts;
  
  if (args.length > 0) {
    const requestedFonts = args.map(name => name.replace(/\+/g, ' ') + '.woff2');
    selectedFonts = fonts.filter(font => requestedFonts.includes(font));
    
    const notFound = requestedFonts.filter(font => !fonts.includes(font));
    if (notFound.length > 0) {
      console.log('\nWarning: These fonts were not found:', notFound.join(', '));
    }
  } else {
    const { copyAll } = await inquirer.prompt([{
      type: 'confirm',
      name: 'copyAll',
      message: 'Copy all fonts?',
      default: true
    }]);

    if (copyAll) {
      selectedFonts = fonts;
    } else {
      const { choices } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'choices',
        message: 'Select fonts to copy:',
        choices: fonts
      }]);
      selectedFonts = choices;
    }
  }

  for (const font of selectedFonts) {
    await copyFont(font);
  }

  if (selectedFonts.length === 0) {
    console.log('\nNo fonts were selected.\n');
  } else {
    console.log('\nCSS rules for selected fonts:');
    const cssRules = await Promise.all(selectedFonts.map(generateCSSRule));
    console.log('\n' + cssRules.join('\n\n') + '\n');
  }
}

main().catch(console.error);
