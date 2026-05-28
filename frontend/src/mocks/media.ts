import type { Media } from '@/types';
import { deterministicInt, isoDaysAgo, mockMediaPath } from './helpers';
import { mockVisitedPlaces } from './visited-places';

function createMedia(
  id: string,
  ownerId: string,
  seed: string,
  type: 'image' | 'video' = 'image',
  daysAgo = 30,
): Media {
  const ext = type === 'video' ? 'mp4' : 'jpg';
  const path = type === 'video'
    ? mockMediaPath(`${seed}-poster`, ext, 1280, 860)
    : mockMediaPath(seed, ext, 1280, 860);
  return {
    _id: id,
    originalName: `${seed}.${ext}`,
    mimeType: type === 'video' ? 'video/mp4' : 'image/jpeg',
    size: type === 'video' ? 4_500_000 : 850_000,
    path,
    thumbnailPath: mockMediaPath(`${seed}-thumb`, 'jpg', 360, 360),
    type,
    ownerId,
    createdAt: isoDaysAgo(daysAgo),
  };
}

export const mockMedia: Media[] = mockVisitedPlaces.flatMap((place) =>
  place.mediaIds.map((mediaId, index) => {
    const mediaType: 'image' | 'video' =
      deterministicInt(`${mediaId}:type`, 0, 9) === 0 ? 'video' : 'image';
    const daysAgo = deterministicInt(`${place._id}:${mediaId}:days`, 5, 520);
    const seed = `${place.title}-${index + 1}`.toLowerCase().replace(/\s+/g, '-');
    return createMedia(mediaId, place.userId, seed, mediaType, daysAgo);
  }),
);
