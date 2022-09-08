import React from 'react';
import axios from 'axios';
import { API_HOST, API_KEY } from './../config/apiConfig';
import { getVideoIdFromUrl } from './../utils/urlUtil';

export function getMp3Link(url) {
              return new Promise((resolve, reject) => {
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
                axios.request(options).then((response) => {
                    if(response.status == 200) {
                        return resolve(response);

                    } else {
                        return reject(null);
                    }
            }).catch(function (error) {
                console.error(error);
                return reject(error);
            });
              })
};


