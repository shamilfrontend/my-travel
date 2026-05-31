import type { VisitedStatistics } from '@/types';
import { MOCK_CURRENT_USER_ID, MOCK_USER_IDS } from './ids';
import { mockVisitedPlaces } from './visited-places';
import { buildStatsFromPlaces } from '@/utils/visited-statistics';

function buildStatsForUser(placeUserId?: string): VisitedStatistics {
  const list = placeUserId
    ? mockVisitedPlaces.filter((place) => place.userId === placeUserId)
    : mockVisitedPlaces;

  return buildStatsFromPlaces(list);
}

const userIds = Array.from(new Set([
  MOCK_CURRENT_USER_ID,
  ...Object.values(MOCK_USER_IDS),
]));

export const mockVisitedStatisticsByUser: Record<string, VisitedStatistics> =
  Object.fromEntries(userIds.map((userId) => [userId, buildStatsForUser(userId)]));

export const mockPublicVisitedStatistics: VisitedStatistics = buildStatsForUser();
