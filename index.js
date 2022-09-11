/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer, { Capability } from 'react-native-track-player';


AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => require('./service'));

// Setup trackplayer. Doing this in the player component causes errors because each navigation
// calls setup again.
const setUpTrackPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer({});
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ]
      });
      console.log('TrackPlayer initialized.');
    } catch (e) {
      console.log(e);
    }
  };


setUpTrackPlayer();
