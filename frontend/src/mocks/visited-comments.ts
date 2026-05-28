import { deterministicInt, isoDaysAgo } from './helpers';
import { mockUsers } from './users';
import { mockVisitedPlaces } from './visited-places';

export interface MockVisitedComment {
  text: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
}

const commentTemplates = [
  'Очень атмосферное место, добавил(а) в свой список.',
  'Классная точка, спасибо за рекомендацию.',
  'Сохранил(а) себе маршрут к этой локации.',
  'Выглядит как идеальное место для выходных.',
  'Судя по фото, там отличный вид на закате.',
  'Кто-нибудь был здесь весной? Как с погодой?',
  'Отличный выбор, давно хотел(а) сюда заехать.',
  'После твоего поста тоже захотелось съездить.',
  'Очень живописно, особенно для фото-прогулки.',
  'Добавь, пожалуйста, пару советов по логистике.',
  'Интересно, сколько времени уходит на осмотр?',
  'Точка огонь, беру на заметку для отпуска.',
];

function pickUser(seed: string) {
  const index = deterministicInt(`${seed}:user`, 0, mockUsers.length - 1);
  return mockUsers[index];
}

function buildCommentsForPlace(placeId: string, placeTitle: string): MockVisitedComment[] {
  const count = deterministicInt(`${placeId}:comments`, 10, 50);
  return Array.from({ length: count }, (_item, index) => {
    const user = pickUser(`${placeId}:${index}`);
    const templateIndex = deterministicInt(`${placeId}:${index}:template`, 0, commentTemplates.length - 1);
    const text = `${commentTemplates[templateIndex]} (${placeTitle})`;
    const daysAgo = deterministicInt(`${placeId}:${index}:days`, 2, 540);
    return {
      text,
      authorId: user._id,
      authorName: user.name,
      authorAvatarUrl: user.avatarUrl,
      createdAt: isoDaysAgo(daysAgo),
    };
  });
}

export const mockVisitedPlaceComments: Record<string, MockVisitedComment[]> =
  Object.fromEntries(
    mockVisitedPlaces.map((place) => [
      place._id,
      buildCommentsForPlace(place._id, place.title),
    ]),
  );
