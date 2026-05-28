import type { Friendship } from '@/types';
import { avatarUrl, isoDaysAgo } from './helpers';
import { MOCK_CURRENT_USER_ID, MOCK_USER_IDS } from './ids';
import { mockUsers } from './users';

function userPopulated(id: string, name: string) {
  return { _id: id, name, avatarUrl: avatarUrl(id.replace('user-', '')) };
}

function resolveUserId(id: string | { _id: string }): string {
  return typeof id === 'string' ? id : id._id;
}

export const mockFriendships: Friendship[] = [
  {
    _id: 'friendship-001',
    requesterId: MOCK_CURRENT_USER_ID,
    recipientId: userPopulated(MOCK_USER_IDS.maria, 'Мария Соколова'),
    status: 'accepted',
    createdAt: isoDaysAgo(200),
  },
  {
    _id: 'friendship-002',
    requesterId: userPopulated(MOCK_USER_IDS.dmitry, 'Дмитрий Козлов'),
    recipientId: MOCK_CURRENT_USER_ID,
    status: 'accepted',
    createdAt: isoDaysAgo(150),
  },
  {
    _id: 'friendship-003',
    requesterId: MOCK_CURRENT_USER_ID,
    recipientId: userPopulated(MOCK_USER_IDS.anna, 'Анна Белова'),
    status: 'accepted',
    createdAt: isoDaysAgo(120),
  },
  {
    _id: 'friendship-004',
    requesterId: userPopulated(MOCK_USER_IDS.katya, 'Екатерина Лебедева'),
    recipientId: MOCK_CURRENT_USER_ID,
    status: 'pending',
    createdAt: isoDaysAgo(10),
  },
  {
    _id: 'friendship-005',
    requesterId: userPopulated(MOCK_USER_IDS.sofia, 'София Романова'),
    recipientId: MOCK_CURRENT_USER_ID,
    status: 'pending',
    createdAt: isoDaysAgo(2),
  },
  {
    _id: 'friendship-006',
    requesterId: MOCK_CURRENT_USER_ID,
    recipientId: userPopulated(MOCK_USER_IDS.pavel, 'Павел Смирнов'),
    status: 'pending',
    createdAt: isoDaysAgo(30),
  },
  {
    _id: 'friendship-007',
    requesterId: userPopulated(MOCK_USER_IDS.elena, 'Елена Морозова'),
    recipientId: userPopulated(MOCK_USER_IDS.olga, 'Ольга Новикова'),
    status: 'accepted',
    createdAt: isoDaysAgo(80),
  },
  {
    _id: 'friendship-008',
    requesterId: userPopulated(MOCK_USER_IDS.nikita, 'Никита Зайцев'),
    recipientId: userPopulated(MOCK_USER_IDS.ivan, 'Иван Петров'),
    status: 'accepted',
    createdAt: isoDaysAgo(60),
  },
  {
    _id: 'friendship-009',
    requesterId: userPopulated(MOCK_USER_IDS.sergey, 'Сергей Орлов'),
    recipientId: userPopulated(MOCK_USER_IDS.maria, 'Мария Соколова'),
    status: 'declined',
    createdAt: isoDaysAgo(40),
  },
];

let runtimeFriendships: Friendship[] = structuredClone(mockFriendships);

export function getRuntimeMockFriendships(): Friendship[] {
  return runtimeFriendships;
}

export interface MockFriendStatusResult {
  status: string;
  friendshipId?: string;
  isRequester?: boolean;
}

export function getMockFriendStatus(userId: string): MockFriendStatusResult {
  for (const friendship of runtimeFriendships) {
    const requesterId = resolveUserId(friendship.requesterId);
    const recipientId = resolveUserId(friendship.recipientId);
    const involvesCurrentUser =
      (requesterId === MOCK_CURRENT_USER_ID && recipientId === userId) ||
      (requesterId === userId && recipientId === MOCK_CURRENT_USER_ID);

    if (!involvesCurrentUser) continue;

    return {
      status: friendship.status,
      friendshipId: friendship._id,
      isRequester: requesterId === MOCK_CURRENT_USER_ID,
    };
  }

  return { status: 'none' };
}

export function getMockPendingFriendships(): Friendship[] {
  return runtimeFriendships.filter(
    (friendship) =>
      resolveUserId(friendship.recipientId) === MOCK_CURRENT_USER_ID &&
      friendship.status === 'pending',
  );
}

function toPopulatedUser(userId: string) {
  const user = mockUsers.find((item) => item._id === userId);
  if (!user) {
    return { _id: userId, name: 'Пользователь' };
  }

  return { _id: user._id, name: user.name, avatarUrl: user.avatarUrl };
}

export function mockSendFriendRequest(recipientId: string): Friendship {
  const friendship: Friendship = {
    _id: `friendship-mock-${Date.now()}`,
    requesterId: MOCK_CURRENT_USER_ID,
    recipientId: toPopulatedUser(recipientId),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  runtimeFriendships.push(friendship);
  return friendship;
}

export function mockAcceptFriendRequest(id: string): Friendship {
  const friendship = runtimeFriendships.find((item) => item._id === id);
  if (!friendship) {
    throw new Error('Friendship not found');
  }

  friendship.status = 'accepted';
  return friendship;
}

export function mockDeclineFriendRequest(id: string): Friendship {
  const friendship = runtimeFriendships.find((item) => item._id === id);
  if (!friendship) {
    throw new Error('Friendship not found');
  }

  friendship.status = 'declined';
  return friendship;
}

export function mockRemoveFriend(userId: string): void {
  runtimeFriendships = runtimeFriendships.filter((friendship) => {
    const requesterId = resolveUserId(friendship.requesterId);
    const recipientId = resolveUserId(friendship.recipientId);

    const isTargetFriendship =
      friendship.status === 'accepted' &&
      ((requesterId === MOCK_CURRENT_USER_ID && recipientId === userId) ||
        (requesterId === userId && recipientId === MOCK_CURRENT_USER_ID));

    return !isTargetFriendship;
  });
}
