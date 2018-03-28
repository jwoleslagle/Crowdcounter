'use strict';

function renderEventHeader(eventDetails) {
    let htmlResult= `<ul class="events-list">
        <li><h4 class="past-event-header">${eventDetails.eventName}</h4>
        <img class="past-event-img" src="${eventDetails.imgS3Location}" />
        <p class="past-event-date">${moment(eventDetails.eventDate).format('dddd, MMMM Do, YYYY')}</p></li></ul>`;
    $('div.eventHeader').html(htmlResult);
}

function getEventDetails(eventId) {
    $.ajax({
        contentType: 'application/json',
        headers: {
            //TODO: Uncomment Authorization line
            //Authorization: "JWT" + localStorage.getItem("TOKEN"),
        },
        success: (result) => {
            if (result.eventName) {
                setDeleteKey(result.imgS3Key);
                $('div.eventHeader').html(renderEventHeader(result));
            } else {
                const alertNoData = 'No past events found.';
                $('div.eventHeader').html(alertNoData);
            }
        },
        error: (err) => {
            const alertError = 'Error encountered when retrieving events: ' + err;
            $('div.eventHeader').html(alertError);
        },
        type: 'GET',
        url: '/api/events/event/' + eventId
    });
}

function getEventIDFromQstring() {
    const rawQuerystring = location.search;
    return decodeURI(rawQuerystring.slice(6));
}

function setDeleteID(eid) {
    $('input[name="deleteId"]').val(eid);
}

function setDeleteKey(key) {
    $('input[name="deleteKey"]').val(key);
}

function watchDeleteSubmit() {
    $('#deleteForm').submit(function (e) {
        e.preventDefault(); //prevent the default action
        //delete the event DB entry and S3 image object
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
    const deleteId = getEventIDFromQstring();
    getEventDetails(deleteId);
    setTimeout(() => { setDeleteID(deleteId); }, 0);
    watchDeleteSubmit();
}

console.log('Delete page loaded.');
$(startPage());