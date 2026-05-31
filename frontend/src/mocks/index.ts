/**
 * Моковые данные для разработки UI без бэкенда.
 * Импорт: import { mockUsers, getMockActivityFeed } from '@/mocks';
 */

export { MOCK_CURRENT_USER_ID } from './ids';

export { mockUsers, mockUsersWithStats } from './users';
export { mockMedia } from './media';
export { mockVisitedPlaceComments } from './visited-comments';
export { mockVisitedPlaces } from './visited-places';
export {
  getMockMyLikes,
  mockCreateLike,
  mockRemoveLike,
} from './likes';
export {
  mockPublicVisitedStatistics,
} from './statistics';
export {
  mockRecommendedTags,
  getMockActivityFeed,
} from './activity';
export {
  getMockNotifications,
  getMockUnreadNotificationsCount,
  mockMarkNotificationRead,
  mockMarkAllNotificationsRead,
} from './notifications';
export {
  getMockPostsResponse,
  getMockPostById,
  mockCreatePost,
  mockUpdatePost,
  mockRemovePost,
} from './posts';
export {
  getMockPublicEvents,
  getMockMyEvents,
  mockCreateEvent,
  mockJoinEvent,
  mockLeaveEvent,
  mockRemoveEvent,
} from './events';

import type { UserWithStats, TravelRoute, VisitedPlace, GeoMark } from '@/types';
import { MOCK_CURRENT_USER_ID } from './ids';
import { mockUsersWithStats } from './users';
import { mockRoutes } from './routes';
import { mockVisitedPlaces } from './visited-places';
import { mockGeoMarks } from './geo-marks';
import { mockVisitedStatisticsByUser } from './statistics';

export function getMockUserById(id: string): UserWithStats | undefined {
  return mockUsersWithStats.find((u) => u._id === id);
}

export function getMockRoutesByAuthor(authorId: string): TravelRoute[] {
  return mockRoutes.filter((r) => r.authorId === authorId);
}

export function getMockMyRoutes(): TravelRoute[] {
  return getMockRoutesByAuthor(MOCK_CURRENT_USER_ID);
}

export function getMockCommunityRoutes(): TravelRoute[] {
  return mockRoutes.filter((r) => r.authorId !== MOCK_CURRENT_USER_ID);
}

export function getMockRouteById(id: string): TravelRoute | undefined {
  return mockRoutes.find((r) => r._id === id);
}

export function getMockVisitedByUser(userId: string): VisitedPlace[] {
  return mockVisitedPlaces.filter((p) => p.userId === userId);
}

export function getMockMyVisited(): VisitedPlace[] {
  return getMockVisitedByUser(MOCK_CURRENT_USER_ID);
}

export function getMockMyGeoMarks(): GeoMark[] {
  return mockGeoMarks.filter((m) => m.authorId === MOCK_CURRENT_USER_ID);
}

export function getMockVisitedStatistics(userId = MOCK_CURRENT_USER_ID) {
  return mockVisitedStatisticsByUser[userId];
}
