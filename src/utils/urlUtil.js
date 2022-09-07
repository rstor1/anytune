import React from 'react';

export function getVideoIdFromUrl(url) {
    const vidId = url.split('/').pop();
    return vidId;
};