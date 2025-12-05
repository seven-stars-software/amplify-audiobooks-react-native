//@ts-nocheck

import { StyleSheet, Dimensions } from 'react-native';
import Video from 'react-native-video';
import VideoSource from '@assets/video/abstract-neon-bg.mp4';

const width = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

const AnimatedBG = () => {
    return (
        <Video
            rate={0.3}
            style={styles.video}
            source={VideoSource}
            useNativeControls={false}
            resizeMode="cover"
            repeat={true}
            playInBackground={false}
            playWhenInactive={false}
            allowsExternalPlayback={false}
            muted={true}
            pictureInPicture={false}
        />
    );
};

const styles = StyleSheet.create({
    video: {
        alignSelf: 'center',
        width: width,
        height: height,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});


export default AnimatedBG;
