import type { Media } from '@/types';
import { deterministicInt, isoDaysAgo, mockMediaPath } from './helpers';
import { mockGeoMarks } from './geo-marks';
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

function buildMediaFromSources(
  sources: Array<{ ownerId: string; title: string; mediaIds: string[] }>,
): Media[] {
  const byId = new Map<string, Media>();

  sources.forEach((source) => {
    source.mediaIds.forEach((mediaId, index) => {
      if (byId.has(mediaId)) return;

      const mediaType: 'image' | 'video' =
        deterministicInt(`${mediaId}:type`, 0, 9) === 0 ? 'video' : 'image';
      const daysAgo = deterministicInt(`${source.ownerId}:${mediaId}:days`, 5, 520);
      const seed = `${source.title}-${index + 1}`.toLowerCase().replace(/\s+/g, '-');
      byId.set(
        mediaId,
        createMedia(mediaId, source.ownerId, seed, mediaType, daysAgo),
      );
    });
  });

  return Array.from(byId.values());
}

export const mockMedia: Media[] = buildMediaFromSources([
  ...mockVisitedPlaces.map((place) => ({
    ownerId: place.userId,
    title: place.title,
    mediaIds: place.mediaIds,
  })),
  ...mockGeoMarks.map((mark) => ({
    ownerId: mark.authorId,
    title: mark.title,
    mediaIds: mark.mediaIds,
  })),
]);
