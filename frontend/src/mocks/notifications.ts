import type { AppNotification } from '@/types';
import { avatarUrl, isoDaysAgo } from './helpers';
import { MOCK_USER_IDS } from './ids';

function actor(id: string, name: string) {
  return { _id: id, name, avatarUrl: avatarUrl(id.replace('user-', '')) };
}

export const mockNotifications: AppNotification[] = [
  {
    _id: 'notif-001',
    type: 'like',
    actorId: actor(MOCK_USER_IDS.maria, 'Мария Соколова'),
    targetId: 'visited-001',
    targetType: 'VisitedPlace',
    message: 'понравилось ваше место «Париж»',
    isRead: false,
    createdAt: isoDaysAgo(1),
  },
  {
    _id: 'notif-002',
    type: 'like',
    actorId: actor(MOCK_USER_IDS.anna, 'Анна Белова'),
    targetId: 'mark-001',
    targetType: 'GeoMark',
    message: 'понравилась ваша метка «Эйфелева башня»',
    isRead: false,
    createdAt: isoDaysAgo(3),
  },
  {
    _id: 'notif-005',
    type: 'like',
    actorId: actor(MOCK_USER_IDS.pavel, 'Павел Смирнов'),
    targetId: 'route-001',
    targetType: 'Route',
    message: 'понравился ваш маршрут «Париж за выходные»',
    isRead: true,
    createdAt: isoDaysAgo(7),
  },
  {
    _id: 'notif-007',
    type: 'like',
    actorId: actor(MOCK_USER_IDS.elena, 'Елена Морозова'),
    targetId: 'visited-004',
    targetType: 'VisitedPlace',
    message: 'понравилось ваше место «Стамбул»',
    isRead: true,
    createdAt: isoDaysAgo(12),
  },
  {
    _id: 'notif-009',
    type: 'like',
    actorId: actor(MOCK_USER_IDS.nikita, 'Никита Зайцев'),
    targetId: 'mark-006',
    targetType: 'GeoMark',
    message: 'понравилась ваша метка на Байкале',
    isRead: true,
    createdAt: isoDaysAgo(25),
  },
  {
    _id: 'notif-011',
    type: 'like',
    actorId: actor(MOCK_USER_IDS.olga, 'Ольга Новикова'),
    targetId: 'route-007',
    targetType: 'Route',
    isRead: true,
    createdAt: isoDaysAgo(32),
  },
];

export const mockUnreadNotificationsCount = mockNotifications.filter((n) => !n.isRead).length;

let runtimeNotifications: AppNotification[] = structuredClone(mockNotifications);

export function getMockNotifications(): AppNotification[] {
  return runtimeNotifications;
}

export function getMockUnreadNotificationsCount(): number {
  return runtimeNotifications.filter((n) => !n.isRead).length;
}

export function mockMarkNotificationRead(id: string): void {
  const item = runtimeNotifications.find((n) => n._id === id);
  if (item) {
    item.isRead = true;
  }
}

export function mockMarkAllNotificationsRead(): void {
  runtimeNotifications.forEach((n) => {
    n.isRead = true;
  });
}
