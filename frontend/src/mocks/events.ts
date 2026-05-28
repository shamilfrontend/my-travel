import type { TravelEvent } from '@/types';
import { avatarUrl, isoDaysAgo, isoDaysFromNow } from './helpers';
import { MOCK_CURRENT_USER_ID, MOCK_USER_IDS } from './ids';

function organizer(id: string, name: string) {
  return { _id: id, name, avatarUrl: avatarUrl(id.replace('user-', '')) };
}

export const mockPublicEvents: TravelEvent[] = [
  {
    _id: 'event-001',
    organizerId: organizer(MOCK_USER_IDS.anna, 'Анна Белова'),
    title: 'Пешая прогулка по Барселоне',
    description: 'Готический квартал, Борн и пляж Barceloneta. 4–5 часов.',
    location: 'Барселона, Испания',
    coordinates: { lat: 41.3874, lng: 2.1686 },
    startDate: isoDaysFromNow(14),
    endDate: isoDaysFromNow(14),
    participantIds: [MOCK_USER_IDS.maria, MOCK_USER_IDS.pavel],
    isPublic: true,
    createdAt: isoDaysAgo(20),
    updatedAt: isoDaysAgo(18),
  },
  {
    _id: 'event-002',
    organizerId: organizer(MOCK_USER_IDS.dmitry, 'Дмитрий Козлов'),
    title: 'Зимний Байкал — выезд на лёд',
    description: 'Ольхон, коньки, фотосессия на закате. Нужны тёплые вещи.',
    location: 'Ольхон, Россия',
    coordinates: { lat: 53.1558, lng: 107.4028 },
    startDate: isoDaysFromNow(45),
    endDate: isoDaysFromNow(48),
    participantIds: [MOCK_USER_IDS.katya, MOCK_CURRENT_USER_ID],
    isPublic: true,
    createdAt: isoDaysAgo(30),
    updatedAt: isoDaysAgo(25),
  },
  {
    _id: 'event-003',
    organizerId: organizer(MOCK_USER_IDS.anna, 'Анна Белова'),
    title: 'Встреча travel-блогеров в Барселоне',
    description: 'Неформальный нетворкинг в кафе El Nacional.',
    location: 'Barcelona, Passeig de Gràcia',
    coordinates: { lat: 41.3917, lng: 2.1649 },
    startDate: isoDaysFromNow(7),
    participantIds: [MOCK_USER_IDS.sofia, MOCK_USER_IDS.maria, MOCK_USER_IDS.olga],
    isPublic: true,
    createdAt: isoDaysAgo(25),
    updatedAt: isoDaysAgo(20),
  },
  {
    _id: 'event-004',
    organizerId: organizer(MOCK_USER_IDS.nikita, 'Никита Зайцев'),
    title: 'Треккинг в Домбае',
    description: 'Подъём к озеру Голубое, уровень — средний.',
    location: 'Домбай, Карачаево-Черкесия',
    coordinates: { lat: 43.2917, lng: 41.6212 },
    startDate: isoDaysFromNow(21),
    endDate: isoDaysFromNow(23),
    participantIds: [MOCK_USER_IDS.ivan],
    isPublic: true,
    createdAt: isoDaysAgo(15),
    updatedAt: isoDaysAgo(15),
  },
  {
    _id: 'event-005',
    organizerId: organizer(MOCK_USER_IDS.maria, 'Мария Соколова'),
    title: 'Музейный марафон в Праге',
    description: 'Национальный музей + Вышеград за один день.',
    location: 'Прага, Чехия',
    coordinates: { lat: 50.0755, lng: 14.4378 },
    startDate: isoDaysFromNow(30),
    participantIds: [],
    isPublic: true,
    createdAt: isoDaysAgo(10),
    updatedAt: isoDaysAgo(10),
  },
  {
    _id: 'event-006',
    organizerId: organizer(MOCK_USER_IDS.elena, 'Елена Морозова'),
    title: 'Дайвинг-выходные в Сочи',
    description: '2 погружения для сертифицированных дайверов.',
    location: 'Большой Сочи',
    coordinates: { lat: 43.4021, lng: 39.9562 },
    startDate: isoDaysFromNow(10),
    endDate: isoDaysFromNow(11),
    participantIds: [MOCK_USER_IDS.elena],
    isPublic: true,
    createdAt: isoDaysAgo(14),
    updatedAt: isoDaysAgo(14),
  },
  {
    _id: 'event-007',
    organizerId: organizer(MOCK_USER_IDS.sofia, 'София Романова'),
    title: 'Коворкинг-тур по Бали',
    description: 'Убуд + Чангу, обмен опытом remote work.',
    location: 'Бали, Индонезия',
    coordinates: { lat: -8.5069, lng: 115.2625 },
    startDate: isoDaysFromNow(60),
    endDate: isoDaysFromNow(67),
    participantIds: [MOCK_USER_IDS.sofia, MOCK_USER_IDS.pavel],
    isPublic: true,
    createdAt: isoDaysAgo(8),
    updatedAt: isoDaysAgo(8),
  },
  {
    _id: 'event-008',
    organizerId: organizer(MOCK_USER_IDS.olga, 'Ольга Новикова'),
    title: 'Велопоездка по Куршской косе',
    location: 'Калининградская область',
    coordinates: { lat: 55.1694, lng: 20.8603 },
    startDate: isoDaysFromNow(18),
    participantIds: [MOCK_USER_IDS.olga, MOCK_USER_IDS.maria],
    isPublic: true,
    createdAt: isoDaysAgo(12),
    updatedAt: isoDaysAgo(12),
  },
];

export const mockMyEvents: TravelEvent[] = [
  {
    _id: 'event-101',
    organizerId: organizer(MOCK_CURRENT_USER_ID, 'Алексей Волков'),
    title: 'Стамбул — гастро-тур',
    description: 'Базар, рыбный рынок, кофе в Каракёе. Только для друзей.',
    location: 'Стамбул',
    coordinates: { lat: 41.0106, lng: 28.968 },
    startDate: isoDaysFromNow(5),
    participantIds: [MOCK_USER_IDS.maria, MOCK_USER_IDS.dmitry],
    isPublic: false,
    createdAt: isoDaysAgo(20),
    updatedAt: isoDaysAgo(15),
  },
  {
    _id: 'event-102',
    organizerId: organizer(MOCK_CURRENT_USER_ID, 'Алексей Волков'),
    title: 'Планирование поездки в Исландию',
    description: 'Созвон в Zoom, делимся маршрутами и бюджетом.',
    startDate: isoDaysFromNow(3),
    participantIds: [MOCK_USER_IDS.anna, MOCK_USER_IDS.katya],
    isPublic: false,
    createdAt: isoDaysAgo(5),
    updatedAt: isoDaysAgo(5),
  },
];

let runtimePublicEvents: TravelEvent[] = structuredClone(mockPublicEvents);
let runtimeMyEvents: TravelEvent[] = structuredClone(mockMyEvents);

function findMockEvent(id: string): TravelEvent | undefined {
  return runtimePublicEvents.find((event) => event._id === id)
    ?? runtimeMyEvents.find((event) => event._id === id);
}

export function getMockPublicEvents(): TravelEvent[] {
  return runtimePublicEvents;
}

export function getMockMyEvents(): TravelEvent[] {
  return runtimeMyEvents;
}

export function mockCreateEvent(payload: {
  title: string;
  description?: string;
  location?: string;
  coordinates?: TravelEvent['coordinates'];
  startDate: string;
  endDate?: string;
  isPublic?: boolean;
}): TravelEvent {
  const now = new Date().toISOString();
  const event: TravelEvent = {
    _id: `event-mock-${Date.now()}`,
    organizerId: organizer(MOCK_CURRENT_USER_ID, 'Алексей Волков'),
    title: payload.title,
    description: payload.description,
    location: payload.location,
    coordinates: payload.coordinates,
    startDate: payload.startDate,
    endDate: payload.endDate,
    participantIds: [],
    isPublic: payload.isPublic ?? false,
    createdAt: now,
    updatedAt: now,
  };

  runtimeMyEvents.unshift(event);
  if (event.isPublic) {
    runtimePublicEvents.unshift(event);
  }

  return event;
}

export function mockJoinEvent(id: string): TravelEvent {
  const event = findMockEvent(id);
  if (!event) {
    throw new Error('Event not found');
  }

  if (!event.participantIds.includes(MOCK_CURRENT_USER_ID)) {
    event.participantIds.push(MOCK_CURRENT_USER_ID);
  }

  event.updatedAt = new Date().toISOString();
  return event;
}

export function mockLeaveEvent(id: string): void {
  const event = findMockEvent(id);
  if (!event) {
    return;
  }

  event.participantIds = event.participantIds.filter(
    (participantId) => participantId !== MOCK_CURRENT_USER_ID,
  );
  event.updatedAt = new Date().toISOString();
}

export function mockRemoveEvent(id: string): void {
  runtimePublicEvents = runtimePublicEvents.filter((event) => event._id !== id);
  runtimeMyEvents = runtimeMyEvents.filter((event) => event._id !== id);
}
