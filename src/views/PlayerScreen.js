import React, { useState, useEffect } from 'react';
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
    const [tracks, setTracks] = useState([]);
    const [selectedId, setSelectedId] = useState(null);


    React.useEffect(() => {  
          getAllTracks().then((results) => {
            if (results.length !== 0) {
                setTracks(results);
            }
           }).catch((error) => {
            console.log(error);
           });
      }, []);

      if (tracks.length != 0) {
        console.log('tracks: ', tracks);
      }

      // const addTracksToPlayer = async(files) => {
      //   await TrackPlayer.setupPlayer();
      //   const dirs = ReactNativeBlobUtil.fs.dirs;
      //   files.forEach((file, index) => {
      //     // id: uuid.v4(),
      //     // url: {uri:"file://"+dirs.DocumentDir+'/tracks/'+file[index]},
      //     const track = {
      //       id: index,
      //       url: 'file:///' + dirs.DocumentDir + '/tracks/'+ file[index], // Load media from the file system

      //   };
      //   await TrackPlayer.add(track);
          
      //   });
      // }

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
        onPress={() => setSelectedId(item.id)}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tracks}
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