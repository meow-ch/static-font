# static-font

A CLI tool to easily manage and self-host web fonts in your projects. It handles font copying, generates optimized `@font-face` rules, and maintains proper licensing information.

## For Users

### Direct Usage

```bash
# Interactive mode
npx static-font

# Install specific fonts
npx static-font Luciole-Regular Other+Font
```

This will:
1. Create a `public/assets/font` directory in your project
2. Copy the selected fonts
3. Print ready-to-use `@font-face` CSS rules with license information

### Features

- Interactive font selection
- Direct font specification via CLI arguments
- Optimized `@font-face` rules
- Full Unicode range for European languages (French, German, Italian, Spanish, etc.)
- Font-display optimization
- License information included in CSS comments

## For Package Authors

If you want to ensure specific fonts are available in projects using your package, create a `postinstall.js` script:

```js
// postinstall.js
if (process.env.INIT_CWD === process.cwd()) {
  // Skip running during development
  process.exit(0);
}

const { execSync } = require('child_process');
execSync('npx static-font FontName1 FontName2', { stdio: 'inherit' });
```

or ES module, if the package uses `"type": "module"`

```js
// postinstall.js
import { execSync } from 'child_process';

if (process.env.INIT_CWD === process.cwd()) {
  // Skip running during development
  process.exit(0);
}

execSync('npx static-font FontName1 FontName2', { stdio: 'inherit' });
```

Then in your `package.json`:

```json
{
  "scripts": {
    "postinstall": "node postinstall.js"
  },
  "files": [
    "postinstall.js",
    // your other files...
  ]
}
```

This ensures:
- The script only runs when your package is installed as a dependency
- Doesn't run during your package development (`npm install`)
- Runs when end users install your package

## Available Fonts

- `Luciole-Regular.woff2` - A typeface specifically designed for visually impaired people
- `Luciole-Bold.woff2`
- `AccessibleDfA-VF.woff2` - Basic Latin, Latin-1 Supplement, Latin Extended-A, Latin Extended-B

## Contributing New Fonts

### Via GitHub

1. Fork the repository
2. Add your font file to `assets/font/`
3. Add the corresponding license file to `assets/license/`
   - License filename must match font filename (e.g., `MyFont.woff2` → `MyFont.txt`)
4. Create a pull request

**Important:** When contributing fonts, you MUST:
- Include the font's license file
- Ensure you have the rights to distribute the font
- Use WOFF2 format for optimal web performance

### Request a Font

If you need a specific font added to the package:
1. Open an issue on GitHub
2. Include:
   - Font name
   - Link to font
   - Use case
   - License information

## Technical Details

- Supports WOFF2 fonts
- Generates optimized `@font-face` rules
- Includes Unicode ranges for broad language support
- Preserves and displays font licensing information

## License

MIT (for the tool itself)

Individual fonts are subject to their own licenses, which are preserved in the CSS output.

## Support

Open an issue on GitHub for:
- Bug reports
- Feature requests
- Font addition requests
- Usage questions
