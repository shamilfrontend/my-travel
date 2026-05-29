const regionNamesCache = new Map<string, Intl.DisplayNames>();

function getRegionNames(locale: string): Intl.DisplayNames {
  let names = regionNamesCache.get(locale);
  if (!names) {
    names = new Intl.DisplayNames([locale], { type: 'region' });
    regionNamesCache.set(locale, names);
  }
  return names;
}

export function getLocalizedCountryName(alpha2: string, locale = 'ru'): string | undefined {
  try {
    return getRegionNames(locale).of(alpha2.toUpperCase());
  } catch {
    return undefined;
  }
}
