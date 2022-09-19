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
import {PLAYBACK_TRACK_CHANGED} from 'react-native-track-player/lib/eventTypes';


const PlayerScreen = ({ navigation }) => {
    const screen = Dimensions.get('screen');
    const [selectedId, setSelectedId] = useState(null);
    const [playerTracks, setPlayerTracks] = useState([]);
    const [tracksArr, setTracksArr] = useState([]);
    const [queueTracks, setQueueTracks] = useState([]);
    const playbackState = usePlaybackState();
    const [playPauseIcon, setplayPauseIcon] = useState('ios-play-outline');
    const animation = useRef(new Animated.Value(screen.width*-1)).current;
    const [songTitle, setSongTitle] = useState('');
    const [songTitleLength, setSongTitleLength] = useState(0);
    const [shuffleText, setShuffleText] = useState('');
    const currentTrackIdRef = useRef(-1);
    const songTitleRef = useRef('');
    const nextSongTitleRef = useRef('');
    let isPlayQueue = useRef(false);
    let isSingleTrackPlay = useRef(false);
    let isSkipToNext = useRef(false);
    let tracks = useRef([]);
    let isShuffleOn = useRef(false);

    const events = [
      Event.PlaybackState,
      Event.PlaybackError,
      // Event.PlaybackTrackChanged,
      // Event.PlaybackQueueEnded
    ];

    useEffect(() => {  
      (async () => {
        if (playbackState === State.Playing)  {
          stopAnimation();
          const current = await TrackPlayer.getCurrentTrack();
          const track = await TrackPlayer.getTrack(current);
          songTitleRef.current = track.title;
          startAnimation();
        }
        if (playbackState === State.Paused) {
          stopAnimation();
          await TrackPlayer.pause();
        }

        getAllTracks().then((results) => {
          if (results.length !== 0) {
              tracks = results;
              addTracksToPlayer(tracks).then(() => {});
          }
         }).catch((error) => {
          console.log(error);
         });
      })();
    
      return () => {
        // this now gets called when the component unmounts
      };     
      },[playbackState]);
    

      // useTrackPlayerEvents(events, (event) => {
      //   if (isShuffleOn) {

      //   } else {

      //   }
      //   console.log('event: ', event);
      //   if (event.type === Event.PlaybackError) {
      //     console.warn('An error occured while playing the current track.');
      //   }
      //   if (event.state === State.Playing) {
      //       fetchTitle();
      //   }
      //   if (event.state === State.Paused) {
      //     stopAnimation();
      //     setplayPauseIcon('ios-pause-outline');
      //   }
      //     // TODO: fix this for when we hit pause it does not keep shuffle going....
      //   //   if (event.type == Event.PlaybackTrackChanged && playbackState != Event.Paused) {
      //   //     if (event.nextTrack != null) {
      //   //       TrackPlayer.getTrack(event.nextTrack).then((track) => {
      //   //         setSongTitleFromQueue(track).then(() =>{})
      //   //       })
      //   //     } 
      //   //     else {
      //   //       songTitleRef.current = '';
      //   //       setplayPauseIcon('ios-play-outline');
      //   //       stopAnimation();
      //   //       //if (event.type == Event.PlaybackQueueEnded)
      //   //       TrackPlayer.pause().then(() => {
      //   //         TrackPlayer.reset().then(() => {});
      //   //       });
              
      //   //       // console.log('play outline being set...');
      //   //       // console.log('playbackstate: ', playbackState);
      //   //       // if (playbackState == State.Ready || playbackState == State.None || playbackState == State.Paused) {
      //   //       //   //setplayPauseIcon('ios-play-outline');
      //   //       // }
      //   //       //stopAnimation();
      //   //   } 
        
      //   //   // if (event.type == Event.PlaybackQueueEnded && playbackState == State.Playing) {
      //   //   //   songTitleRef.current = '';
      //   //   //   setplayPauseIcon('ios-play-outline');
      //   //   //   stopAnimation();
      //   //   //   TrackPlayer.reset().then(() => {});
      //   //   // }
      //   // }
      // });

    const setSongTitleFromQueue = async (item) => {
      if (item != null) {
        songTitleRef.current = item.title;
        animation.setValue(screen.width*-1);
        startAnimation();
      }
    }

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
      let _data = [];
      const index = data.indexOf('.DS_Store');
      if (index > -1) {
        data.splice(index,1);
      }
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
        isSingleTrackPlay = true;
        isPlayQueue.current = false;
        isSkipToNext.current = false;

        setSelectedId(item.id);
        const currentTrack = await TrackPlayer.getCurrentTrack();

        if (playbackState == State.Paused) {
          if (currentTrackIdRef.current != item.id) {
            await setTrackToPlay(item);
            startAnimation();
            setplayPauseIcon('ios-pause-outline');
          } else {
            await setTrackToPlay(item);
            startAnimation();
            setplayPauseIcon('ios-pause-outline');
            //await TrackPlayer.play();
          }
        }
        if (playbackState == State.None && currentTrack == null && item != null && currentTrack != item.id) {
          await setCurrentSongTitle();
          startAnimation();
          await setTrackToPlay(item);
          setplayPauseIcon('ios-pause-outline');
        }
        if (playbackState == State.Playing && currentTrack != null && item != null && currentTrackIdRef.current != item.id) {
          startAnimation();
          await setCurrentSongTitle();
          await setTrackToPlay(item);
          setplayPauseIcon('ios-pause-outline');
        } 
        if (playbackState == State.Playing && currentTrack != null && item != null && currentTrackIdRef.current == item.id) {
          //setSongTitle('');
          stopAnimation();
          await TrackPlayer.pause();
          setplayPauseIcon('ios-play-outline');
        } 
        if (playbackState == State.Ready && currentTrack != null && item != null) {
          await setCurrentSongTitle();       
          await setTrackToPlay(item);
          setplayPauseIcon('ios-pause-outline');
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

    const setCurrentSongToPlay = async () => {
      for (const item of tracksArr) {
        if (item.id == currentTrackIdRef.current) {
          await setTrackToPlay(item);
          setplayPauseIcon('ios-pause-outline');
        }
      }
    }
    
    const playPauseQueue = async (playbackState) => {
      isSingleTrackPlay = false;
      isPlayQueue.current = true;
      isSkipToNext.current = false;
      if (playbackState == State.Paused) {
        setplayPauseIcon('ios-pause-outline');
        //await setCurrentSongTitle();
        startAnimation(); 
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
        if (currentTrackIdRef.current == -1) {
          currentTrackIdRef.current = 1;
        }
        await setCurrentSongTitle();
        startAnimation();
        setplayPauseIcon('ios-pause-outline');
        await TrackPlayer.play();
      }
    }

    const skipBack = async (playbackState) => {
      if (playbackState == State.Playing || playbackState == State.Connecting || playbackState == State.Paused) {
        setplayPauseIcon('ios-pause-outline');
        const current = await TrackPlayer.getCurrentTrack();
        if (current === 0) {
          return;
        } else {
          await TrackPlayer.skipToPrevious();
        }
      } else {
        return;
      }
    }

    const skipForward = async (playbackState) => {
      if (playbackState == State.Playing || playbackState == State.Connecting || playbackState == State.Paused) {
        setplayPauseIcon('ios-pause-outline');
        await TrackPlayer.skipToNext();
      } else {
        return;
      }
    }

    const shuffle = async () => {
      if (isShuffleOn.current) {
        setShuffleText('');
        isShuffleOn.current = false;
        await TrackPlayer.reset();
        stopAnimation();
        setplayPauseIcon('ios-play-outline');
      } else {
        await startShuffle();
      }
    }

    const startShuffle = async () => {
      var item = tracksArr[Math.floor(Math.random()*tracksArr.length)];
      setplayPauseIcon('ios-pause-outline');
      await setTrackToPlay(item);
      setShuffleText('Shuffle On');
      startAnimation();
      isShuffleOn.current = true;
    }

    const setTrackToPlay = async (item) => {
      currentTrackIdRef.current = item.id;
      const arr = [];
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
{/* TODO: make element variable for shuffle icon */}
          <Text numberOfLines={1} style={styles.shuffletext}>
            Shuffle{' '}
            {isShuffleOn.current && <Icon 
            style={styles.shuffleradio}
            name={'ios-radio-button-on-outline'}
            color={'#39f705'}
            size={15}
          />}
            {!isShuffleOn.current && <Icon 
            style={styles.shuffleradio}
            name={'ios-radio-button-off-outline'}
            color={'#97abb5'}
            size={15}
          />}
            </Text>
        </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#102027',
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
    flexWrap: 'wrap',
    zIndex: 1000
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
    color: '#97abb5',
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
    flex: 0.036,
    backgroundColor: 'black',
  },
  shuffleradio: {
  }
});

export default PlayerScreen;