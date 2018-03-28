'use strict';

function renderEventHeader(eventDetails) {
    let htmlResult= `<ul class="events-list">
        <li><h4 class="past-event-header">${eventDetails.eventName}</h4>
        <img class="past-event-img" src="${eventDetails.imgS3Location}" />
        <p class="past-event-date">${moment(eventDetails.eventDate).format('dddd, MMMM Do, YYYY')}</p></li></ul>`;
    $('div.eventHeader').html(htmlResult);
    if (eventDetails.faceBoxes[0] && eventDetails.crowdCount > 0) {
        drawFaceBoxes(eventDetails.faceBoxes);
        renderEventBody(eventDetails);
    } else {
        const htmlNoData = `<ul class="event-details-list">
        <li>No faces found. Please try again with a different image.</li>
        </ul>`
        $('div.eventBody').html(htmlNoData);
    }
}

function renderEventBody(eventData) {
    let htmlResult= `<ul class="event-details-list">
        <li>Crowd Count: ${eventDetails.crowdCount}</li>
        </ul>`;
    $('div.eventBody').html(htmlResult);
}

function renderLinks(eventID) {
    let htmlResult= `<div class="links"><a href="/events">Return to events list</a> | <a class="delete-link" href="/delete?evnt=${encodeURI(eventID)}">Delete this event</a>`;
    return htmlResult;
}

function getEventIdFromQstring() {
    const rawQuerystring = location.search;
    const key = decodeURI(rawQuerystring.slice(6));
    return key;
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

function drawFaceBoxes() {
    console.log('drawFaceBoxes ran.');
    // Some salvaged code that might be helpful...
    // PImage.decodeJPEGFromStream(s3.getObject(img1Params).createReadStream()).then((img) => {
    //     let img2 = PImage.make(img.width, img.height);
    //     let ctx = img2.getContext('2d');
    //     ctx.drawImage(img, 0, 0, img.width, img.height); // source dimensions
    //     //     0, 0, img.width, img.height,                 // destination dimensions
    //     // );
    //     //ctx.fillStyle = 'rgba(0,0,0, 0.0)';
    //     ctx.strokeStyle = 'white';
    //     ctx.lineWidth = 2;

    //     const imgWidth = img.width;
    //     const imgHeight = img.height;

    //     boxesOnly.forEach((e) => {
    //         ctx.strokeRect(e.Left * imgWidth, e.Top * imgHeight, e.Width * imgWidth, e.Height * imgHeight);
    //     });
}

//callback function to render page
function startPage() {
    const eventId = getEventIdFromQstring();
    const eventDetails = getEventDetails(eventId);
    setTimeout(() => {  
        $('div.links').html(renderLinks(eventId));
    }, 0);
}

console.log('Details page loaded.');
$(startPage());