import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { getAllTracks } from './../utils/getTracks';


const PlayerScreen = ({ navigation }) => {
    const [tracks, setTracks] = useState([]);

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

  return (
    <View>
        <Text>PlayerScreen</Text>
    </View>
  );

};

export default PlayerScreen;