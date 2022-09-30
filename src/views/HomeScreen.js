import React, { useState } from 'react';
import { Text, View, TextInput, StatusBar, TouchableOpacity, ActivityIndicator} from 'react-native';
import styles from '../../AppStyles';
import { getVideoIdFromUrl } from './../utils/urlUtil';
import { validateUrl } from './../utils/urlUtil';
import { getMp3Link }  from './../routes/getMp3';
import { downloadFile } from './../utils/downloadFile';


const HomeScreen = ({ navigation }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMessage, setHasMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState(false);

  function onPressConvert() {
    if (text === undefined || text === "" || text === null || !validateUrl(text)) {
      setHasMessage(true);
      setMessageText('Please enter a valid url');
    } else {
      setIsLoading(true);
      setDownloadButtonDisabled(true);
      //send to api in routes (GET) request
      getMp3Link(text).then((response) => {
        setText('');
        if (response != null || response != undefined) {
          downloadFile(response.data).then((result) => {
            if (result == 200) {
              setHasMessage(true);
              setMessageText('Download complete!');
            } 
          }).then(() => {
            setIsLoading(false);
            setDownloadButtonDisabled(false);
          });
        } else {
          setIsLoading(false);
          setHasMessage(false);
          setDownloadButtonDisabled(false);
          setMessageText('Download failed. Please try again.');
        }
      }).catch((error) => {
        console.log('error: ', error);
        setIsLoading(false);
        setDownloadButtonDisabled(false);
        setMessageText('Download failed. Please try again.');
      });
    }
  };

  function onPressPlayer() {
    navigation.navigate('Player', { name: 'Player' });
    setMessageText('');
  };

let activityIndicator =  <View style={[styles.activitycontainer]}>
                          <ActivityIndicator size="large" color="#102027" />
                          </View>

  return (
    <View style={styles.maincontainer}>
      <View style={styles.topcontainer}>
        <Text style={styles.brandfont}>AnyTune</Text>
      </View>
      <View style={styles.midline}/>
        <View style={styles.urlview}>
          <TextInput 
            style={styles.urlinput}
            keyboardType="default"
            onChangeText={newText => setText(newText)}
            defaultValue={text}
            placeholder="Enter video url"/>
        
        {hasMessage && <Text style={styles.messagetext}>{messageText}</Text>}

        </View>
        <View style={styles.convertbuttonview}>
          <TouchableOpacity
              style={styles.convertbutton}
              onPress={onPressConvert}
              disabled={downloadButtonDisabled}
          >
           <Text style={{color: 'white'}}>Download</Text>
          </TouchableOpacity>
          </View>
          <View style={styles.playerbuttonview}>
          <TouchableOpacity
              style={styles.playerbutton}
              onPress={onPressPlayer}
          >
           <Text style={{color: 'black'}}>Player</Text>
          </TouchableOpacity>
          </View>
              <View style={styles.bottomcontainer}>
                <Text style={styles.brandfont}></Text>
        </View>
          {isLoading && activityIndicator}
        </View>
  );
};

export default HomeScreen;

