import React from 'react';

export function getVideoIdFromUrl(url) {
    const vidId = url.split('/').pop();
    return vidId;
};

export function validateUrl(url) {
    const regex = new RegExp('^(https:|http:|www\.)\S*');
    return regex.test(url);
}