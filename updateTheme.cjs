const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = [
  { regex: /#4318ff/gi, replacement: '#2563EB' },
  { regex: /#2b3674/gi, replacement: '#1E3A8A' },
  { regex: /#1b2559/gi, replacement: '#1E3A8A' },
  { regex: /#f4f7fe/gi, replacement: '#F8FAFC' },
  { regex: /#a3aed1/gi, replacement: '#6B7280' },
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${fullPath}`);
    }
  }
}

processDir(dir);
