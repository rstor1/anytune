import React, { useState, useEffect, useRef } from 'react';
import { Text, View, FlatList, SafeAreaView, TouchableOpacity, StatusBar, StyleSheet, Animated, Dimensions } from 'react-native';
import { getAllTracks } from './../utils/getTracks';
import TrackPlayer, {
Capability,
Event,
RepeatMode,
State,
usePlaybackState,
useProgress,
useTrackPlayerEvents
} from 'react-native-track-player';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Icon from 'react-native-vector-icons/Ionicons';


const PlayerScreen = ({ navigation }) => {
    const screen = Dimensions.get('screen');
    const [selectedId, setSelectedId] = useState(null);
    const [playerTracks, setPlayerTracks] = useState([]);
    const [tracksArr, setTracksArr] = useState([]);
    const [queueTracks, setQueueTracks] = useState([]);
    let tracks = useRef([]);
    const playbackState = usePlaybackState();
    const [playPauseIcon, setplayPauseIcon] = useState('ios-play-outline');
    const animation = useRef(new Animated.Value(screen.width*-1)).current;
    const [songTitle, setSongTitle] = useState('');
    const [songTitleLength, setSongTitleLength] = useState(0);
    const [shuffleText, setShuffleText] = useState('');
    const [isShuffleOn, setIsShuffleOn] = useState(false);
    const currentTrackIdRef = useRef(-1);
    const songTitleRef = useRef('');
    
    

    useEffect(() => {  
          getAllTracks().then((results) => {
            if (results.length !== 0) {
                tracks = results;
                addTracksToPlayer(tracks).then((data) => {
                  //So far do nothing here...
                  // setPlayerTracks(data);
                  // setQueueTracks(data);
                })
            }
           }).catch((error) => {
            console.log(error);
           });
          
      }, []);

    const startAnimation = () => {
        Animated.loop(
        Animated.timing(animation, {
          toValue: screen.width,
          duration: 15000,
          useNativeDriver: true,
        })).start();
      }

    const stopAnimation = () => {
        animation.setValue(screen.width*-1);
        Animated.timing(
          animation
        ).stop();
      }

    const addTracksToPlayer = async(data) => {
        const dirs = ReactNativeBlobUtil.fs.dirs;
        const arr = [];
        let title = '';
        // First remove .DS Store elememt?
        data.forEach((item, index) => {
          const track = {
            id: index+1,
            url: 'file:///' + dirs.DocumentDir + '/tracks/'+ item, // Load media from the file system
            title: item.replace(/\.[^/.]+$/, "")
        };
        arr.push(track);
        });
        setTracksArr(arr);
        setPlayerTracks(arr);
        await TrackPlayer.add(arr);
      }

    const singleTrackPlayBack = async (playbackState, item) => {
        setSelectedId(item.id);
        const currentTrack = await TrackPlayer.getCurrentTrack();

        if (playbackState == State.Paused) {
          if (currentTrackIdRef.current != item.id) {
            await setTrackToPlay(item);
            startAnimation();
            setplayPauseIcon('ios-pause-outline');
          } else {
            await TrackPlayer.play();
          }
        }
        if (playbackState == State.None && currentTrack == null && item != null && currentTrack != item.id) {
          await setCurrentSongTitle();
          startAnimation();
          await setTrackToPlay(item);
        }
        if (playbackState == State.Playing && currentTrack != null && item != null && currentTrackIdRef.current != item.id) {
          startAnimation();
          await setCurrentSongTitle();
          await setTrackToPlay(item);
        } 
        if (playbackState == State.Playing && currentTrack != null && item != null && currentTrackIdRef.current == item.id) {
          //setSongTitle('');
          stopAnimation();
          await TrackPlayer.pause();
        } 
        if (playbackState == State.Ready && currentTrack != null && item != null) {
          await setCurrentSongTitle();       
          await setTrackToPlay(item);
          startAnimation();
        }
      }

    const setCurrentSongTitle = async () => {  
      tracksArr.forEach((item) => {
        if (item.id == currentTrackIdRef.current) {
          songTitleRef.current = item.title;
          animation.setValue(screen.width*-1);
        }
      });
    }
    
    const playPauseQueue = async (playbackState) => {
      if (playbackState == State.Paused) {
        setplayPauseIcon('ios-pause-outline');
        startAnimation();
        await setCurrentSongTitle();
        await TrackPlayer.play();
      }
      if (playbackState == State.Playing) {
        setplayPauseIcon('ios-play-outline');
        await TrackPlayer.pause();
        setSongTitle('');
        stopAnimation();
        setShuffleText('');
      }
      if (playbackState == State.Ready) {
        await setCurrentSongTitle();
        startAnimation();
        setplayPauseIcon('ios-pause-outline');
        await TrackPlayer.play();
      }
    }

    const skipBack = async (playbackState) => {
      if (playbackState == State.Playing) {
        const current = await TrackPlayer.getCurrentTrack();
        if (current != 0) {
          await TrackPlayer.skipToPrevious();
          await setCurrentSongTitle();
          startAnimation();
          setShuffleText('');
        }
      }
    }

    const skipForward = async (playbackState) => {
      if (playbackState == State.Playing) {
        await TrackPlayer.skipToNext();
        await setCurrentSongTitle();
        startAnimation();
        setShuffleText('');
      }
    }

    const shuffle = async () => {
      var item = tracksArr[Math.floor(Math.random()*tracksArr.length)];
      setplayPauseIcon('ios-pause-outline');
      await setTrackToPlay(item);
      setShuffleText('Shuffle On');
      startAnimation();
    }

    const setTrackToPlay = async (item) => {
      currentTrackIdRef.current = item.id;
      await TrackPlayer.reset();
      const arr = [];
      const dirs = ReactNativeBlobUtil.fs.dirs;
      const track = {
        id: item.id,
        url: 'file:///'+dirs.DocumentDir+'/tracks/'+item,
      }
      arr.push(item);
      await TrackPlayer.add(arr);
      await setCurrentSongTitle();
      await TrackPlayer.play();
    }

    const Item = ({ item, onPress, backgroundColor, textColor }) => (
          <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
            <Text style={[styles.title, textColor]}>{item.id} - {item.title}</Text>
          </TouchableOpacity>
    );


    const renderItem = ({ item }) => {
      const backgroundColor = item.id === selectedId ? '#97abb5' : 'black';
      const color = item.id === selectedId ? 'black' : 'white';
  

    return (
      <Item
        item={item}
        onPress={() => singleTrackPlayBack(playbackState, item)}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content"/>
        <FlatList
          data={tracksArr}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={selectedId}
        />
        <View style={styles.titlemarquee}>
        <Animated.Text numberOfLines={1} style={[styles.animatedtitle, {transform: [{ translateX: animation }]}]}>{songTitleRef.current}</Animated.Text>
        </View>
        <View style={styles.footer}>
        <Icon 
            style={styles.skipbackicon}
            name={'ios-play-skip-back-outline'}
            color="white" 
            onPress={() => skipBack(playbackState)}
            size={40}
          />
          <Icon 
            style={styles.playicon}
            name={playPauseIcon}
            color="white" 
            onPress={() => playPauseQueue(playbackState)}
            size={40}
          />
          <Icon 
            style={styles.skipforwardicon}
            name={'ios-play-skip-forward-outline'}
            color="white" 
            onPress={() => skipForward(playbackState)}
            size={40}
          />
          <Icon 
            style={styles.shuffleicon}
            name={'ios-shuffle-outline'}
            color="white" 
            onPress={() => shuffle()}
            size={40}
          />
          <Text numberOfLines={1} style={styles.shuffletext}>{shuffleText}</Text>
        </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#102027'
  },
  item: {
    padding: 20,
    marginVertical: 3,
    marginHorizontal: 10,
    borderRadius: 5
  },
  title: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    flex: 0.15,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipbackicon: {
    flexGrow: 0.1,
    flexBasis: 25,
  },
  playicon: {
    flexGrow: 0.1,
    flexBasis: 20,
  },
  skipforwardicon: {
    flexGrow: 0.1,
    flexBasis: 20,
  },
  shuffleicon: {
    flexGrow: 0.1,
    flexBasis: 20,
  },
  shuffletext: {
    flexGrow: 0.2,
    flexBasis: 0,
    color: '#39f705',
    fontSize: 12,
  },
  button: {
    backgroundColor: 'black',
    flex: 0.3,
    alignItems: 'center'
  },
  animatedtitle: {
    color: 'white',
  },
  titlemarquee: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 0.032,
    backgroundColor: 'black',
  }
});

export default PlayerScreen;