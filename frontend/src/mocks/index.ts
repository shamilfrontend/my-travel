/**
 * Моковые данные для разработки UI без бэкенда.
 * Импорт: import { mockUsers, getMockActivityFeed } from '@/mocks';
 */

export { MOCK_CURRENT_USER_ID, MOCK_USER_IDS } from './ids';
export * from './helpers';

export { mockUsers, mockUsersWithStats } from './users';
export { mockMedia } from './media';
export { mockGeoMarks } from './geo-marks';
export { mockVisitedPlaces } from './visited-places';
export { mockRoutes } from './routes';
export {
  mockLikes,
  getMockMyLikes,
  mockCreateLike,
  mockRemoveLike,
} from './likes';
export { mockWishlistPlaces } from './wishlist';
export {
  mockVisitedStatisticsByUser,
  mockPublicVisitedStatistics,
} from './statistics';
export {
  mockActivityItems,
  mockRecommendedTags,
  getMockActivityFeed,
} from './activity';
export {
  mockNotifications,
  mockUnreadNotificationsCount,
  getMockNotifications,
  getMockUnreadNotificationsCount,
  mockMarkNotificationRead,
  mockMarkAllNotificationsRead,
} from './notifications';
export {
  mockFriendships,
  getMockFriendStatus,
  getMockPendingFriendships,
  mockAcceptFriendRequest,
  mockDeclineFriendRequest,
  mockRemoveFriend,
  mockSendFriendRequest,
} from './friendships';
export {
  mockPosts,
  getMockPostsResponse,
  mockCreatePost,
  mockUpdatePost,
  mockRemovePost,
} from './posts';
export {
  mockPublicEvents,
  mockMyEvents,
  getMockPublicEvents,
  getMockMyEvents,
  mockCreateEvent,
  mockJoinEvent,
  mockLeaveEvent,
  mockRemoveEvent,
} from './events';

import type { UserWithStats, TravelRoute, VisitedPlace, GeoMark, WishlistPlace } from '@/types';
import { MOCK_CURRENT_USER_ID } from './ids';
import { mockUsersWithStats } from './users';
import { mockRoutes } from './routes';
import { mockVisitedPlaces } from './visited-places';
import { mockGeoMarks } from './geo-marks';
import { mockWishlistPlaces } from './wishlist';
import { getRuntimeMockFriendships } from './friendships';
import { mockVisitedStatisticsByUser } from './statistics';

/** Друзья текущего пользователя (accepted) */
export function getMockFriends(): UserWithStats[] {
  const friendIds = new Set<string>();

  for (const friendship of getRuntimeMockFriendships()) {
    if (friendship.status !== 'accepted') continue;

    const requesterId =
      typeof friendship.requesterId === 'string'
        ? friendship.requesterId
        : friendship.requesterId._id;
    const recipientId =
      typeof friendship.recipientId === 'string'
        ? friendship.recipientId
        : friendship.recipientId._id;

    if (requesterId === MOCK_CURRENT_USER_ID) friendIds.add(recipientId);
    if (recipientId === MOCK_CURRENT_USER_ID) friendIds.add(requesterId);
  }

  return mockUsersWithStats.filter((u) => friendIds.has(u._id));
}

export function getMockUserById(id: string): UserWithStats | undefined {
  return mockUsersWithStats.find((u) => u._id === id);
}

export function getMockRoutesByAuthor(authorId: string, publicOnly = false): TravelRoute[] {
  return mockRoutes.filter(
    (r) => r.authorId === authorId && (!publicOnly || r.isPublic),
  );
}

export function getMockMyRoutes(): TravelRoute[] {
  return getMockRoutesByAuthor(MOCK_CURRENT_USER_ID);
}

export function getMockPublicRoutes(): TravelRoute[] {
  return mockRoutes.filter((r) => r.isPublic);
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

export function getMockGeoMarksByAuthor(authorId: string): GeoMark[] {
  return mockGeoMarks.filter((m) => m.authorId === authorId);
}

export function getMockMyGeoMarks(): GeoMark[] {
  return getMockGeoMarksByAuthor(MOCK_CURRENT_USER_ID);
}

export function getMockMyWishlist(): WishlistPlace[] {
  return mockWishlistPlaces.filter((w) => w.userId === MOCK_CURRENT_USER_ID);
}

export function getMockVisitedStatistics(userId = MOCK_CURRENT_USER_ID) {
  return mockVisitedStatisticsByUser[userId];
}
