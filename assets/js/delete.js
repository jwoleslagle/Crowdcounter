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
            Authorization: 'Bearer ' + window.localStorage.getItem("Bearer")
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
    //Because we're using JWT Authentication, we must intercept the form post default action and insert the JWT token in the header. Since we're circumventing the form post method, we also have to pass the form values into the AJAX data field and set contentType and processData to false.
    $('#deleteForm').submit(function (e) {
        e.preventDefault(); //prevent the default action
        let formData = new FormData;
        formData.append('deleteId', $('#deleteId').val());
        formData.append('deleteKey', $('#deleteKey').val());
        //delete the event DB entry and S3 image object
        $.ajax({
            contentType: 'application/json',
            headers: {
                Authorization: 'Bearer ' + window.localStorage.getItem("Bearer")
            },
            contentType: false,
            processData: false,
            data: formData,
            success: (result) => {
                if (!result) {
                    const alertNoData = 'No events found.';
                    $('div.eventsList').html(alertNoData);
                }
                //Add a cachebuster to prevent a cached version of the redirect page (potentially showing a deleted event) from serving. This part of the query string has no other purpose.
                let rando = encodeURI([...Array(8)].map(() => Math.random().toString(36)[3]).join(''));
                window.location.replace('/events?=deleteSuccess&cachebustr=' + rando);
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
    //Timeout set because of page race condition discovered in testing. TODO: more elegant way to handle this?
    setTimeout(() => { 
        setDeleteID(deleteId); 
        watchDeleteSubmit();
    }, 0);
}

$(startPage());