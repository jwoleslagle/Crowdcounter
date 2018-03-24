'use strict';

function displayEvent(eventKey) {
    let htmlResult= `<ul class="events-list">
        <li><h4 class="past-event-header">Event Name</h4>
        <img class="past-event-img"src="https://s3-us-east-2.amazonaws.com/crowdcounter/${eventKey}" />
        <p class="past-event-date">Tuesday, March 22, 2018</p></li></ul>`;
    return htmlResult;
}

function getKeyFromQstring() {
    const rawQuerystring = location.search;
    const key = decodeURI(rawQuerystring.slice(6));
    return key;
}

function setDeleteKey(deleteKey) {
    $('input[name="deleteKey"]').val(deleteKey);
    console.log($('input[name="deleteKey"]').val());
}

//callback function to render page
function startPage() {
    const key = getKeyFromQstring();
    setTimeout(() => {  $('div.pastEvent').html(displayEvent(key)); }, 0);
    setTimeout(() => { setDeleteKey(key); }, 0);
}

console.log('Delete page loaded.');
$(startPage());