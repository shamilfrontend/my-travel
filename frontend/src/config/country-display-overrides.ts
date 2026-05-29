import type { MapPolicy } from './map-policy';
import { MAP_POLICIES } from './map-policy';
import { getLocalizedCountryName } from '@/utils/country-names';

export interface CountryDisplayOverrides {
  impliedCountryCodes: Record<string, string[]>;
  displayNameOverrides: Record<string, string>;
}

const INTERNATIONAL_OVERRIDES: CountryDisplayOverrides = {
  impliedCountryCodes: {},
  displayNameOverrides: {},
};

const RU_MANUAL_NAME_OVERRIDES: Record<string, string> = {
  US: 'США',
  KR: 'Южная Корея',
  KP: 'КНДР',
  DK: 'Дания',
  GL: 'Гренландия',
};

const RU_LOCALIZED_OVERRIDES: CountryDisplayOverrides = {
  impliedCountryCodes: {
    DK: ['GL'],
  },
  displayNameOverrides: RU_MANUAL_NAME_OVERRIDES,
};

export function getCountryDisplayOverrides(policy: MapPolicy): CountryDisplayOverrides {
  if (policy === MAP_POLICIES.RU_LOCALIZED) {
    return RU_LOCALIZED_OVERRIDES;
  }
  return INTERNATIONAL_OVERRIDES;
}

export function getCountryDisplayName(
  alpha2: string,
  fallbackName: string,
  policy: MapPolicy,
): string {
  if (policy !== MAP_POLICIES.RU_LOCALIZED) {
    return fallbackName;
  }

  const code = alpha2.toUpperCase();
  const manualName = RU_MANUAL_NAME_OVERRIDES[code];
  if (manualName) return manualName;

  return getLocalizedCountryName(code, 'ru') || fallbackName;
}
