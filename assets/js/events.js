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

function getUsername() {
    //TODO: page should pull username from jwt
    return 'test2';
}

function setUploadUsername(username) {
    $('input[name="ulUsername"]').val(username);
}

function setDatePickerToToday() {
    let today = moment().format('YYYY-MM-DD');
    $('input[name="eventDate"]').val(today);
}

function showPastEvents(user) {
    $.ajax({
        contentType: 'application/json',
        headers: {
            //TODO: Uncomment Authorization line
            //Authorization: "JWT" + localStorage.getItem("TOKEN"),
            username: user
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

//callback function to render page
function startPage() {
    const user = getUsername();
    showPastEvents(user);
    setTimeout(() => { 
        setUploadUsername(user);
        setDatePickerToToday();     }, 0);
}

console.log('Events page loaded.');
$(startPage());