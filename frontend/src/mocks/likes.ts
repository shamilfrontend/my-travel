import type { Like } from '@/types';
import { isoDaysAgo } from './helpers';
import { MOCK_CURRENT_USER_ID, MOCK_USER_IDS } from './ids';

const mockLikes: Like[] = [
  { _id: 'like-001', userId: MOCK_USER_IDS.maria, targetType: 'VisitedPlace', targetId: 'visited-001', createdAt: isoDaysAgo(270) },
  { _id: 'like-002', userId: MOCK_USER_IDS.anna, targetType: 'VisitedPlace', targetId: 'visited-001', createdAt: isoDaysAgo(265) },
  { _id: 'like-003', userId: MOCK_CURRENT_USER_ID, targetType: 'VisitedPlace', targetId: 'visited-013', createdAt: isoDaysAgo(50) },
  { _id: 'like-004', userId: MOCK_USER_IDS.dmitry, targetType: 'GeoMark', targetId: 'mark-001', createdAt: isoDaysAgo(43) },
  { _id: 'like-005', userId: MOCK_USER_IDS.elena, targetType: 'GeoMark', targetId: 'mark-002', createdAt: isoDaysAgo(42) },
  { _id: 'like-006', userId: MOCK_USER_IDS.pavel, targetType: 'GeoMark', targetId: 'mark-018', createdAt: isoDaysAgo(10) },
  { _id: 'like-007', userId: MOCK_USER_IDS.sofia, targetType: 'GeoMark', targetId: 'mark-019', createdAt: isoDaysAgo(7) },
  { _id: 'like-008', userId: MOCK_USER_IDS.katya, targetType: 'VisitedPlace', targetId: 'visited-024', createdAt: isoDaysAgo(70) },
  { _id: 'like-009', userId: MOCK_USER_IDS.nikita, targetType: 'VisitedPlace', targetId: 'visited-022', createdAt: isoDaysAgo(15) },
  { _id: 'like-010', userId: MOCK_USER_IDS.olga, targetType: 'VisitedPlace', targetId: 'visited-021', createdAt: isoDaysAgo(30) },
  { _id: 'like-011', userId: MOCK_USER_IDS.ivan, targetType: 'GeoMark', targetId: 'mark-012', createdAt: isoDaysAgo(21) },
  { _id: 'like-012', userId: MOCK_USER_IDS.sergey, targetType: 'GeoMark', targetId: 'mark-013', createdAt: isoDaysAgo(19) },
  { _id: 'like-013', userId: MOCK_CURRENT_USER_ID, targetType: 'GeoMark', targetId: 'mark-006', createdAt: isoDaysAgo(31) },
  { _id: 'like-014', userId: MOCK_USER_IDS.maria, targetType: 'VisitedPlace', targetId: 'visited-006', createdAt: isoDaysAgo(140) },
  { _id: 'like-015', userId: MOCK_USER_IDS.anna, targetType: 'VisitedPlace', targetId: 'visited-015', createdAt: isoDaysAgo(40) },
  { _id: 'like-016', userId: MOCK_USER_IDS.alexey, targetType: 'VisitedPlace', targetId: 'visited-028', createdAt: isoDaysAgo(7) },
  { _id: 'like-017', userId: MOCK_USER_IDS.dmitry, targetType: 'VisitedPlace', targetId: 'visited-009', createdAt: isoDaysAgo(85) },
  { _id: 'like-018', userId: MOCK_USER_IDS.pavel, targetType: 'VisitedPlace', targetId: 'visited-030', createdAt: isoDaysAgo(4) },
  { _id: 'like-019', userId: MOCK_USER_IDS.elena, targetType: 'GeoMark', targetId: 'mark-008', createdAt: isoDaysAgo(27) },
  { _id: 'like-020', userId: MOCK_CURRENT_USER_ID, targetType: 'GeoMark', targetId: 'mark-010', createdAt: isoDaysAgo(24) },
  { _id: 'like-021', userId: MOCK_USER_IDS.katya, targetType: 'GeoMark', targetId: 'mark-028', createdAt: isoDaysAgo(9) },
  { _id: 'like-022', userId: MOCK_USER_IDS.sofia, targetType: 'VisitedPlace', targetId: 'visited-029', createdAt: isoDaysAgo(95) },
  { _id: 'like-023', userId: MOCK_USER_IDS.nikita, targetType: 'GeoMark', targetId: 'mark-015', createdAt: isoDaysAgo(15) },
  { _id: 'like-024', userId: MOCK_USER_IDS.maria, targetType: 'GeoMark', targetId: 'mark-005', createdAt: isoDaysAgo(34) },
  { _id: 'like-025', userId: MOCK_USER_IDS.ivan, targetType: 'VisitedPlace', targetId: 'visited-016', createdAt: isoDaysAgo(210) },
  { _id: 'like-026', userId: MOCK_USER_IDS.olga, targetType: 'GeoMark', targetId: 'mark-024', createdAt: isoDaysAgo(32) },
  { _id: 'like-027', userId: MOCK_USER_IDS.anna, targetType: 'GeoMark', targetId: 'mark-011', createdAt: isoDaysAgo(23) },
  { _id: 'like-028', userId: MOCK_CURRENT_USER_ID, targetType: 'VisitedPlace', targetId: 'visited-021', createdAt: isoDaysAgo(32) },
  { _id: 'like-029', userId: MOCK_USER_IDS.sergey, targetType: 'VisitedPlace', targetId: 'visited-019', createdAt: isoDaysAgo(8) },
  { _id: 'like-030', userId: MOCK_USER_IDS.pavel, targetType: 'GeoMark', targetId: 'mark-026', createdAt: isoDaysAgo(14) },
];

let runtimeLikes: Like[] = structuredClone(mockLikes);

export function getMockMyLikes(): Like[] {
  return runtimeLikes.filter((like) => like.userId === MOCK_CURRENT_USER_ID);
}

export function mockCreateLike(
  targetType: Like['targetType'],
  targetId: string,
): Like {
  const existing = runtimeLikes.find(
    (like) => like.userId === MOCK_CURRENT_USER_ID
      && like.targetType === targetType
      && like.targetId === targetId,
  );
  if (existing) {
    return existing;
  }

  const like: Like = {
    _id: `like-mock-${Date.now()}`,
    userId: MOCK_CURRENT_USER_ID,
    targetType,
    targetId,
    createdAt: new Date().toISOString(),
  };

  runtimeLikes.push(like);
  return like;
}

export function mockRemoveLike(id: string): void {
  runtimeLikes = runtimeLikes.filter((like) => like._id !== id);
}
