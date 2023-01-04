# anytune
## Description

This is a music player that downloads any song from youtube using the api from rapid api: https://rapidapi.com/ytjar/api/youtube-mp36/. It is a complete music track player that saves mp3's to your local iphone's storage. It is free to use and alter to anyone. I will not be maintaining this repo. 

## Specs

React Native version 0.69.
Optimized for iOS and not tested on Android

## How to use

Once you have an account setup at rapid api for the youtube to mp3 api (link above in Description section), add your key to: **src/config/apiConfig.js**. The rest is just making sure you have all the code cloned locally and using xcode to get it on your iphone. That part is not covered here but can easily be found in the React Native docs: https://reactnative.dev/ and/or swimming in Google searches:p

**Note:** Once you have everything setup and running, you may notice that the track did not download when you click download to download the youtube track from the url. You just have to try again. I am not sure why this happens yet, but my guess it is the youtube api from rapid api. I had this same behavior when I created a web version. 

## The App


Home Screen:

![IMG-2690](https://user-images.githubusercontent.com/43070937/210638508-f8a955f3-615c-47e1-a7c5-4506e1567b83.PNG)

Player Screen:

![IMG-2691](https://user-images.githubusercontent.com/43070937/210638525-97f4a465-53d2-4685-8066-327c9af5b899.PNG)

Delete track option:

![IMG-2692](https://user-images.githubusercontent.com/43070937/210638536-531fb1d7-b2b9-4c02-b034-94003df7e4fc.PNG)

App example workflow:

https://user-images.githubusercontent.com/43070937/210573703-d4cde54e-b74b-4287-928e-ac6d712077bc.mp4

