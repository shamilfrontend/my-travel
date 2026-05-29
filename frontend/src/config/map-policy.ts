export const MAP_POLICIES = {
  INTERNATIONAL: 'international',
  RU_LOCALIZED: 'ru_localized',
} as const;

export type MapPolicy = typeof MAP_POLICIES[keyof typeof MAP_POLICIES];

function isMapPolicy(value: string): value is MapPolicy {
  return value === MAP_POLICIES.INTERNATIONAL || value === MAP_POLICIES.RU_LOCALIZED;
}

const envPolicy = import.meta.env.VITE_MAP_POLICY as string | undefined;

export const ACTIVE_MAP_POLICY: MapPolicy =
  envPolicy && isMapPolicy(envPolicy) ? envPolicy : MAP_POLICIES.RU_LOCALIZED;
