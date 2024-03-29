import React from 'react';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  topcontainer: {
    width: '100%',
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#102027'
  },
  bottomcontainer: {
    width: '100%',
    height: '70%',
    backgroundColor: 'white'//'#000000',
  },
  brandfont: {
    fontFamily: 'Lobster-Regular',
    color: '#97abb5',
    textShadowColor: 'black',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 3,
    fontSize: 45
  },
  urlinput: {
    backgroundColor: 'white',
    width: '60%',
    height: '100%',
    borderWidth: 1,
    borderRadius: 15,
    textAlign: 'center'
  },
  urlview: {
    position: 'absolute',
    top: '37.5%',
    backgroundColor: 'transparent',  
    alignItems: 'center',
    width: '100%',
    height: '5%',
    zIndex: 1000
  },
  midline: {
    flexDirection: 'row',
    width: '100%',
    height: '0.1%',
    backgroundColor: 'white',
  },
  convertbuttonview: {
    position: 'absolute',
    width: '40%',
    top: '50%',
    zIndex: 1000,
    height: '5%'
  },
  playerbuttonview: {
    position: 'absolute',
    width: '40%',
    top: '58%',
    zIndex: 1000,
    height: '5%'
  },
  // Todo: put duplicate code in single class...
  //https://www.reactnative.guide/8-styling/8.2-common-styles-mixins.html
  playerbutton: {
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 2, // IOS
    shadowRadius: 3, //IOS
    color: "#97abb5",
    backgroundColor: '#97abb5',
    elevation: 2, // Android
    height: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  convertbutton: {
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 2, // IOS
    shadowRadius: 3, //IOS
    color: "#97abb5",
    backgroundColor: '#102027',
    elevation: 2, // Android
    height: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  activitycontainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  messagetext: {
    position: 'absolute',
    top: '120%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1000
  },

  });

const container = StyleSheet.compose(
  styles.container, 
  styles.topcontainer, 
  styles.bottomcontainer,
  styles.brandfont,
  styles.urlinput,
  styles.urlview,
  styles.midline,
  styles.convertbutton,
  styles.activitycontainer,
  styles.messagetext);

export default styles;