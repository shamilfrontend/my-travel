export function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function isoDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function isoMonthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

export function avatarUrl(seed: string): string {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
}

export function coverUrl(seed: string): string {
  return `https://picsum.photos/seed/${seed}/1200/400`;
}

export function mockMediaPath(
  seed: string,
  _ext = 'jpg',
  width = 1280,
  height = 860,
): string {
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const style = hash % 3;
  const isCity = style === 0;
  const isNature = style === 1;

  const bgStart = isCity
    ? `hsl(${(hue + 8) % 360} 74% 58%)`
    : isNature
      ? `hsl(${(hue + 120) % 360} 58% 52%)`
      : `hsl(${(hue + 250) % 360} 62% 44%)`;
  const bgEnd = isCity
    ? `hsl(${(hue + 40) % 360} 60% 36%)`
    : isNature
      ? `hsl(${(hue + 160) % 360} 50% 30%)`
      : `hsl(${(hue + 290) % 360} 56% 20%)`;
  const accentA = isCity
    ? `hsl(${(hue + 200) % 360} 76% 74%)`
    : isNature
      ? `hsl(${(hue + 70) % 360} 70% 68%)`
      : `hsl(${(hue + 310) % 360} 72% 70%)`;
  const accentB = isCity
    ? `hsl(${(hue + 240) % 360} 66% 62%)`
    : isNature
      ? `hsl(${(hue + 30) % 360} 68% 62%)`
      : `hsl(${(hue + 335) % 360} 78% 62%)`;
  const label = seed.replace(/[-_]/g, ' ').slice(0, 36);
  const styleLabel = isCity ? 'city mood' : isNature ? 'nature mood' : 'night mood';
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1.1">
      <stop offset="0%" stop-color="${bgStart}" />
      <stop offset="100%" stop-color="${bgEnd}" />
    </linearGradient>
    <radialGradient id="sun" cx="80%" cy="12%" r="45%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.70)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.06" />
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect width="100%" height="100%" fill="url(#sun)" />
  ${isCity ? `<g fill="rgba(255,255,255,0.16)">
    <rect x="${Math.floor(width * 0.08)}" y="${Math.floor(height * 0.22)}" width="${Math.floor(width * 0.11)}" height="${Math.floor(height * 0.37)}" rx="6" />
    <rect x="${Math.floor(width * 0.22)}" y="${Math.floor(height * 0.30)}" width="${Math.floor(width * 0.09)}" height="${Math.floor(height * 0.29)}" rx="6" />
    <rect x="${Math.floor(width * 0.74)}" y="${Math.floor(height * 0.24)}" width="${Math.floor(width * 0.13)}" height="${Math.floor(height * 0.35)}" rx="6" />
  </g>` : ''}
  ${isNature ? `<g fill="rgba(255,255,255,0.20)">
    <circle cx="${Math.floor(width * 0.18)}" cy="${Math.floor(height * 0.26)}" r="${Math.floor(Math.min(width, height) * 0.08)}" />
    <path d="M${Math.floor(width * 0.72)} ${Math.floor(height * 0.46)} l${Math.floor(width * 0.07)} ${Math.floor(height * 0.16)} h-${Math.floor(width * 0.14)} z" />
  </g>` : ''}
  ${!isCity && !isNature ? `<g fill="rgba(255,255,255,0.22)">
    <circle cx="${Math.floor(width * 0.16)}" cy="${Math.floor(height * 0.22)}" r="${Math.floor(Math.min(width, height) * 0.045)}" />
    <circle cx="${Math.floor(width * 0.26)}" cy="${Math.floor(height * 0.17)}" r="${Math.floor(Math.min(width, height) * 0.02)}" />
    <circle cx="${Math.floor(width * 0.33)}" cy="${Math.floor(height * 0.24)}" r="${Math.floor(Math.min(width, height) * 0.015)}" />
  </g>` : ''}
  <g opacity="0.95">
    <path d="M0 ${Math.floor(height * 0.76)} C ${Math.floor(width * 0.22)} ${Math.floor(height * 0.62)}, ${Math.floor(width * 0.44)} ${Math.floor(height * 0.84)}, ${Math.floor(width * 0.68)} ${Math.floor(height * 0.72)} C ${Math.floor(width * 0.86)} ${Math.floor(height * 0.64)}, ${Math.floor(width * 0.94)} ${Math.floor(height * 0.70)}, ${width} ${Math.floor(height * 0.66)} L ${width} ${height} L 0 ${height} Z" fill="${accentA}" />
    <path d="M0 ${Math.floor(height * 0.84)} C ${Math.floor(width * 0.25)} ${Math.floor(height * 0.72)}, ${Math.floor(width * 0.45)} ${Math.floor(height * 0.98)}, ${Math.floor(width * 0.66)} ${Math.floor(height * 0.86)} C ${Math.floor(width * 0.81)} ${Math.floor(height * 0.78)}, ${Math.floor(width * 0.90)} ${Math.floor(height * 0.86)}, ${width} ${Math.floor(height * 0.82)} L ${width} ${height} L 0 ${height} Z" fill="${accentB}" />
  </g>
  <rect width="100%" height="100%" filter="url(#grain)" />
  <rect x="0" y="${Math.floor(height * 0.82)}" width="${width}" height="${Math.floor(height * 0.18)}" fill="rgba(0,0,0,0.16)" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Inter,Arial,sans-serif" font-size="${Math.max(18, Math.floor(width / 13))}"
        font-weight="700" fill="rgba(255,255,255,0.95)" style="letter-spacing:0.6px">${label}</text>
  <text x="50%" y="${Math.floor(height * 0.91)}" dominant-baseline="middle" text-anchor="middle"
        font-family="Inter,Arial,sans-serif" font-size="${Math.max(13, Math.floor(width / 28))}"
        fill="rgba(255,255,255,0.88)" style="letter-spacing:1.1px;text-transform:uppercase">${styleLabel}</text>
</svg>`.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function stringHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function deterministicInt(seed: string, min: number, max: number): number {
  if (max <= min) return min;
  const range = max - min + 1;
  return min + (stringHash(seed) % range);
}
