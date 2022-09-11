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


    useEffect(() => {  
          getAllTracks().then((results) => {
            if (results.length !== 0) {
                tracks = results;
                addTracksToPlayer(tracks).then((data) => {
                  //So far do nothing here...
                  //setPlayerTracks(data);
                  //setQueueTracks(data);
                })
            }
           }).catch((error) => {
            console.log(error);
           });
          
      }, []);

      const addTracksToPlayer = async(data) => {
        const dirs = ReactNativeBlobUtil.fs.dirs;
        const arr = [];
        // First remove .DS Store elememt
        data.slice(1).forEach((item, index) => {
          const track = {
            id: index,
            url: 'file:///' + dirs.DocumentDir + '/tracks/'+ item, // Load media from the file system
        };
        arr.push(track);
          
        });
        setTracksArr(arr);
        setPlayerTracks(arr);
        await TrackPlayer.add(arr);
      }

      const togglePlayBack = async (playbackState, item) => {
        const currentTrack = await TrackPlayer.getCurrentTrack();
        if (playbackState == 'none' && currentTrack == null && item != null) {
          const dirs = ReactNativeBlobUtil.fs.dirs;
          const arr = [];
          const track = {
            id: item.id,
            url: 'file:///' + dirs.DocumentDir + '/tracks/'+ item,
          }
          arr.push(item);
          await TrackPlayer.add(arr);
          await TrackPlayer.play();
        } else {
          if (currentTrack != null) {
            if (playbackState == State.Playing) {
              await TrackPlayer.reset();
            } else {
              await TrackPlayer.play();
  
            }
          }
        }

      }

      const Item = ({ item, onPress, backgroundColor, textColor }) => (
        <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
          <Text style={[styles.title, textColor]}>{item.title}</Text>
        </TouchableOpacity>
      );


  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? "#6e3b6e" : "#f9c2ff";
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
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});

export default PlayerScreen;