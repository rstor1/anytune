//import RNFetchBlob from 'react-native-blob-util';
import ReactNativeBlobUtil from 'react-native-blob-util'
// Try this: https://www.npmjs.com/package/react-native-blob-util
export const downloadFile = async (data) => {


// response.title.mp3





// export const downloadFile = async (file: GenericFile) => {
    const signalError = () => {
      showMessage(i18n.t('file_download_failed'), colors.RED);
    };
  
    const signalSuccess = () => {
      showMessage(i18n.t('file_download_success'), colors.GREEN);
    };
  
     const downloadUrl = data.link;//await buildDownloadUrl(file);
  
    try {
//       const {
//         dirs: { DownloadDir, DocumentDir },
//       } = RNFetchBlob.fs;
       const isIOS = Platform.OS === 'ios';
//       const directoryPath = Platform.select({
//         ios: DocumentDir,
//         android: DownloadDir,
//       });
//       const filePath = `${directoryPath}/${file.name}`;
//       const fileExt = file.ext;
//       var mimeType = '';
  
//       if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg') {
//         mimeType = 'image/*';
//       }
//       if (fileExt === 'pdf') {
//         mimeType = 'application/pdf';
//       }
//       if (fileExt === 'avi' || fileExt === 'mp4' || fileExt === 'mov') {
//         mimeType = 'video/*';
//       }
      //let path = RNFetchBlob.fs.dirs.DocumentDir;
      const configOptions = Platform.select({
        ios: {
          fileCache: true,
          appendExt: 'mp3',
          notification: true,
        },
    //     // android: {
    //     //   fileCache: true,
    //     //   appendExt: fileExt,
    //     //   addAndroidDownloads: {
    //     //     useDownloadManager: true,
    //     //     mime: mimeType,
    //     //     title: file.name,
    //     //     mediaScannable: true,
    //     //     notification: true,
    //     //   },
    //     // },
      });
      //let dirs = ReactNativeBlobUtil.fs.dirs;
      ReactNativeBlobUtil
      .config({
          // add this option that makes response data to be stored as a file,
          // this is much more performant.
          fileCache: true,
          appendExt: 'mp3',
          //path: dirs.DocumentDir + '/path-to-file.anything'
      })
      .fetch('GET', downloadUrl, {
          //some headers ..
      })
      .then((res) => {
          // the temp file path
          console.log('The file saved to ', res.path())
      })
      // ReactNativeBlobUtil.config({
      //   fileCache: true,
      //   appendExt: 'mp3',
      //   notification: true,
      // })
      //   .fetch('GET', downloadUrl)
      //   .then((resp) => {
      //     console.log(resp);
      //     signalSuccess();
      //     if (isIOS) {
      //       ReactNativeBlobUtil.ios.openDocument(resp.data);
      //     }
      //   })
        .catch((e) => {
          //signalError();
          console.log('fetch error: ', e);
        });
    } catch (error) {
      console.log('general error: ', error);
    }
  };