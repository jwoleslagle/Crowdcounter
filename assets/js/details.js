'use strict';

//Renders the top part of the event details area in HTML from variables provided by the AJAX call.
function renderEventHeader(eventDetails) {
    let htmlResult= `<ul class="events-list">
        <li><h4 class="past-event-header">${eventDetails.eventName}</h4>
        <div class="event-img-container">
            <canvas id="imgCanvas"></canvas>
        </div>
        <p class="past-event-date">${moment.utc(eventDetails.eventDate).format('dddd, MMMM Do, YYYY')}</p></li></ul>`;
    $('div.eventHeader').html(htmlResult);
    if (eventDetails.faceBoxes[0] && eventDetails.crowdCount > 0) {
        renderEventBody(eventDetails);
        drawFaceBoxes(eventDetails);
    } else {
        const htmlNoData = `<ul class="event-details-list">
        <li>No faces found. Please try again with a different image.</li>
        </ul>`
        $('div.eventBody').html(htmlNoData);
    }
}

//Renders the bottom part of the event details area in HTML from variables provided by the AJAX call.
function renderEventBody(eventData) {
    let htmlResult= `<ul class="event-details-list">
        <li>Crowd Count: ${eventData.crowdCount}</li>
        </ul>`;
    $('div.eventBody').html(htmlResult);
}

//Renders the links area with a variable provided by the query string
function renderLinks(eventID) {
    let htmlResult= `<div class="links"><a href="/events">Return to events list</a> | <a class="delete-link" href="/delete?evnt=${encodeURI(eventID)}">Delete this event</a></div>`;
    return htmlResult;
}

//Grabs the event ID from the query string in the page's URL location
function getEventIdFromQstring() {
    const rawQuerystring = location.search;
    const key = decodeURI(rawQuerystring.slice(6));
    return key;
}

//AJAX call to get specifics of the event
function getEventDetails(eventId) {
    $.ajax({
        contentType: 'application/json',
        headers: {
            Authorization: 'Bearer ' + window.localStorage.getItem("Bearer")
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

//Uses HTML canvas element to draw in face bounding boxes on a false 'layer' above the image.
function drawFaceBoxes(eventData) {
    console.log('drawFaceBoxes ran.');
    var canvas = document.getElementById('imgCanvas');
    var ctx = canvas.getContext('2d');
    var image = new Image;
    image.src = eventData.imgS3Location;
    image.onload = drawBoxes;

    //Called when the image is actually loaded, otherwise a race condition causes width / height calls return 'undefined.' 
    function drawBoxes() {
        let imgWidth = this.naturalWidth;
        let imgHeight = this.naturalHeight;
        let elementWidth = 400;
        canvas.width = elementWidth;
        canvas.height = (elementWidth * imgHeight / imgWidth);
        console.log(this.width + ' ' + this.height)
        // Figure out why this is clipping the image.
        ctx.drawImage(this, 0, 0, imgWidth, imgHeight, 0, 0, canvas.width, canvas.height);
        //ctx.globalCompositeOperation = 'overlay';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        eventData.faceBoxes.forEach((e) => {
            ctx.strokeRect((e.Left * canvas.width), (e.Top * canvas.height), (e.Width * canvas.width), (e.Height * canvas.height));
        });
    }
}

//callback function to render page
function startPage() {
    const eventId = getEventIdFromQstring();
    const eventDetails = getEventDetails(eventId);
    setTimeout(() => {
        $('div.links').html(renderLinks(eventId));
    }, 0);
}

//Document close to ready calls the functions that power the page.
$(startPage());