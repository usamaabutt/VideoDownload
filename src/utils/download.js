import { DOWNLOAD_STATUS } from '@config/routes';

export const isActiveDownload = (item) =>
  item?.status === DOWNLOAD_STATUS.DOWNLOADING ||
  item?.status === DOWNLOAD_STATUS.SAVING;

export const countActiveDownloads = (activeMap) =>
  Object.values(activeMap).filter(isActiveDownload).length;

export const listActiveDownloads = (activeMap) =>
  Object.values(activeMap).filter(isActiveDownload);
