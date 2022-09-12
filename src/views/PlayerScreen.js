import React, { useState, useEffect, useRef } from 'react';
import { Text, View, FlatList, SafeAreaView, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
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


const PlayerScreen = ({ navigation }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [playerTracks, setPlayerTracks] = useState([]);
    const [tracksArr, setTracksArr] = useState([]);
    const [queueTracks, setQueueTracks] = useState([]);
    let tracks = useRef([]);
    const playbackState = usePlaybackState();
    const [currentIdPlaying, setCurrentIdPlaying] = useState(-1);
    

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

      const addTracksToPlayer = async(data) => {
        const dirs = ReactNativeBlobUtil.fs.dirs;
        const arr = [];
        let title = '';
        // First remove .DS Store elememt
        data.forEach((item, index) => {
          // if (item.url != undefined) {
          //   title = item.url.replace(/\.[^/.]+$/, "");
          // }
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

      const togglePlayBack = async (playbackState, item) => {
        setSelectedId(item.id);
        const currentTrack = await TrackPlayer.getCurrentTrack();

        if (playbackState == State.None && currentTrack == null && item != null && currentTrack != item.id) {
          await setTrackToPlay(item);
        }
        if (playbackState == State.Playing && currentTrack != null && item != null && currentIdPlaying != item.id) {
          await TrackPlayer.reset();
          await setTrackToPlay(item);
        } 
        if (playbackState == State.Playing && currentTrack != null && item != null && currentIdPlaying == item.id) {
          await TrackPlayer.reset();
        } 
        if (playbackState == State.Ready && currentTrack != null && item != null) {
          await setTrackToPlay(item);
        }
      }

  const setTrackToPlay = async (item) => {
    const arr = [];
    const dirs = ReactNativeBlobUtil.fs.dirs;
    const track = {
      id: item.id,
      url: 'file:///'+dirs.DocumentDir+'/tracks/'+item,
    }
    arr.push(item);
    await TrackPlayer.add(arr);
    setCurrentIdPlaying(item.id);
    await TrackPlayer.play();
  }

  const Item = ({ item, onPress, backgroundColor, textColor }) => (
        <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
          <Text style={[styles.title, textColor]}>{item.id} - {item.title}</Text>
        </TouchableOpacity>
  );


  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? "#97abb5" : "#97abb5";
    const color = item.id === selectedId ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => togglePlayBack(playbackState, item)}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#102027'
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 15,
  },
});

export default PlayerScreen;