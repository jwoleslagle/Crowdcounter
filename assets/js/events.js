'use strict';

//TODO: Secure bucket to prevent anonymous read-only access

function displayResults(rawResult) {
    let htmlResult= '<ul class="events-list">';
    let test = rawResult[0].Key;
    rawResult.forEach((obj) => {
        htmlResult += `<li>
        <h4 class="past-event-header">Event Name</h4>
        <img class="past-event-img"src="https://s3-us-east-2.amazonaws.com/crowdcounter/${obj.Key}" />
        <p class="past-event-date">Tuesday, March 22, 2018</p></li>`;
    });
    htmlResult += '</ul>';
    return htmlResult;
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
    //TODO: remove const user= - page should pull username from jwt
    const user = 'test2';
    showPastEvents(user);
}

console.log('Events page loaded.');
$(startPage());