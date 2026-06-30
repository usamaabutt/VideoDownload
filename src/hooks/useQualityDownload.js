import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import useDownloadStore from '@store/downloadStore';
import {
  fetchDownloadInfo,
  fetchUrlDownloadInfo,
} from '@services/download';
import QualityPickerModal from '@components/download/QualityPickerModal';
import { logger } from '@utils/logger';
import { getVideoThumbnailUri } from '@utils/videoThumbnail';

const EMPTY_PICKER = {
  visible: false,
  title: '',
  thumbnail: null,
  video: null,
  qualities: [],
  loading: false,
};

export default function useQualityDownload({ onStarted } = {}) {
  const downloadVideo = useDownloadStore((s) => s.downloadVideo);
  const [picker, setPicker] = useState(EMPTY_PICKER);

  const closePicker = useCallback(() => {
    setPicker(EMPTY_PICKER);
  }, []);

  const startQualityDownload = useCallback(async (video) => {
    setPicker({
      visible: true,
      title: video.title || 'Video',
      thumbnail: getVideoThumbnailUri(video),
      video,
      qualities: [],
      loading: true,
    });

    try {
      const info = video.sourceUrl
        ? await fetchUrlDownloadInfo(video.sourceUrl)
        : await fetchDownloadInfo(video.videoId || video.id);

      const qualities = info.qualities?.length
        ? info.qualities
        : [{ height: 0, label: 'Best available', fileSize: info.fileSize || 0 }];

      setPicker({
        visible: true,
        title: info.title || video.title || 'Video',
        thumbnail: getVideoThumbnailUri({ ...video, ...info }),
        video: { ...video, ...info },
        qualities,
        loading: false,
      });
    } catch (err) {
      logger.error('Download', 'Quality fetch failed', { message: err.message });
      setPicker(EMPTY_PICKER);
      Alert.alert(
        'Could not fetch qualities',
        err.response?.data?.error || err.message || 'Try again in a moment.',
      );
    }
  }, []);

  const startUrlQualityDownload = useCallback(async (sourceUrl) => {
    await startQualityDownload({ sourceUrl, title: 'Imported video' });
  }, [startQualityDownload]);

  const handleSelectQuality = useCallback(
    async (quality) => {
      const video = picker.video;
      if (!video) return;

      closePicker();

      const started = await downloadVideo(video, {
        qualityHeight: quality.height || null,
        knownTotal: quality.fileSize || video.fileSize || 0,
      });

      if (started) {
        onStarted?.();
      }
    },
    [picker.video, closePicker, downloadVideo, onStarted],
  );

  const pickerModal = (
    <QualityPickerModal
      visible={picker.visible}
      title={picker.title}
      thumbnail={picker.thumbnail}
      qualities={picker.qualities}
      loading={picker.loading}
      onSelect={handleSelectQuality}
      onClose={closePicker}
    />
  );

  return {
    pickerModal,
    startQualityDownload,
    startUrlQualityDownload,
  };
}
