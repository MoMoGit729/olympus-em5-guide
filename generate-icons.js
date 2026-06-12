const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const svg = fs.readFileSync(path.join(__dirname, 'public', 'icon.svg'), 'utf-8');

for (const size of [192, 512]) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  const out = path.join(__dirname, 'public', `icon-${size}.png`);
  fs.writeFileSync(out, png);
  console.log(`✓ icon-${size}.png`);
}
