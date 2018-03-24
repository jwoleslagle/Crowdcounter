'use strict';

function renderEventHeader(eventKey) {
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

function setDeleteKey(key) {
    $('input[name="deleteKey"]').val(key);
    console.log($('input[name="deleteKey"]').val());
}

//callback function to render page
function startPage() {
    const deleteKey = getKeyFromQstring();
    setTimeout(() => {  
        $('div.pastEvent').html(renderEventHeader(deleteKey)); 
        setDeleteKey(deleteKey);
    }, 0);
}

console.log('Delete page loaded.');
$(startPage());