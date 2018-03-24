'use strict';

function renderEventHeader(eventKey) {
    let htmlResult= `<ul class="events-list">
        <li><h4 class="past-event-header">Event Name</h4>
        <img class="past-event-img"src="https://s3-us-east-2.amazonaws.com/crowdcounter/${eventKey}" />
        <p class="past-event-date">Tuesday, March 22, 2018</p></li></ul>`;
    return htmlResult;
}

function renderLinks(eventKey) {
    let htmlResult= `<div class="links"><a href="/events">Return to events list</a> | <a class="delete-link" href="/delete?evnt=${encodeURI(eventKey)}">Delete this event</a>`;
    return htmlResult;
}

function getKeyFromQstring() {
    const rawQuerystring = location.search;
    const key = decodeURI(rawQuerystring.slice(6));
    return key;
}

//callback function to render page
function startPage() {
    const eventKey = getKeyFromQstring();
    setTimeout(() => {  
        $('div.eventHeader').html(renderEventHeader(eventKey)); 
        $('div.links').html(renderLinks(eventKey));
    }, 0);
}

console.log('Details page loaded.');
$(startPage());