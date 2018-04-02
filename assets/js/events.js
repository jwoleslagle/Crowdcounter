'use strict';

//TODO: Secure bucket to prevent anonymous read-only access - right now it will only display and add to the user's buckets, but this may possibly be circumvented.

function displayResults(rawResult) {
    let encodedPath = '';
    let htmlResult= '<ul class="events-list">';
    rawResult.forEach((obj) => {
        htmlResult += `<li class="event">
        <h4 class="past-event-header">${obj.eventName}</h4>
        <img class="past-event-img" src="${obj.imgS3Location}" />
        <p class="past-event-date">${moment(obj.eventDate).format('dddd, MMMM Do, YYYY')}</p>
        <div class="links">
            <a class="event-details-link" href="/details?evnt=${obj._id}">Event Details</a> | <a class="delete-link" href="/delete?evnt=${obj._id}" alt="Delete this event">Delete</div>
        </a><br /><hr /></li>`;
    });
    htmlResult += '</ul>';
    return htmlResult;
}

function getStatusFromQstring() {
    const rawQuerystring = location.search;
    if (rawQuerystring.includes == 'deleteSuccess') {
		const signupSuccess = 'Event deleted successfully.';
		alertUser(signupSuccess);
	}
}

function setDatePickerToToday() {
    let today = moment().format('YYYY-MM-DD');
    $('input[name="eventDate"]').val(today);
}

function showPastEvents() {
    $.ajax({
        contentType: 'application/json',
        headers: {
            Authorization: 'Bearer ' + window.localStorage.getItem("Bearer"),
        },
        success: (result) => {
            if (result[0]) {
                $('div.eventsList').html(displayResults(result));
            } else {
                const alertNoData = 'No past events found.';
                $('div.eventsList').html(alertNoData);
            }
        },
        error: (err) => {
            const alertError = 'Error encountered when retrieving events: ' + err;
            $('div.eventsList').html(alertError);
        },
        type: 'GET',
        url: '/api/events'
    });
}

function watchUploadSubmit() {
    $('#uploadForm').submit(function (e) {
        e.preventDefault(); //prevent the default action
        //create the S3 image object, analyze it, and create the event DB entry
        $.ajax({
            contentType: 'application/json',
            headers: {
                Authorization: "JWT" + localStorage.getItem("Bearer"),
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
            url: '/api/events/'
        });
    });
}

//callback function to render page
function startPage() {
    showPastEvents();
    setTimeout(() => { 
        setDatePickerToToday();     }, 0);
}

console.log('Events page loaded.');
$(startPage());