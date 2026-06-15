const trackers = {};

export function trackDownloadSpeed(videoId, received) {
  const now = Date.now();
  const prev = trackers[videoId];

  if (!prev) {
    trackers[videoId] = { received, time: now, speed: 0 };
    return 0;
  }

  const deltaBytes = received - prev.received;
  const deltaSec = (now - prev.time) / 1000;

  let instantSpeed = prev.speed;
  if (deltaSec >= 0.3 && deltaBytes >= 0) {
    instantSpeed = deltaBytes / deltaSec;
  }

  const smoothed =
    instantSpeed > 0 ? prev.speed * 0.55 + instantSpeed * 0.45 : prev.speed;

  trackers[videoId] = { received, time: now, speed: smoothed };
  return smoothed;
}

export function clearSpeedTracker(videoId) {
  delete trackers[videoId];
}
