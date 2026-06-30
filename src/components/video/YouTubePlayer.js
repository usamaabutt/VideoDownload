import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { colors } from '@theme';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = width * (9 / 16);

const YouTubePlayer = ({ videoId, playing, onPlayingChange, thumbnailUri }) => {
  const [showPoster, setShowPoster] = useState(Boolean(thumbnailUri));

  useEffect(() => {
    setShowPoster(Boolean(thumbnailUri));
  }, [videoId, thumbnailUri]);

  return (
    <View style={styles.container}>
      {showPoster && thumbnailUri ? (
        <Image source={{ uri: thumbnailUri }} style={styles.poster} resizeMode="cover" />
      ) : null}
      <YoutubeIframe
        height={PLAYER_HEIGHT}
        width={width}
        videoId={videoId}
        play={playing}
        onChangeState={(state) => {
          if (state === 'playing' || state === 'buffering') {
            setShowPoster(false);
          }
          if (state === 'ended') {
            onPlayingChange(false);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    width,
    height: PLAYER_HEIGHT,
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default YouTubePlayer;
