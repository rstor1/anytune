import ReactNativeBlobUtil from 'react-native-blob-util';

export const getAllTracks = () => {
    let TRACK_FOLDER = ReactNativeBlobUtil.fs.dirs.DocumentDir + '/tracks/';
    return new Promise((resolve, reject) => {
        ReactNativeBlobUtil.fs.ls(TRACK_FOLDER)
        .then((files) => { 
            resolve(files);
        }).catch((error) => {
            console.log('error getting tracks: ', error);
            reject(error);
        });
    });
};