import React, { useState } from 'react';
import { Text, View, TextInput, StatusBar, TouchableOpacity, ActivityIndicator} from 'react-native';
import styles from '../../AppStyles';
import { getVideoIdFromUrl } from './../utils/urlUtil';
import { getMp3Link }  from './../routes/getMp3';
import { downloadFile } from './../utils/downloadFile';


const HomeScreen = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wasSuccess, setWasSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');

  function onPressConvert() {
    setIsLoading(true);
    //send to api using axios in routes (GET) request
    getMp3Link(text).then((response) => {
      setText('');
      if (response != null) {
        downloadFile(response.data).then((result) => {
          if (result == 200) {
            setWasSuccess(true);
            setSuccessText('Success!');
          } 
        }).then(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }).catch((error) => {
      console.log('error: ', error);
    })
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
        </View>
        <View style={styles.successtext}>
        {wasSuccess && <Text style={{color: 'white'}}>{successText}</Text>}
        </View>
        <View style={styles.convertbuttonview}>
          <TouchableOpacity
              style={styles.convertbutton}
              onPress={onPressConvert}
          >
           <Text style={{color: 'white'}}>Download</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
              // style={styles.convertbutton}
              // onPress={onPressConvert}
          >
           <Text style={{color: 'white'}}>Player</Text>
          </TouchableOpacity> */}
        </View>
              <View style={styles.bottomcontainer}>
                <Text style={styles.brandfont}></Text>
        </View>
          {isLoading && activityIndicator}
        </View>
  );
};

export default HomeScreen;

