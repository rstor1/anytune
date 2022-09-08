import ReactNativeBlobUtil from 'react-native-blob-util';


export const downloadFile = (data) =>  {
  return new Promise((resolve, reject) => {
    const isIOS = Platform.OS === 'ios';
    const downloadUrl = data.link;
    ReactNativeBlobUtil
    .config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true,
        appendExt: 'mp3',
    })
    .fetch('GET', downloadUrl, {
        //some headers ..
    })
    .then((res) => {
        // the temp file path
        console.log('The file saved to ', res.path())
        resolve(res.respInfo.status);
    })
      .catch((e) => {
        console.log('fetch error: ', e);
        reject(e);
      });
  })
};
