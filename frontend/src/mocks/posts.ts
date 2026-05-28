import type { Post } from '@/types';
import type { PostsResponse } from '@/services/postsApi';
import { avatarUrl, isoDaysAgo } from './helpers';
import { MOCK_CURRENT_USER_ID, MOCK_USER_IDS } from './ids';

function author(id: string, name: string) {
  return { _id: id, name, avatarUrl: avatarUrl(id.replace('user-', '')) };
}

export const mockPosts: Post[] = [
  {
    _id: 'post-001',
    authorId: author(MOCK_CURRENT_USER_ID, 'Алексей Волков'),
    text: 'Вернулся из Стамбула — уже планирую маршрут по Каппадокии на весну.',
    mediaIds: ['media-030'],
    location: { lat: 41.0082, lng: 28.9784 },
    createdAt: isoDaysAgo(14),
    updatedAt: isoDaysAgo(14),
  },
  {
    _id: 'post-002',
    authorId: author(MOCK_USER_IDS.maria, 'Мария Соколова'),
    text: 'Флоренция в январе — без очередей в Уффици. Рекомендую бронировать заранее онлайн.',
    mediaIds: ['media-031'],
    createdAt: isoDaysAgo(12),
    updatedAt: isoDaysAgo(12),
  },
  {
    _id: 'post-003',
    authorId: author(MOCK_USER_IDS.dmitry, 'Дмитрий Козлов'),
    text: 'Байкальский лёд в этом году отличный. Каток у Листвянки работает до марта.',
    mediaIds: ['media-006'],
    createdAt: isoDaysAgo(28),
    updatedAt: isoDaysAgo(28),
  },
  {
    _id: 'post-004',
    authorId: author(MOCK_USER_IDS.anna, 'Анна Белова'),
    text: 'Лиссабон: трамвай 28 лучше брать с раннего утра, иначе только толпы.',
    mediaIds: ['media-025'],
    location: { lat: 38.7223, lng: -9.1393 },
    createdAt: isoDaysAgo(40),
    updatedAt: isoDaysAgo(40),
  },
  {
    _id: 'post-005',
    authorId: author(MOCK_USER_IDS.nikita, 'Никита Зайцев'),
    text: 'Эльбрус в августе: погода меняется за час. Берите ветровку даже в +20.',
    mediaIds: ['media-015'],
    createdAt: isoDaysAgo(15),
    updatedAt: isoDaysAgo(15),
  },
  {
    _id: 'post-006',
    authorId: author(MOCK_USER_IDS.katya, 'Екатерина Лебедева'),
    text: 'Шерегеш — снег уже лежит плотным слоем. Кто едет в феврале?',
    mediaIds: ['media-016'],
    createdAt: isoDaysAgo(70),
    updatedAt: isoDaysAgo(70),
  },
  {
    _id: 'post-007',
    authorId: author(MOCK_USER_IDS.pavel, 'Павел Смирнов'),
    text: 'Тбилиси: лучший хинкали на улице Вахтанга Горгасали, проверено лично.',
    mediaIds: ['media-035'],
    createdAt: isoDaysAgo(5),
    updatedAt: isoDaysAgo(5),
  },
  {
    _id: 'post-008',
    authorId: author(MOCK_USER_IDS.elena, 'Елена Морозова'),
    text: 'Лучший закат этим летом был в Сочи с набережной морпорта.',
    mediaIds: ['media-008'],
    createdAt: isoDaysAgo(26),
    updatedAt: isoDaysAgo(26),
  },
  {
    _id: 'post-009',
    authorId: author(MOCK_USER_IDS.olga, 'Ольга Новикова'),
    text: 'Куршская коса на велосипеде — 40 км за день реально, если стартовать рано.',
    mediaIds: ['media-027'],
    createdAt: isoDaysAgo(32),
    updatedAt: isoDaysAgo(32),
  },
  {
    _id: 'post-010',
    authorId: author(MOCK_USER_IDS.ivan, 'Иван Петров'),
    text: 'Таганай после дождя — тропы скользкие, но виды того стоят.',
    mediaIds: [],
    createdAt: isoDaysAgo(48),
    updatedAt: isoDaysAgo(48),
  },
  {
    _id: 'post-011',
    authorId: author(MOCK_USER_IDS.sergey, 'Сергей Орлов'),
    text: 'Киото в октябре — клены ещё зелёные, зато меньше туристов.',
    mediaIds: ['media-033'],
    createdAt: isoDaysAgo(9),
    updatedAt: isoDaysAgo(9),
  },
  {
    _id: 'post-012',
    authorId: author(MOCK_USER_IDS.sofia, 'София Романова'),
    text: 'Нашла идеальный коворкинг в Убуде с видом на рисовые террасы. Кидаю метку на карту.',
    mediaIds: ['media-019'],
    location: { lat: -8.5069, lng: 115.2625 },
    createdAt: isoDaysAgo(7),
    updatedAt: isoDaysAgo(7),
  },
  {
    _id: 'post-013',
    authorId: author(MOCK_CURRENT_USER_ID, 'Алексей Волков'),
    text: 'Кто был в Исландии в феврале? Нужны советы по маршруту на 7 дней без машины.',
    mediaIds: [],
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(3),
  },
  {
    _id: 'post-014',
    authorId: author(MOCK_USER_IDS.maria, 'Мария Соколова'),
    text: 'Прага + Вена за одну поездку — удобно на поезде, билеты лучше брать за 2 недели.',
    mediaIds: [],
    createdAt: isoDaysAgo(35),
    updatedAt: isoDaysAgo(35),
  },
  {
    _id: 'post-015',
    authorId: author(MOCK_USER_IDS.anna, 'Анна Белова'),
    text: 'Барселона: билет в Саграду без очереди — только слоты на 9:00 утра.',
    mediaIds: ['media-010'],
    createdAt: isoDaysAgo(54),
    updatedAt: isoDaysAgo(54),
  },
  {
    _id: 'post-016',
    authorId: author(MOCK_USER_IDS.pavel, 'Павел Смирнов'),
    text: 'Тоскана на арендованном авто — винодельни бронируйте по телефону, не все на Booking.',
    mediaIds: ['media-018'],
    createdAt: isoDaysAgo(10),
    updatedAt: isoDaysAgo(10),
  },
  {
    _id: 'post-017',
    authorId: author(MOCK_USER_IDS.sofia, 'София Романова'),
    text: 'Порту: подъём по улицам с сапатари — ноги устанут, зато виды супер.',
    mediaIds: ['media-034'],
    createdAt: isoDaysAgo(98),
    updatedAt: isoDaysAgo(98),
  },
  {
    _id: 'post-018',
    authorId: author(MOCK_USER_IDS.dmitry, 'Дмитрий Козлов'),
    text: 'Казань в августе — жара, но набережная Казанки вечером спасает.',
    mediaIds: [],
    createdAt: isoDaysAgo(240),
    updatedAt: isoDaysAgo(240),
  },
  {
    _id: 'post-019',
    authorId: author(MOCK_USER_IDS.katya, 'Екатерина Лебедева'),
    text: 'Хибины: магазин снаряжения в Апатитах дешевле, чем в Москве на 15%.',
    mediaIds: [],
    createdAt: isoDaysAgo(440),
    updatedAt: isoDaysAgo(440),
  },
  {
    _id: 'post-020',
    authorId: author(MOCK_USER_IDS.elena, 'Елена Морозова'),
    text: 'Дайвинг в Большом Сочи — вода +22 в сентябре, видимость до 12 м.',
    mediaIds: ['media-009'],
    createdAt: isoDaysAgo(27),
    updatedAt: isoDaysAgo(27),
  },
];

let runtimePosts: Post[] = structuredClone(mockPosts);

function getAuthorId(post: Post): string {
  return typeof post.authorId === 'string' ? post.authorId : post.authorId._id;
}

export function getMockPostsResponse(page = 1, limit = 10, userId?: string): PostsResponse {
  const filtered = userId
    ? runtimePosts.filter((post) => getAuthorId(post) === userId)
    : runtimePosts;

  const start = (page - 1) * limit;
  const posts = filtered.slice(start, start + limit);
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return { posts, total, page, totalPages };
}

export function mockCreatePost(payload: {
  text: string;
  mediaIds?: string[];
  location?: Post['location'];
}): Post {
  const now = new Date().toISOString();
  const post: Post = {
    _id: `post-mock-${Date.now()}`,
    authorId: author(MOCK_CURRENT_USER_ID, 'Алексей Волков'),
    text: payload.text,
    mediaIds: payload.mediaIds ?? [],
    location: payload.location,
    createdAt: now,
    updatedAt: now,
  };

  runtimePosts.unshift(post);
  return post;
}

export function mockUpdatePost(
  id: string,
  payload: { text?: string; mediaIds?: string[]; location?: Post['location'] },
): Post {
  const post = runtimePosts.find((item) => item._id === id);
  if (!post) {
    throw new Error('Post not found');
  }

  if (payload.text !== undefined) {
    post.text = payload.text;
  }
  if (payload.mediaIds !== undefined) {
    post.mediaIds = payload.mediaIds;
  }
  if (payload.location !== undefined) {
    post.location = payload.location;
  }
  post.updatedAt = new Date().toISOString();

  return post;
}

export function mockRemovePost(id: string): void {
  runtimePosts = runtimePosts.filter((post) => post._id !== id);
}
