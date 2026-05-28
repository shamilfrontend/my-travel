import type { ActivityFeedResponse, ActivityItem } from '@/types';
import { avatarUrl, isoDaysAgo } from './helpers';
import { MOCK_USER_IDS } from './ids';

export interface MockActivityFeedParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  scope?: string;
}

function matchesSearch(item: ActivityItem, search: string): boolean {
  const query = search.toLowerCase();

  if (item.userId.name.toLowerCase().includes(query)) {
    return true;
  }

  if (!item.metadata) {
    return false;
  }

  return Object.values(item.metadata).some(
    (value) => typeof value === 'string' && value.toLowerCase().includes(query),
  );
}

function filterMockActivityItems(params: MockActivityFeedParams): ActivityItem[] {
  let items = [...mockActivityItems];

  if (params.type && params.type !== 'all') {
    items = items.filter((item) => item.type === params.type);
  }

  if (params.search) {
    items = items.filter((item) => matchesSearch(item, params.search!));
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function userRef(id: string, name: string) {
  return { _id: id, name, avatarUrl: avatarUrl(id.replace('user-', '')) };
}

const mockActivityItems: ActivityItem[] = [
  {
    _id: 'activity-001',
    userId: userRef(MOCK_USER_IDS.sofia, 'София Романова'),
    type: 'visited_place',
    targetId: 'visited-028',
    targetType: 'VisitedPlace',
    metadata: { title: 'Бали — Убуд' },
    createdAt: isoDaysAgo(8),
  },
  {
    _id: 'activity-002',
    userId: userRef(MOCK_USER_IDS.pavel, 'Павел Смирнов'),
    type: 'visited_place',
    targetId: 'visited-030',
    targetType: 'VisitedPlace',
    metadata: { title: 'Тбилиси' },
    createdAt: isoDaysAgo(5),
  },
  {
    _id: 'activity-003',
    userId: userRef(MOCK_USER_IDS.anna, 'Анна Белова'),
    type: 'route',
    targetId: 'route-013',
    metadata: { name: 'Барселона — Гауди' },
    createdAt: isoDaysAgo(25),
  },
  {
    _id: 'activity-004',
    userId: userRef(MOCK_USER_IDS.nikita, 'Никита Зайцев'),
    type: 'geo_mark',
    targetId: 'mark-015',
    targetType: 'GeoMark',
    metadata: { title: 'Приют «Бочки» — Эльбрус' },
    createdAt: isoDaysAgo(16),
  },
  {
    _id: 'activity-005',
    userId: userRef(MOCK_USER_IDS.maria, 'Мария Соколова'),
    type: 'like',
    targetId: 'visited-001',
    targetType: 'VisitedPlace',
    metadata: { title: 'Париж' },
    createdAt: isoDaysAgo(270),
  },
  {
    _id: 'activity-006',
    userId: userRef(MOCK_USER_IDS.dmitry, 'Дмитрий Козлов'),
    type: 'route',
    targetId: 'route-003',
    metadata: { name: 'Байкал зимой' },
    createdAt: isoDaysAgo(32),
  },
  {
    _id: 'activity-007',
    userId: userRef(MOCK_USER_IDS.elena, 'Елена Морозова'),
    type: 'geo_mark',
    targetId: 'mark-008',
    targetType: 'GeoMark',
    metadata: { title: 'Сочи — набережная морпорта' },
    createdAt: isoDaysAgo(28),
  },
  {
    _id: 'activity-008',
    userId: userRef(MOCK_USER_IDS.alexey, 'Алексей Волков'),
    type: 'route',
    targetId: 'route-015',
    metadata: { name: 'Стамбул — базар и история' },
    createdAt: isoDaysAgo(15),
  },
  {
    _id: 'activity-009',
    userId: userRef(MOCK_USER_IDS.katya, 'Екатерина Лебедева'),
    type: 'visited_place',
    targetId: 'visited-024',
    targetType: 'VisitedPlace',
    metadata: { title: 'Шерегеш' },
    createdAt: isoDaysAgo(75),
  },
  {
    _id: 'activity-010',
    userId: userRef(MOCK_USER_IDS.olga, 'Ольга Новикова'),
    type: 'route',
    targetId: 'route-007',
    metadata: { name: 'Прибалтика: Рига и коса' },
    createdAt: isoDaysAgo(33),
  },
  {
    _id: 'activity-011',
    userId: userRef(MOCK_USER_IDS.sergey, 'Сергей Орлов'),
    type: 'visited_place',
    targetId: 'visited-019',
    targetType: 'VisitedPlace',
    metadata: { title: 'Киото' },
    createdAt: isoDaysAgo(9),
  },
  {
    _id: 'activity-012',
    userId: userRef(MOCK_USER_IDS.ivan, 'Иван Петров'),
    type: 'geo_mark',
    targetId: 'mark-012',
    targetType: 'GeoMark',
    metadata: { title: 'Телецкое озеро — смотровая' },
    createdAt: isoDaysAgo(22),
  },
  {
    _id: 'activity-013',
    userId: userRef(MOCK_USER_IDS.sofia, 'София Романова'),
    type: 'post',
    targetId: 'post-012',
    metadata: { preview: 'Нашла идеальный коворкинг в Убуде...' },
    createdAt: isoDaysAgo(7),
  },
  {
    _id: 'activity-014',
    userId: userRef(MOCK_USER_IDS.anna, 'Анна Белова'),
    type: 'event',
    targetId: 'event-003',
    metadata: { title: 'Встреча travel-блогеров в Барселоне' },
    createdAt: isoDaysAgo(20),
  },
  {
    _id: 'activity-015',
    userId: userRef(MOCK_USER_IDS.pavel, 'Павел Смирнов'),
    type: 'registration',
    createdAt: isoDaysAgo(60),
  },
  {
    _id: 'activity-016',
    userId: userRef(MOCK_USER_IDS.maria, 'Мария Соколова'),
    type: 'geo_mark',
    targetId: 'mark-027',
    targetType: 'GeoMark',
    metadata: { title: 'Флоренция — Piazza del Duomo' },
    createdAt: isoDaysAgo(12),
  },
  {
    _id: 'activity-017',
    userId: userRef(MOCK_USER_IDS.alexey, 'Алексей Волков'),
    type: 'visited_place',
    targetId: 'visited-004',
    targetType: 'VisitedPlace',
    metadata: { title: 'Стамбул' },
    createdAt: isoDaysAgo(15),
  },
  {
    _id: 'activity-018',
    userId: userRef(MOCK_USER_IDS.dmitry, 'Дмитрий Козлов'),
    type: 'like',
    targetId: 'mark-001',
    targetType: 'GeoMark',
    metadata: { title: 'Эйфелева башня' },
    createdAt: isoDaysAgo(43),
  },
  {
    _id: 'activity-019',
    userId: userRef(MOCK_USER_IDS.elena, 'Елена Морозова'),
    type: 'post',
    targetId: 'post-008',
    metadata: { preview: 'Лучший закат этим летом был в Сочи' },
    createdAt: isoDaysAgo(26),
  },
  {
    _id: 'activity-020',
    userId: userRef(MOCK_USER_IDS.katya, 'Екатерина Лебедева'),
    type: 'geo_mark',
    targetId: 'mark-028',
    targetType: 'GeoMark',
    metadata: { title: 'Хибины — озеро Малый Вудъявр' },
    createdAt: isoDaysAgo(10),
  },
  {
    _id: 'activity-021',
    userId: userRef(MOCK_USER_IDS.nikita, 'Никита Зайцев'),
    type: 'route',
    targetId: 'route-006',
    metadata: { name: 'Кавказ: Эльбрус и Домбай' },
    createdAt: isoDaysAgo(29),
  },
  {
    _id: 'activity-022',
    userId: userRef(MOCK_USER_IDS.olga, 'Ольга Новикова'),
    type: 'visited_place',
    targetId: 'visited-021',
    targetType: 'VisitedPlace',
    metadata: { title: 'Куршская коса' },
    createdAt: isoDaysAgo(33),
  },
  {
    _id: 'activity-023',
    userId: userRef(MOCK_USER_IDS.sergey, 'Сергей Орлов'),
    type: 'geo_mark',
    targetId: 'mark-013',
    targetType: 'GeoMark',
    metadata: { title: 'Русский мост' },
    createdAt: isoDaysAgo(20),
  },
  {
    _id: 'activity-024',
    userId: userRef(MOCK_USER_IDS.maria, 'Мария Соколова'),
    type: 'route',
    targetId: 'route-012',
    metadata: { name: 'Прага — исторический центр' },
    createdAt: isoDaysAgo(35),
  },
  {
    _id: 'activity-025',
    userId: userRef(MOCK_USER_IDS.alexey, 'Алексей Волков'),
    type: 'geo_mark',
    targetId: 'mark-003',
    targetType: 'GeoMark',
    metadata: { title: 'Сибуя — перекрёсток Синдзюку' },
    createdAt: isoDaysAgo(40),
  },
  {
    _id: 'activity-026',
    userId: userRef(MOCK_USER_IDS.sofia, 'София Романова'),
    type: 'route',
    targetId: 'route-009',
    metadata: { name: 'Бали: Убуд и пляж' },
    createdAt: isoDaysAgo(8),
  },
  {
    _id: 'activity-027',
    userId: userRef(MOCK_USER_IDS.anna, 'Анна Белова'),
    type: 'visited_place',
    targetId: 'visited-015',
    targetType: 'VisitedPlace',
    metadata: { title: 'Лиссабон' },
    createdAt: isoDaysAgo(42),
  },
  {
    _id: 'activity-028',
    userId: userRef(MOCK_USER_IDS.pavel, 'Павел Смирнов'),
    type: 'route',
    targetId: 'route-010',
    metadata: { name: 'Тосканское вино' },
    createdAt: isoDaysAgo(11),
  },
  {
    _id: 'activity-029',
    userId: userRef(MOCK_USER_IDS.ivan, 'Иван Петров'),
    type: 'visited_place',
    targetId: 'visited-017',
    targetType: 'VisitedPlace',
    metadata: { title: 'Таганай' },
    createdAt: isoDaysAgo(50),
  },
  {
    _id: 'activity-030',
    userId: userRef(MOCK_USER_IDS.elena, 'Елена Морозова'),
    type: 'event',
    targetId: 'event-006',
    metadata: { title: 'Дайвинг-выходные в Сочи' },
    createdAt: isoDaysAgo(14),
  },
];

export const mockRecommendedTags = [
  { name: 'европа', count: 48 },
  { name: 'горы', count: 32 },
  { name: 'море', count: 28 },
  { name: 'зима', count: 24 },
  { name: 'фотография', count: 21 },
  { name: 'гастрономия', count: 19 },
  { name: 'байкал', count: 15 },
  { name: 'кавказ', count: 14 },
  { name: 'номад', count: 12 },
  { name: 'хайкинг', count: 11 },
];

export function getMockActivityFeed(params: MockActivityFeedParams = {}): ActivityFeedResponse {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filtered = filterMockActivityItems(params);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return { items, total, page, totalPages };
}
