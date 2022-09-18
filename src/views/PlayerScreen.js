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
    const [isShuffleOn, setIsShuffleOn] = useState(false);
    const currentTrackIdRef = useRef(-1);
    const songTitleRef = useRef('');
    const nextSongTitleRef = useRef('');
    let isPlayQueue = useRef(false);
    let isSingleTrackPlay = useRef(false);
    let tracks = useRef([]);
    const events = [
      //Event.PlaybackState,
      Event.PlaybackError,
      Event.PlaybackTrackChanged,
      Event.PlaybackQueueEnded
    ];

    const fetchNextTitle = () => {
        TrackPlayer.getCurrentTrack().then((trackNum) => {
          TrackPlayer.getTrack(++trackNum).then((track) => {
            //currentTrackIdRef.current = track.id;
            nextSongTitleRef.current = track.title;
           console.log('next title: ', nextSongTitleRef.current);
            //console.log('songTitleafter: ', songTitleRef.current)
            // setCurrentSongTitle().then(() => {
            //   startAnimation();

            // });
            //console.log('currentTrackIdAfter: ', currentTrackIdRef.current)
          })
          
          //console.log('current: ', track);
        }).catch(e => {
          console.log(e);
        });
    }

    useEffect(() => {  

      if (playbackState === State.Playing || playbackState === 3 || playbackState === State.Loading) {
        if (isPlayQueue || isSingleTrackPlay) {
          fetchNextTitle();
          if (nextSongTitleRef.current != '') {
            songTitleRef.current = nextSongTitleRef.current;
          }
        }
        //console.log(nextSongTitleRef.current);

        // console.log('playing');
        // console.log('loading');
        // console.log('song title: ', songTitleRef.current);
        // console.log('currentTrackIdBefore: ', currentTrackIdRef.current)
        // Update track title and trackIdref
        //songTitleRef.current = '';
        //stopAnimation();
        //songTitleRef.current = 'hello';


      } else if (playbackState === 'paused' || playbackState === 2) {
        // console.log('paused');
        // console.log('song title: ', songTitleRef.current)
      } else if (playbackState === 'stopped') {
          // console.log('stopped');
          // console.log('song title: ', songTitleRef.current)
      } else {
        // console.log('loading');
        // console.log('song title: ', songTitleRef.current)
      }
      console.log(songTitleRef.current);
      //if (isInitialLoad.current) {
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
      //}
          
      }, [playbackState]);
    

      // useTrackPlayerEvents(events, (event) => {
      //   if (isShuffleOn) {

      //   } else {

      //   }
      //   console.log('event: ', event);
      //   if (event.type === Event.PlaybackError) {
      //     console.warn('An error occured while playing the current track.');
      //   }
      //     // TODO: fix this for when we hit pause it does not keep shuffle going....
      //     if (event.type == Event.PlaybackTrackChanged && playbackState != Event.Paused) {
      //       if (event.nextTrack != null) {
      //         TrackPlayer.getTrack(event.nextTrack).then((track) => {
      //           setSongTitleFromQueue(track).then(() =>{})
      //         })
      //       } 
      //       else {
      //         songTitleRef.current = '';
      //         setplayPauseIcon('ios-play-outline');
      //         stopAnimation();
      //         //if (event.type == Event.PlaybackQueueEnded)
      //         TrackPlayer.pause().then(() => {
      //           TrackPlayer.reset().then(() => {});
      //         });
              
      //         // console.log('play outline being set...');
      //         // console.log('playbackstate: ', playbackState);
      //         // if (playbackState == State.Ready || playbackState == State.None || playbackState == State.Paused) {
      //         //   //setplayPauseIcon('ios-play-outline');
      //         // }
      //         //stopAnimation();
      //     } 
        
      //     // if (event.type == Event.PlaybackQueueEnded && playbackState == State.Playing) {
      //     //   songTitleRef.current = '';
      //     //   setplayPauseIcon('ios-play-outline');
      //     //   stopAnimation();
      //     //   TrackPlayer.reset().then(() => {});
      //     // }
      //   }
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
      // async tracksArr.forEach((item) => {
      //   if (item.id == currentTrackIdRef.current) {
      //     await setTrackToPlay(item);
      //   }
      // });
    }
    
    const playPauseQueue = async (playbackState) => {
      isSingleTrackPlay = false;
      isPlayQueue.current = true;
      if (playbackState == State.Paused) {
        setplayPauseIcon('ios-pause-outline');
        await setCurrentSongTitle();
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
      // const current = await TrackPlayer.getCurrentTrack();
      // let _current = current;
      // --_current;
      // const prevTrack = await TrackPlayer.getTrack(_current);
      // if (prevTrack) {
      //   await TrackPlayer.skipToPrevious();
      // }
      if (playbackState == State.Playing || playbackState == State.Connecting || playbackState == State.Paused) {
        setplayPauseIcon('ios-pause-outline');
        if ( currentTrackIdRef.current >= 2 ) {
          let _currentId = currentTrackIdRef.current;
          --_currentId;
          let item = tracksArr.find((elem) => elem.id == _currentId);
          await setTrackToPlay(item);
          await setCurrentSongTitle();
          startAnimation();
        }
      }
    }

    const skipForward = async (playbackState) => {
      // const current = await TrackPlayer.getCurrentTrack();
      // let _current = current;
      // ++_current;
      // const nextTrack = await TrackPlayer.getTrack(_current);
      // if (nextTrack) {
      //   await TrackPlayer.skipToNext();
      // }
      if (playbackState == State.Playing || playbackState == State.Connecting || playbackState == State.Paused) {
        setplayPauseIcon('ios-pause-outline');
        if (currentTrackIdRef.current < tracksArr.length) {
          let _currentId = currentTrackIdRef.current;
          ++_currentId;
          let item = tracksArr.find((elem) => elem.id == _currentId);
          await setTrackToPlay(item);
          await setCurrentSongTitle();
          startAnimation();
        }
      }
    }

    const shuffle = async () => {
      if (isShuffleOn) {
        setShuffleText('');
        setIsShuffleOn(false);
      } else {
        await startShuffle();
        // var item = tracksArr[Math.floor(Math.random()*tracksArr.length)];
        // setplayPauseIcon('ios-pause-outline');
        // await setTrackToPlay(item);
        // setShuffleText('Shuffle On');
        // startAnimation();
        // setIsShuffleOn(true);
      }
    }

    const startShuffle = async () => {
      var item = tracksArr[Math.floor(Math.random()*tracksArr.length)];
      setplayPauseIcon('ios-pause-outline');
      await setTrackToPlay(item);
      setShuffleText('Shuffle On');
      startAnimation();
      setIsShuffleOn(true);
    }

    const setTrackToPlay = async (item) => {
      currentTrackIdRef.current = item.id;
      //await TrackPlayer.reset();
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
{/* TODO: make element variable for shuffle icon */}
          <Text numberOfLines={1} style={styles.shuffletext}>
            Shuffle{' '}
            {isShuffleOn && <Icon 
            style={styles.shuffleradio}
            name={'ios-radio-button-on-outline'}
            color={'#39f705'}
            size={15}
          />}
            {!isShuffleOn && <Icon 
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
    flexWrap: 'wrap'
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