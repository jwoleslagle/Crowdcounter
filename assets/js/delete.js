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

function watchDeleteSubmit (delKey) {
    $('#deleteForm').submit(function (e) {
        e.preventDefault();//prevent the default action

        $.ajax({
            contentType: 'application/json',
            headers: {
                //TODO: Uncomment Authorization line
                //Authorization: "JWT" + localStorage.getItem("TOKEN"),
            },
            success: (result) => {
                if (!result) {
                    const alertNoData = 'No events found.';
                    $('div.eventsList').html(alertNoData);
                }
            },
            error: (err) => {
                const alertError = 'Error encountered when retrieving events: ' + err;
                $('div.eventsList').html(alertError);
            },
            type: 'POST',
            url: '/api/events/remove'
        });
    });
}

//callback function to render page
function startPage() {
    const deleteKey = getKeyFromQstring();
    watchDeleteSubmit(deleteKey);
    setTimeout(() => {  
        $('div.pastEvent').html(renderEventHeader(deleteKey)); 
        setDeleteKey(deleteKey);
    }, 0);
}

console.log('Delete page loaded.');
$(startPage());