import React, { useState, useEffect, useRef } from 'react';
import { Text, View, FlatList, SafeAreaView, TouchableOpacity, StatusBar, StyleSheet, Animated, Dimensions } from 'react-native';
import { getAllTracks } from './../utils/getTracks';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Icon from 'react-native-vector-icons/Ionicons';
import MatCommIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import Sound from 'react-native-sound';
import {
  MenuContext,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider
} from 'react-native-popup-menu';

const PlayerScreen = ({ navigation }) => {
    const screen = Dimensions.get('screen');
    const [selectedId, setSelectedId] = useState(null);
    const [tracksArr, setTracksArr] = useState([]);
    const [playPauseIcon, setplayPauseIcon] = useState('ios-play-outline');
    const animation = useRef(new Animated.Value(screen.width*-1)).current;
    const songTitleRef = useRef('');
    const [refreshFlatlist, setRefreshFlatList] = useState(false);
    const flatList = useRef(FlatList);
    let tracks = useRef([]);
    let [isShuffleOnState, setIsShuffleOnState] = useState(false);
    let isShuffleOn = useRef(false);
    let currentTrack = useRef({});
    let currentTrackIndex = useRef(-1);
    let isPlay = useRef(false);
    let shuffleIndex = useRef([]);
    let [shuffleIndexList, updateShuffleIndexList] = useState(shuffleIndex.current);

  
    useEffect(() => {
      (async () => {
        const unsubscribe = navigation.addListener('blur', () => {
          if (Object.keys(currentTrack.current).length !== 0) {
            shuffleIndex.current = [];
            currentTrack.current.stop();
            currentTrack.current.release();
          }
      });
      return unsubscribe;
      })();
    }, [navigation]);

    useEffect(() => {
      Sound.setCategory('Playback');
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
      const index = data.indexOf('.DS_Store');
      if (index > -1) {
        data.splice(index,1);
      }
        const dirs = ReactNativeBlobUtil.fs.dirs;
        let arr = [];
        let title = '';
        data.forEach((item, index) => {
          const track = {
            url: 'file:///' + dirs.DocumentDir + '/tracks/'+ item, // Load media from the file system
            title: item.replace(/\.[^/.]+$/, ""),
            isPlaying: false
        };
        arr.push(track);
        });
        // Sort the songs
        const sorted = sortTracks(arr);
        arr = [];
        // Now add ids to sorted list of songs
        sorted.forEach((item, index) => {
          item.id = index+1;
          arr.push(item);
          shuffleIndex.current.push(item);
        });
        setTracksArr(arr);
      }

      const resetShuffleIndexArr = () => {
        shuffleIndex.current = [];
        tracksArr.forEach((item, index) => {
          shuffleIndex.current.push(item);
        });
        updateShuffleIndexList(shuffleIndex.current);
      }

      const sortTracks = (arr) => {
        arr.sort(function(a, b){
          if(a.title < b.title) { return -1; }
          if(a.title > b.title) { return 1; }
          return 0;
        });
        return arr;
      }

      
      const doTheShuffle = () => {
        
        let item = {};
        let random = Math.floor(Math.random()*shuffleIndexList.length);

          item = shuffleIndexList.splice(random, 1)[0];
          updateShuffleIndexList(shuffleIndexList);

          if (item !== undefined) {
            setSongTitleFromQueue(item);
            flatList.current.scrollToIndex({index: item.id-1});
            
            currentTrack.current = new Sound(item.url,null,(error)=> {
              if (error) {
                console.log(error);
                currentTrackIndex.current = -1;
                stopAnimation();
                setIsShuffleOnState(false);
                resetShuffleIndexArr();
                return;
              } else {
                setIsShuffleOnState(true);
                setplayPauseIcon('ios-pause-outline');
                setSelectedId(item.id);
                currentTrack.current.play((success)=>{
                  if(success){  
                    currentTrack.current.stop();
                    currentTrack.current = {};
                    doTheShuffle();              
                  }else{
                    resetCurrentTrack();
                    resetShuffleState();
                    console.log('Issue playing file');
                  }
                }); 
              }
          });
          } else {
            isShuffleOn.current = false;
            resetShuffleState();
            stopAnimation();
            setplayPauseIcon('ios-play-outline');
            currentTrack.current = {};
            currentTrackIndex.current = -1;
            return;
          }
      }
  
    const shuffle = () => {
      isShuffleOn.current = isShuffleOn.current ? false : true;
      isShuffleOnState ? setIsShuffleOnState(false) : setIsShuffleOnState(true);
      if (isPlay.current) {
        isPlay.current = false;
        stopAnimation();
        currentTrack.current.stop();
        setplayPauseIcon('ios-play-outline');
        if (isShuffleOn.current) {
          doTheShuffle();
        }
      } else {
        if (isShuffleOn.current) {
          doTheShuffle();
        } else {
          resetShuffleState();
          resetCurrentTrack();
        }
      }
  }

  const resetShuffleState = async () => {
    setIsShuffleOnState(false);
    resetShuffleIndexArr();
  }

  const resetCurrentTrack = async () => {
    stopAnimation();
    setplayPauseIcon('ios-play-outline');
    if (Object.keys(currentTrack.current).length !== 0) {
      currentTrack.current.stop();
    }
      currentTrack.current = {};
      currentTrackIndex.current = -1;
  }

    const trackPlayer = async () => {
      if (playPauseIcon == 'ios-play-outline') {
        isPlay.current = true;
      } else {
        isPlay.current = false;
      } 
      if (isPlay.current) {
        if (Object.keys(currentTrack.current).length !== 0) {
          setplayPauseIcon('ios-pause-outline');
          startAnimation();
          currentTrack.current.play((success) => {
            if (success) {
              currentTrack.current = {};
              setplayPauseIcon('ios-play-outline');
              trackPlayer();
            }else{
              stopAnimation();
              console.log('Issue playing file');
            }
          });
        } else {
          currentTrackIndex.current++;
          setSongTitleFromQueue(tracksArr[currentTrackIndex.current]);
          currentTrack.current = new Sound(tracksArr[currentTrackIndex.current].url,null,(error)=> {
            if (error) {
              console.log(error);
              currentTrackIndex.current = -1;
              isPlay.current = false;
              return;
            } else {
                setplayPauseIcon('ios-pause-outline');
                setSelectedId(tracksArr[currentTrackIndex.current].id);
                currentTrack.current.play((success)=>{
                  if(success){  
                    currentTrack.current = {};
                    isPlay.current = false;
                    stopAnimation();
                    // Play next track if exists in tracksArr
                    let hasNext = tracksArr.find(x => x.id == tracksArr[currentTrackIndex.current].id+1);
                    if (hasNext) {
                      trackPlayer();
                    } else {
                      resetCurrentTrack();
                      isPlay.current = false;
                    }
                  }else{
                    stopAnimation();
                    console.log('Issue playing file');
                    isPlay.current = false;
                  }
                });  
            }  
          });
        }
      } else {
        currentTrack.current.pause();
        stopAnimation();
        setplayPauseIcon('ios-play-outline');
        isPlay.current = false;
      }
    }

    const singleTrackPlayBack = async (item) => {
      setIsShuffleOnState(false);
      currentTrackIndex.current = item.id-1;
      item.isPlaying = item.isPlaying ? false : true;
      // If there is a current track, stop it, empty it to set it to item.
      if (Object.keys(currentTrack.current).length !== 0) {
        currentTrack.current.stop();
        currentTrack.current = {};
        stopAnimation();
      }
        setSongTitleFromQueue(item);
        isPlay.current = true;
        currentTrack.current = new Sound(item.url,null,(error)=> {
          if (error) {
            console.log(error);
            currentTrackIndex.current = -1;
            isPlay.current = false;
            stopAnimation();
            return;
          } else {
            setplayPauseIcon('ios-pause-outline');
            setSelectedId(item.id);
            currentTrack.current.play((success)=>{
              if(success){  
                currentTrack.current = {};
                isPlay.current = false;
                stopAnimation();
                let hasNext = tracksArr.find(x => x.id == item.id+1);
                if (hasNext) {
                  //Play next item
                  singleTrackPlayBack(tracksArr[item.id]);
                } else {
                  resetCurrentTrack();
                  isPlay.current = false;
                }
          }else{
            console.log('Issue playing file');
            isPlay.current = false;
            stopAnimation();
          }
        });
      }
    });
  }

      const skipForward = async () => {
        if (isShuffleOn.current) {
          setIsShuffleOnState(false);
          isShuffleOn.current = false;
        }
          if (currentTrackIndex.current >= tracksArr.length - 1) {
            resetCurrentTrack();
            return;
          } else {
            currentTrackIndex.current++;
            let hasNext = tracksArr.find(x => x.id == tracksArr[currentTrackIndex.current].id);
            if (hasNext) {
              currentTrack.current.stop();
              setSongTitleFromQueue(tracksArr[currentTrackIndex.current]);
              currentTrack.current = new Sound(tracksArr[currentTrackIndex.current].url,null,(error)=> {
                if (error) {
                  console.log(error);
                  stopAnimation();
                  return;
                } else {
                  isPlay.current = true;
                  setplayPauseIcon('ios-pause-outline');
                  setSelectedId(tracksArr[currentTrackIndex.current].id);
                  currentTrack.current.play((success)=>{
                    if(success){  
                      currentTrack.current = {};
                      stopAnimation();
                      let hasNext = tracksArr.find(x => x.id == tracksArr[currentTrackIndex.current].id+1);
                      if (hasNext) {
                        //Play next item
                        singleTrackPlayBack(tracksArr[tracksArr[currentTrackIndex.current].id]);
                      } else {
                        resetCurrentTrack();
                        isPlay.current = false;
                    }
                    }else{
                      console.log('Issue playing file');
                      stopAnimation();
                    }
                });
                }
              });
            } else {
              resetCurrentTrack();
              isPlay.current = false;
          }
        }
    }
  

      const skipBack = async () => {
        if (isShuffleOn.current) {
          setIsShuffleOnState(false);
          isShuffleOn.current = false;
        }
          if (currentTrackIndex.current <= -1) {
            stopAnimation();
            return;
          } else {
            currentTrackIndex.current--;
            let hasPrevious = tracksArr.find(x => x.id == tracksArr[currentTrackIndex.current]?.id);
            if (hasPrevious) {
              currentTrack.current.stop();
              setSongTitleFromQueue(tracksArr[currentTrackIndex.current]);
              currentTrack.current = new Sound(tracksArr[currentTrackIndex.current].url,null,(error)=> {
                if (error) {
                  console.log(error);
                  stopAnimation();
                  return;
                } else {
                  isPlay.current = true;
                  setplayPauseIcon('ios-pause-outline');
                  setSelectedId(tracksArr[currentTrackIndex.current].id);
                  currentTrack.current.play((success)=>{
                    if(success){  
                      currentTrack.current = {};
                      stopAnimation();
                      let hasNext = tracksArr.find(x => x.id == tracksArr[currentTrackIndex.current].id+1);
                      if (hasNext) {
                        //Play next item
                        singleTrackPlayBack(tracksArr[tracksArr[currentTrackIndex.current].id]);
                      } else {
                        resetCurrentTrack();
                        isPlay.current = false;
                    }
                    }else{
                      isPlay.current = false;
                      console.log('Issue playing file');
                      stopAnimation();
                    }
                });
                }
              });
            } else {
              resetCurrentTrack();
              isPlay.current = false;
          }
          }
      }

    const deleteTrack = (item) => {
      const arr = [];
      const index = tracksArr.findIndex(object => {
        return object.id === item.id;
      });
      if (index > -1) {
        tracksArr.splice(index, 1);
        tracksArr.forEach((_item, _index) => {
          _item.id = _index+1;
          arr.push(_item);
        });
        setRefreshFlatList(!refreshFlatlist);
        setTracksArr(tracksArr);
        const filePath = item.url.split('///').pop();  // removes leading file:///
        ReactNativeBlobUtil.fs.unlink(filePath)
        .then(() => {
          console.log('Track deleted');
          currentTrack.current.stop();
          currentTrack.current = {};
          currentTrackIndex.current = -1;
        })
        .catch((err) => {
          console.log(err);
        });
      }
    }
    

    const Item = ({ item, onPress, backgroundColor, textColor }) => (
      
          <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
            <Text style={[styles.songnumber, textColor]}>{item.id} - </Text>
            
            <Text style={[styles.title, textColor]}>{item.title}</Text>
            
            <Menu onSelect={() => deleteTrack(item)}>
              <MenuTrigger>
                      <MatCommIcon 
                      style={styles.flatlisticon}
                      name={'dots-vertical'}
                      color="white" 
                      size={20}
                    />
              </MenuTrigger>
              <MenuOptions optionsContainerStyle={{width:100, borderRadius:5}}>
                <MenuOption value="A" text="Delete" />
            </MenuOptions>
          </Menu>
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
          ref={flatList}
          data={tracksArr}
          renderItem={ renderItem }
          keyExtractor={(item) => item.id}
          extraData={refreshFlatlist}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        </SafeAreaView>
        {/* Footer */}
      <View style={styles.footer}>
      <View style={styles.titlemarquee}>
        <Animated.Text numberOfLines={1} style={[styles.animatedtitle, {transform: [{ translateX: animation }]}]}>{songTitleRef.current}</Animated.Text>
        </View>
        <Icon 
            style={styles.skipbackicon}
            name={'ios-play-skip-back-outline'}
            color="white" 
            onPress={() => skipBack()}
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
          {isShuffleOnState ? <Icon
            style={styles.shuffleicon}
            name={'ios-shuffle-outline'}
            color={'#39f705'} 
            onPress={() => shuffle()}
            size={40}
          /> : <Icon 
          style={styles.shuffleicon}
          name={'ios-shuffle-outline'}
          color="white" 
          onPress={() => shuffle()}
          size={40}
        /> }
      </View>
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
  flatlisticon: {
    fontSize: 25,
  },
  item: {
    flexDirection: 'row',
    padding: 20,
    marginVertical: 3,
    marginHorizontal: 10,
    borderRadius: 5
  },
  songnumber: {
    flex: 1,
    fontSize: 15,
  },
  title: {
    flex: 8,
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
    bottom: 0
  },
  skipbackicon: {
    flexGrow: 0.1,
    flexBasis: 20,
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
    flexBasis: 10,
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
  }
});

export default PlayerScreen;