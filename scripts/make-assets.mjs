import sharp from 'sharp';
import path from 'path';

const publicDir = path.resolve('public');

const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06080C"/>
      <stop offset="50%" stop-color="#0D1117"/>
      <stop offset="100%" stop-color="#07090E"/>
    </linearGradient>

    <radialGradient id="glowCyan" cx="20%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#00F0FF" stop-opacity="0"/>
    </radialGradient>
    
    <radialGradient id="glowEmerald" cx="80%" cy="70%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="glowRed" cx="70%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#FF2E4D" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#FF2E4D" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#00C8D4"/>
    </linearGradient>

    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00F0FF" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#10B981" stop-opacity="0.8"/>
      <stop offset="80%" stop-color="#FF2E4D" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#00F0FF" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Ambient Glow Orbs -->
  <circle cx="250" cy="200" r="300" fill="url(#glowCyan)"/>
  <circle cx="950" cy="400" r="350" fill="url(#glowEmerald)"/>
  <circle cx="850" cy="150" r="250" fill="url(#glowRed)"/>

  <!-- Cyber Grid Lines -->
  <g opacity="0.08" stroke="#00F0FF" stroke-width="1">
    <line x1="0" y1="70" x2="1200" y2="70"/>
    <line x1="0" y1="140" x2="1200" y2="140"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="280" x2="1200" y2="280"/>
    <line x1="0" y1="350" x2="1200" y2="350"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
    <line x1="0" y1="490" x2="1200" y2="490"/>
    <line x1="0" y1="560" x2="1200" y2="560"/>

    <line x1="100" y1="0" x2="100" y2="630"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="300" y1="0" x2="300" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="500" y1="0" x2="500" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="700" y1="0" x2="700" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="900" y1="0" x2="900" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
    <line x1="1100" y1="0" x2="1100" y2="630"/>
  </g>

  <!-- Outer Frame Border -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="url(#borderGrad)" stroke-width="2"/>

  <!-- Top Left Pill Badge -->
  <g transform="translate(70, 70)">
    <rect width="360" height="42" rx="21" fill="#FF2E4D" fill-opacity="0.12" stroke="#FF2E4D" stroke-opacity="0.4" stroke-width="1.5"/>
    <text x="24" y="26" font-family="monospace, sans-serif" font-weight="bold" font-size="14" fill="#FF2E4D" letter-spacing="1.5">CANADA'S AUTO AUTHORITY</text>
  </g>

  <!-- Brand Title -->
  <g transform="translate(70, 190)">
    <!-- Logo Icon -->
    <rect x="0" y="0" width="68" height="68" rx="18" fill="url(#logoGrad)"/>
    <text x="34" y="44" font-family="monospace, sans-serif" font-weight="900" font-size="30" fill="#07090E" text-anchor="middle">RF</text>

    <!-- Main Title -->
    <text x="90" y="50" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="54" fill="#FFFFFF" letter-spacing="-1">
      RangeAndFuel<tspan fill="#00F0FF">.ca</tspan>
    </text>
  </g>

  <!-- Subtitle Text -->
  <text x="70" y="300" font-family="'Outfit', 'Inter', sans-serif" font-weight="700" font-size="28" fill="#E2E8F0">
    Official NRCan Fuel Consumption &amp; EV Winter Range
  </text>
  <text x="70" y="340" font-family="'Inter', sans-serif" font-weight="400" font-size="18" fill="#94A3B8">
    Metric L/100km · 10-Province CAD Fuel Costs · -15°C Cold Range · Transport Canada Recalls
  </text>

  <!-- Bottom Metric Badges Row -->
  <g transform="translate(70, 420)">
    <!-- Badge 1: L/100km -->
    <g transform="translate(0, 0)">
      <rect width="240" height="110" rx="18" fill="#0D1117" stroke="#00F0FF" stroke-opacity="0.3" stroke-width="1.5"/>
      <text x="24" y="36" font-family="monospace, sans-serif" font-size="12" fill="#94A3B8" font-weight="bold">METRIC STANDARD</text>
      <text x="24" y="76" font-family="monospace, sans-serif" font-size="28" fill="#00F0FF" font-weight="900">L/100 km</text>
      <text x="24" y="96" font-family="sans-serif" font-size="11" fill="#64748B">NRCan 5-Cycle Ratings</text>
    </g>

    <!-- Badge 2: Provincial CAD -->
    <g transform="translate(260, 0)">
      <rect width="240" height="110" rx="18" fill="#0D1117" stroke="#10B981" stroke-opacity="0.3" stroke-width="1.5"/>
      <text x="24" y="36" font-family="monospace, sans-serif" font-size="12" fill="#94A3B8" font-weight="bold">ENERGY PRICING</text>
      <text x="24" y="76" font-family="monospace, sans-serif" font-size="28" fill="#10B981" font-weight="900">CAD $ Costs</text>
      <text x="24" y="96" font-family="sans-serif" font-size="11" fill="#64748B">10 Provincial Pump Averages</text>
    </g>

    <!-- Badge 3: -15C Winter Loss -->
    <g transform="translate(520, 0)">
      <rect width="240" height="110" rx="18" fill="#0D1117" stroke="#FF2E4D" stroke-opacity="0.3" stroke-width="1.5"/>
      <text x="24" y="36" font-family="monospace, sans-serif" font-size="12" fill="#94A3B8" font-weight="bold">WINTER SIMULATION</text>
      <text x="24" y="76" font-family="monospace, sans-serif" font-size="28" fill="#FF2E4D" font-weight="900">-15°C Model</text>
      <text x="24" y="96" font-family="sans-serif" font-size="11" fill="#64748B">Real EV &amp; Hybrid Range</text>
    </g>

    <!-- Badge 4: Transport Canada -->
    <g transform="translate(780, 0)">
      <rect width="270" height="110" rx="18" fill="#0D1117" stroke="#8B5CF6" stroke-opacity="0.3" stroke-width="1.5"/>
      <text x="24" y="36" font-family="monospace, sans-serif" font-size="12" fill="#94A3B8" font-weight="bold">SAFETY GOVERNANCE</text>
      <text x="24" y="76" font-family="monospace, sans-serif" font-size="28" fill="#8B5CF6" font-weight="900">TC Recalls</text>
      <text x="24" y="96" font-family="sans-serif" font-size="11" fill="#64748B">CMVSS Defect Bulletins</text>
    </g>
  </g>
</svg>
`;

const iconSvg = `
<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgIcon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07090E"/>
      <stop offset="100%" stop-color="#0D1117"/>
    </linearGradient>
    <linearGradient id="logoGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF"/>
      <stop offset="60%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#00C8D4"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#bgIcon)"/>
  <rect x="20" y="20" width="140" height="140" rx="32" fill="url(#logoGradIcon)"/>
  <text x="90" y="106" font-family="monospace, sans-serif" font-weight="900" font-size="64" fill="#07090E" text-anchor="middle">RF</text>
</svg>
`;

const logoSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgLogo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06080C"/>
      <stop offset="100%" stop-color="#0D1117"/>
    </linearGradient>
    <linearGradient id="logoGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#00C8D4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgLogo)"/>
  <rect x="56" y="56" width="400" height="400" rx="88" fill="url(#logoGradFull)"/>
  <text x="256" y="305" font-family="monospace, sans-serif" font-weight="900" font-size="180" fill="#07090E" text-anchor="middle">RF</text>
</svg>
`;

async function main() {
  console.log('Generating high-res SEO assets in public/...');
  await sharp(Buffer.from(ogSvg)).png({ quality: 95 }).toFile(path.join(publicDir, 'og-default.png'));
  console.log('✓ Created public/og-default.png (1200x630)');
  await sharp(Buffer.from(iconSvg)).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created public/apple-touch-icon.png (180x180)');
  await sharp(Buffer.from(logoSvg)).png().toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ Created public/logo.png (512x512)');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
