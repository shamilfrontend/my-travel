import type { Media } from '@/types';
import { isoDaysAgo, mockMediaPath } from './helpers';
import { MOCK_USER_IDS } from './ids';

function createMedia(
  id: string,
  ownerId: string,
  seed: string,
  type: 'image' | 'video' = 'image',
  daysAgo = 30,
): Media {
  const ext = type === 'video' ? 'mp4' : 'jpg';
  const path = mockMediaPath(seed, ext);
  return {
    _id: id,
    originalName: `${seed}.${ext}`,
    mimeType: type === 'video' ? 'video/mp4' : 'image/jpeg',
    size: type === 'video' ? 4_500_000 : 850_000,
    path,
    thumbnailPath: mockMediaPath(`${seed}-thumb`),
    type,
    ownerId,
    createdAt: isoDaysAgo(daysAgo),
  };
}

export const mockMedia: Media[] = [
  createMedia('media-001', MOCK_USER_IDS.alexey, 'eiffel-tower', 'image', 45),
  createMedia('media-002', MOCK_USER_IDS.alexey, 'colosseum', 'image', 44),
  createMedia('media-003', MOCK_USER_IDS.alexey, 'tokyo-night', 'image', 40),
  createMedia('media-004', MOCK_USER_IDS.maria, 'louvre', 'image', 38),
  createMedia('media-005', MOCK_USER_IDS.maria, 'prague-bridge', 'image', 35),
  createMedia('media-006', MOCK_USER_IDS.dmitry, 'baikal-ice', 'image', 32),
  createMedia('media-007', MOCK_USER_IDS.dmitry, 'kazan-kremlin', 'image', 30),
  createMedia('media-008', MOCK_USER_IDS.elena, 'sochi-sunset', 'image', 28),
  createMedia('media-009', MOCK_USER_IDS.elena, 'diving-coral', 'video', 27),
  createMedia('media-010', MOCK_USER_IDS.anna, 'barcelona-sagrada', 'image', 25),
  createMedia('media-011', MOCK_USER_IDS.anna, 'amsterdam-canal', 'image', 24),
  createMedia('media-012', MOCK_USER_IDS.ivan, 'altai-lake', 'image', 22),
  createMedia('media-013', MOCK_USER_IDS.sergey, 'vladivostok-bridge', 'image', 20),
  createMedia('media-014', MOCK_USER_IDS.olga, 'riga-old-town', 'image', 18),
  createMedia('media-015', MOCK_USER_IDS.nikita, 'elbrus-summit', 'image', 16),
  createMedia('media-016', MOCK_USER_IDS.katya, 'sheregesh-slope', 'image', 14),
  createMedia('media-017', MOCK_USER_IDS.katya, 'listvyanka-pier', 'image', 13),
  createMedia('media-018', MOCK_USER_IDS.pavel, 'tuscany-vineyard', 'image', 11),
  createMedia('media-019', MOCK_USER_IDS.sofia, 'bali-rice', 'image', 8),
  createMedia('media-020', MOCK_USER_IDS.sofia, 'canggu-surf', 'video', 7),
  createMedia('media-021', MOCK_USER_IDS.alexey, 'petra-rocks', 'image', 60),
  createMedia('media-022', MOCK_USER_IDS.maria, 'vienna-cafe', 'image', 55),
  createMedia('media-023', MOCK_USER_IDS.dmitry, 'ural-mountains', 'image', 50),
  createMedia('media-024', MOCK_USER_IDS.elena, 'gelendzhik-cliff', 'image', 48),
  createMedia('media-025', MOCK_USER_IDS.anna, 'lisbon-tram', 'image', 42),
  createMedia('media-026', MOCK_USER_IDS.ivan, 'novosibirsk-opera', 'image', 36),
  createMedia('media-027', MOCK_USER_IDS.olga, 'curonian-spit', 'image', 33),
  createMedia('media-028', MOCK_USER_IDS.nikita, 'dombai-valley', 'image', 29),
  createMedia('media-029', MOCK_USER_IDS.pavel, 'bordeaux-wine', 'image', 21),
  createMedia('media-030', MOCK_USER_IDS.alexey, 'istanbul-bazaar', 'image', 15),
  createMedia('media-031', MOCK_USER_IDS.maria, 'florence-duomo', 'image', 12),
  createMedia('media-032', MOCK_USER_IDS.katya, 'khibiny-tundra', 'image', 10),
  createMedia('media-033', MOCK_USER_IDS.sergey, 'japan-fushimi', 'image', 9),
  createMedia('media-034', MOCK_USER_IDS.sofia, 'porto-azulejo', 'image', 6),
  createMedia('media-035', MOCK_USER_IDS.pavel, 'georgia-khinkali', 'image', 5),
];
