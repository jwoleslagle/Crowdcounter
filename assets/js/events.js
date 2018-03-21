'use strict';

function showFolder(user) {
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify(loginParams),
        dataType: 'json',
        success: function(res){
            if (res.authToken) {
                Storage.setItem("TOKEN", response.authToken);
                window.location.replace('/event');
            } else {
                clearInputs();
                const alertInvalid = 'Please enter a valid username and/or password.';
                alertUser(alertInvalid);
            }
        },
        error: function(){
            const alertError = 'Error encountered in POST.';
            alertUser(alertError);
        },
        type: 'GET',
        url: '/api/events'
    });
    return folder;
}

function createFolder(user) {
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify(loginParams),
        dataType: 'json',
        success: function(response){
            if (response) {
                Storage.setItem("TOKEN", response.authToken);
                window.location.replace('/event');
            } else {
                clearInputs();
                const alertInvalid = 'Please enter a valid username and/or password.';
                alertUser(alertInvalid);
            }
        },
        error: function(){
            const alertError = 'Error encountered in POST.';
            alertUser(alertError);
        },
        type: 'POST',
        url: '/api/events'
    });
    return folder;
}



document.getElementById('app').innerHTML = getHtml(htmlTemplate);
