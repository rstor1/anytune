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
import Sound from 'react-native-sound';

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
    let itemToPlay = useRef({});
    let currentTrack = useRef({});
    let currentTrackIndex = useRef(-1);
    let isPlay = useRef(false);
    let isPause = useRef(false);

    useEffect(() => {
      (async () => {
        getAllTracks().then((results) => {
          if (results.length !== 0) {
              tracks = results;
              addTracksToPlayer(tracks).then(() => {});
          }
         }).catch((error) => {
          console.log(error);
         });
      })();
    },[]);

  

    const setSongTitleFromQueue = async (item) => {
      if (item != null) {
        songTitleRef.current = item.title;
        animation.setValue(screen.width*-1);
        //startAnimation();
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
            title: item.replace(/\.[^/.]+$/, ""),
            isPlaying: false
        };
        arr.push(track);
        });
        setTracksArr(arr);
        //setPlayerTracks(arr);
        //await TrackPlayer.add(arr);
      }
  


    const shuffle = async () => {
      if (isShuffleOn.current) {
        setShuffleText('');
        isShuffleOn.current = false;
        await TrackPlayer.reset();
        //stopAnimation();
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
      //startAnimation();
      isShuffleOn.current = true;
    }

    const trackPlayer = async () => {
      Sound.setCategory('Playback', true);
      if (playPauseIcon == 'ios-play-outline') {
        isPlay.current = true;
      } else {
        isPlay.current = false;
      } 
      if (isPlay.current) {
        if (Object.keys(currentTrack.current).length !== 0) {
          setplayPauseIcon('ios-pause-outline');
          currentTrack.current.play((success) => {
            if (success) {
              currentTrack.current = {};
              setplayPauseIcon('ios-play-outline');
              trackPlayer();
            }
          });
        } else {
          currentTrackIndex.current++;
          currentTrack.current = new Sound(tracksArr[currentTrackIndex.current].url,null,(error)=> {
            if (error) {
              console.log(error);
              return;
            } else {
                setplayPauseIcon('ios-pause-outline');
                setSelectedId(tracksArr[currentTrackIndex.current].id);
                currentTrack.current.play((success)=>{
                  if(success){  
                    currentTrack.current = {};
                    // Play next track if exists in tracksArr
                    let hasNext = tracksArr.find(x => x.id == tracksArr[currentTrackIndex.current].id+1);
                    if (hasNext) {
                      trackPlayer();
                    } else {
                      setplayPauseIcon('ios-play-outline');
                      isPlay.current = false;
                      currentTrack.current.stop();
                      currentTrack.current = {};
                      currentTrackIndex.current = -1;
                    }
                  }else{
                    console.log('Issue playing file');
                  }
                });  
            }  
          });
        }
      } else {
        currentTrack.current.pause();
        setplayPauseIcon('ios-play-outline');
      }
    }

    const singleTrackPlayBack = async (item) => {
      currentTrackIndex.current = item.id-1;
      //console.log(currentTrackIndex.current);

      item.isPlaying = item.isPlaying ? false : true;
      // If there is a current track, stop it, empty it to set it to item.
      if (Object.keys(currentTrack.current).length !== 0) {
        currentTrack.current.stop();
        currentTrack.current = {};
      }
        currentTrack.current = new Sound(item.url,null,(error)=> {
          if (error) {
            console.log(error);
            currentTrackIndex.current = -1;
            return;
          } else {
            setplayPauseIcon('ios-pause-outline');
            setSelectedId(item.id);
            currentTrack.current.play((success)=>{
              if(success){  
                currentTrack.current = {};
                let hasNext = tracksArr.find(x => x.id == item.id+1);
                if (hasNext) {
                  //Play next item
                  singleTrackPlayBack(tracksArr[item.id]);
                } else {
                  setplayPauseIcon('ios-play-outline');
                  isPlay.current = false;
                  currentTrack.current.stop();
                  currentTrack.current = {};
                  currentTrackIndex.current = -1;
                  //currentTrack.current.release();
                }
          }else{
            console.log('Issue playing file');
          }
        });
      }
    });
  }
  
      const skipForward = async () => {
        currentTrackIndex.current++;
        currentTrack.current.stop();
        // Take currentTrackIndex.current plus one to play next. Don't forget to set the index ahead too.
        // Also setSelectedId to the next item.id to highlight the track.
        // First check to see if hasNext
        let hasNext = tracksArr.find(x => x.id == tracksArr[currentTrackIndex.current].id);
        if (hasNext) {
          currentTrack.current = new Sound(tracksArr[currentTrackIndex.current].url,null,(error)=> {
            if (error) {
              console.log(error);
              return;
            } else {
              setplayPauseIcon('ios-pause-outline');
              setSelectedId(tracksArr[currentTrackIndex.current].id);
              currentTrack.current.play((success)=>{
                if(success){  
                  currentTrack.current = {};
                  let hasNext = tracksArr.find(x => x.id == tracksArr[currentTrackIndex.current].id+1);
                  if (hasNext) {
                    //Play next item
                    singleTrackPlayBack(tracksArr[tracksArr[currentTrackIndex.current].id]);
                  } else {
                    setplayPauseIcon('ios-play-outline');
                    isPlay.current = false;
                    currentTrack.current.stop();
                    currentTrack.current = {};
                    currentTrackIndex.current = -1;
                    //currentTrack.current.release();
                }
                }else{
                  console.log('Issue playing file');
                }
            });
            }
          });
        } else {
          setplayPauseIcon('ios-play-outline');
          isPlay.current = false;
          currentTrack.current.stop();
          currentTrack.current = {};
          currentTrackIndex.current = -1;
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

    const Item = ({ item, onPress, backgroundColor, textColor }) => (
          <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
            <Text style={[styles.title, textColor]}>{item.id} - {item.title}</Text>
          </TouchableOpacity>
    );


    const renderItem = ({ item }) => {
      const backgroundColor = item.id === selectedId ? '#97abb5' : '#22353d';
      const color = item.id === selectedId ? 'black' : 'white';
  

    return (
      <Item
        item={item}
        onPress={() => singleTrackPlayBack(item)}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

    return (
      <View style={styles.container}>
      <SafeAreaView>
        <StatusBar barStyle="light-content"/>
        <FlatList
          data={tracksArr}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={selectedId}
        />
        {/* Footer */}
      <View style={styles.footer}>
      <View style={styles.titlemarquee}>
        <Animated.Text numberOfLines={1} style={[styles.animatedtitle, {transform: [{ translateX: animation }]}]}>{songTitleRef.current}</Animated.Text>
        </View>

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
            onPress={() => trackPlayer()}
            size={40}
          />
          <Icon 
            style={styles.skipforwardicon}
            name={'ios-play-skip-forward-outline'}
            color="white" 
            onPress={() => skipForward()}
            size={40}
          />
          <Icon 
            style={styles.shuffleicon}
            name={'ios-shuffle-outline'}
            color="white" 
            onPress={() => shuffle()}
            size={40}
          />
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
      </View>
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
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 130,
    position: 'absolute',
    bottom: 0,
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
    justifyContent: 'center',
    backgroundColor: 'black',
    position: 'absolute',
    top: 10
  },
  shuffleradio: {
  }
});

export default PlayerScreen;