import ReactNativeBlobUtil from 'react-native-blob-util';


export const downloadFile = (data) =>  {
  const dirs = ReactNativeBlobUtil.fs.dirs;
  return new Promise((resolve, reject) => {
    const isIOS = Platform.OS === 'ios';
    const downloadUrl = data.link;

    ReactNativeBlobUtil
    .config({
        // the fileCache option makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true,
        appendExt: 'mp3',
        path: dirs.DocumentDir + '/tracks/' + `/${data.title}` + '.mp3',
        //session: 'anytunedwnld'
    })
    .fetch('GET', downloadUrl, {
        //some headers ..
    })
    .then((res) => {
        resolve(res.respInfo.status);
    }).catch((e) => {
        console.log('fetch error: ', e);
        reject(e);
      });
  });
};
