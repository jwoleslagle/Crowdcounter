'use strict';

//Creates html with requisite variables for the top of the event details page.
function renderEventHeader(eventDetails) {
    let htmlResult= `<ul class="events-list">
        <li><h4 class="past-event-header">${eventDetails.eventName}</h4>
        <img class="past-event-img" src="${eventDetails.imgS3Location}" />
        <p class="past-event-date">${moment.utc(eventDetails.eventDate).format('dddd, MMMM Do, YYYY')}</p></li></ul>`;
    $('div.eventHeader').html(htmlResult);
}

//On page load, this function polls the events endpoint for any database documents previously created by the logged in user.
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

//Gets event ID from the query string
function getEventIDFromQstring() {
    const rawQuerystring = location.search;
    return decodeURI(rawQuerystring.slice(6));
}

//Sets a hidden variable on the form with the event ID.
//TODO: Refactor to remove this method - obsolete with use of AJAX instead of default form POST method.
function setDeleteID(eid) {
    $('input[name="deleteId"]').val(eid);
}

//Sets a hidden variable on the form with the S3 object key for the image.
//TODO: Refactor to remove this method - obsolete with use of AJAX instead of default form POST method.
function setDeleteKey(key) {
    $('input[name="deleteKey"]').val(key);
}

//Because we're using JWT Authentication, we must intercept the form post default action and insert the JWT token in the header. Since we're circumventing the form post method, we also have to pass the form values into the AJAX data field and set contentType and processData to false.
function watchDeleteSubmit() {
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

//Callback function to render page
function startPage() {
    const deleteId = getEventIDFromQstring();
    getEventDetails(deleteId);
    //Timeout set because of page race condition discovered in testing. TODO: more elegant way to handle this?
    setTimeout(() => { 
        setDeleteID(deleteId); 
        watchDeleteSubmit();
    }, 0);
}

//This function call renders the javascript portion of the page.
$(startPage());