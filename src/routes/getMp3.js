import React from 'react';
import axios from 'axios';
import { API_HOST, API_KEY } from './../config/apiConfig';
import { getVideoIdFromUrl } from './../utils/urlUtil';

export function getMp3Link(url) {
    return new Promise((resolve, reject) => {
        if (url === undefined || url === "" || url === null ) {
            //TODO: return a message
            return null; //res.render('index', {success : false, message : "Please enter a url."});
        } else {
            const videoId = getVideoIdFromUrl(url);
            const options = {
                method: 'GET',
                url: 'https://youtube-mp36.p.rapidapi.com/dl',
                params: {id: videoId},
                headers: {
                  'X-RapidAPI-Key': API_KEY,
                  'X-RapidAPI-Host': API_HOST
                }
              };
              axios.request(options).then(function (response) {
                    if(response.status == 200) {
                        return resolve(response);

                    } else {
                        //TODO: return a message
                        return null;//res.render('index', {success: false, message: response.data.msg});
                    }
            }).catch(function (error) {
                console.error(error);
                reject(error);
            });
        }
    })

};


