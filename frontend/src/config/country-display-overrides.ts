import type { MapPolicy } from './map-policy';
import { MAP_POLICIES } from './map-policy';

export interface CountryDisplayOverrides {
  impliedCountryCodes: Record<string, string[]>;
  displayNameOverrides: Record<string, string>;
}

const INTERNATIONAL_OVERRIDES: CountryDisplayOverrides = {
  impliedCountryCodes: {},
  displayNameOverrides: {},
};

const RU_LOCALIZED_OVERRIDES: CountryDisplayOverrides = {
  // Group territorial display per selected regional policy.
  impliedCountryCodes: {
    DK: ['GL'],
  },
  // Country labels on map can be customized by ISO alpha-2.
  displayNameOverrides: {
    DK: 'Дания',
    GL: 'Гренландия',
  },
};

export function getCountryDisplayOverrides(policy: MapPolicy): CountryDisplayOverrides {
  if (policy === MAP_POLICIES.RU_LOCALIZED) {
    return RU_LOCALIZED_OVERRIDES;
  }
  return INTERNATIONAL_OVERRIDES;
}
