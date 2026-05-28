export interface User {
  _id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  birthDate?: string;
  city?: string;
  bio?: string;
  interests?: string[];
  profilePrivacy?: 'public';
  emailNotifications?: {
    likes?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoMark {
  _id: string;
  title: string;
  description?: string;
  coordinates: Coordinates;
  authorId: string;
  mediaIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TravelRoute {
  _id: string;
  name: string;
  description?: string;
  geoMarkIds: string[];
  geoMarks?: GeoMark[];
  authorId: string;
  author?: { _id: string; name: string; avatarUrl?: string };
  isPublic: boolean;
  distanceKm?: number;
  copyCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VisitedPlace {
  _id: string;
  userId: string;
  title: string;
  coordinates: Coordinates;
  visitedDate?: string;
  note?: string;
  mediaIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  thumbnailPath: string;
  type: 'image' | 'video';
  ownerId: string;
  createdAt: string;
}

export interface Like {
  _id: string;
  userId: string;
  targetType: 'GeoMark' | 'VisitedPlace';
  targetId: string;
  createdAt: string;
}

export interface VisitedStatistics {
  totalPlaces: number;
  countries: string[];
  countryCodes: string[];
  years: number[];
}

export interface UserWithStats {
  _id: string;
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  birthDate?: string;
  city?: string;
  bio?: string;
  interests?: string[];
  createdAt: string;
  visitedCount: number;
  countriesCount: number;
  citiesCount?: number;
  wishlistCount?: number;
  publicRoutesCount?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ActivityItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  type: 'geo_mark' | 'route' | 'visited_place' | 'like' | 'registration' | 'post' | 'event';
  targetId?: string;
  targetType?: 'GeoMark' | 'Route' | 'VisitedPlace';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityFeedResponse {
  items: ActivityItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RecommendedTag {
  name: string;
  count: number;
}

export interface AppNotification {
  _id: string;
  type: 'like';
  actorId: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  targetId?: string;
  targetType?: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Post {
  _id: string;
  authorId: string | { _id: string; name: string; avatarUrl?: string };
  text: string;
  mediaIds: string[];
  location?: Coordinates;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistPlace {
  _id: string;
  userId: string;
  title: string;
  coordinates: Coordinates;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelEvent {
  _id: string;
  organizerId: string | { _id: string; name: string; avatarUrl?: string };
  title: string;
  description?: string;
  location?: string;
  coordinates?: Coordinates;
  startDate: string;
  endDate?: string;
  participantIds: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
