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
    let tracks = useRef([]);


    useEffect(() => {  
          getAllTracks().then((results) => {
            if (results.length !== 0) {
                tracks = results;
                addTracksToPlayer(tracks).then((data) => {
                  setPlayerTracks(data);
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
        data.slice(1).forEach((data, index) => {
          const track = {
            id: index,
            url: 'file:///' + dirs.DocumentDir + '/tracks/'+ data, // Load media from the file system
        };
        arr.push(track);
          
        });
        setTracksArr(arr);
        await TrackPlayer.add(arr);
      }

      const playTrack = async(item) => {
        setSelectedId(item.id);
        await TrackPlayer.play();
        let trackIndex = await TrackPlayer.getCurrentTrack();
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
        onPress={() => playTrack(item)}
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