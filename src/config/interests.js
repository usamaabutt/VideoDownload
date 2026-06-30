export const ONBOARDING_SLIDES = [
  {
    id: 'download',
    icon: 'download-cloud',
    title: 'Download from anywhere',
    description:
      'Paste a link from YouTube, TikTok, Instagram, or Facebook and save videos directly to your gallery.',
    highlights: ['Multi-platform', 'HD quality', 'Fast saves'],
  },
  {
    id: 'edit',
    icon: 'sliders',
    title: 'Edit without limits',
    description:
      'Trim, compress, merge, and share videos with built-in tools — no subscription required.',
    highlights: ['Trim & crop', 'Compress', 'Merge clips'],
  },
  {
    id: 'discover',
    icon: 'play-circle',
    title: 'Watch & organize',
    description:
      'Browse trending videos, manage downloads, and keep everything in one clean library.',
    highlights: ['Trending feed', 'My files', 'Quick search'],
  },
];

export const FEED_INTERESTS = [
  { id: '10', label: 'Music', icon: 'music', color: '#E91E63' },
  { id: '20', label: 'Gaming', icon: 'cpu', color: '#7B1FA2' },
  { id: '24', label: 'Entertainment', icon: 'film', color: '#FF5722' },
  { id: '25', label: 'News', icon: 'globe', color: '#1976D2' },
  { id: '17', label: 'Sports', icon: 'activity', color: '#388E3C' },
  { id: '22', label: 'Vlogs', icon: 'video', color: '#F57C00' },
  { id: '27', label: 'Education', icon: 'book-open', color: '#0097A7' },
  { id: '28', label: 'Science', icon: 'zap', color: '#5C6BC0' },
  { id: '26', label: 'How-to', icon: 'tool', color: '#6D4C41' },
  { id: '1', label: 'Film', icon: 'tv', color: '#C62828' },
];

export const MIN_INTERESTS = 1;
export const MAX_INTERESTS = 6;

export const getInterestById = (id) => FEED_INTERESTS.find((item) => item.id === id);

export const getInterestLabel = (id) => getInterestById(id)?.label ?? 'Videos';

export const getInterestLabels = (ids = []) =>
  ids.map(getInterestLabel).filter(Boolean).join(' · ');
