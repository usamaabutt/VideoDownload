import {
  isSupportedVideoUrl,
  normalizeVideoUrlInput,
  detectPlatform,
} from '../src/utils/videoUrl';

const TIKTOK_URL =
  'https://www.tiktok.com/@zulfiali59/video/7645582004599229703?_r=1&_t=ZS-96uObr2EFhH';

describe('videoUrl', () => {
  it('accepts standard TikTok video URLs with @ in path', () => {
    expect(isSupportedVideoUrl(TIKTOK_URL)).toBe(true);
    expect(detectPlatform(TIKTOK_URL)).toBe('tiktok');
  });

  it('normalizes bare TikTok domains and share text', () => {
    expect(
      normalizeVideoUrlInput(
        'Check this out https://www.tiktok.com/@zulfiali59/video/7645582004599229703',
      ),
    ).toBe('https://www.tiktok.com/@zulfiali59/video/7645582004599229703');

    expect(
      isSupportedVideoUrl('www.tiktok.com/@zulfiali59/video/7645582004599229703'),
    ).toBe(true);
  });

  it('accepts vm.tiktok.com short links', () => {
    expect(isSupportedVideoUrl('https://vm.tiktok.com/ZMhTest123/')).toBe(true);
  });
});
