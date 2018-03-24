'use strict';

//TODO: Secure bucket to prevent anonymous read-only access

function displayResults(rawResult) {
    let htmlResult= '<ul class="events-list">';
    rawResult.forEach((obj) => {
        htmlResult += `<li><h4 class="past-event-header">Event Name</h4>
        <img class="past-event-img"src="https://s3-us-east-2.amazonaws.com/crowdcounter/${obj.Key}" />
        <p class="past-event-date">Tuesday, March 22, 2018</p>
        <div class="past-event-delete"><a href="/delete?evnt=${encodeURI(obj.Key)}" alt="Delete this event">Delete</a></div></li>`;
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
    console.log($('input[name="ulUsername"]').val());
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
    setTimeout(() => { setUploadUsername(user); }, 0);
}

console.log('Events page loaded.');
$(startPage());