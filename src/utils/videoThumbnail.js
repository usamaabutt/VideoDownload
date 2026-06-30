export const getVideoThumbnailUri = (video) => {
  if (!video) return null;
  const id = video.videoId || video.id;
  const fallback = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  return video.thumbnail || video.thumbnailHigh || fallback || null;
};
