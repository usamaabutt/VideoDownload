import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { colors } from '@theme';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = width * (9 / 16);

const YouTubePlayer = ({ videoId, playing, onPlayingChange }) => (
  <View style={styles.container}>
    <YoutubeIframe
      height={PLAYER_HEIGHT}
      width={width}
      videoId={videoId}
      play={playing}
      onChangeState={(state) => {
        if (state === 'ended') onPlayingChange(false);
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
  },
});

export default YouTubePlayer;
