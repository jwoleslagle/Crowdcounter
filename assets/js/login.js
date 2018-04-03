'use strict';

// Function displays error and informational messages for users.
function alertUser(msg) {
	$('div.alert-area').html(msg);
	$('div.alert-container').fadeIn("fast");
	setTimeout(() => { $('div.alert-container').fadeOut("slow"); }, 4000);
}

//Clears most important fields on a rejected attempt.
function clearInputs() {
	$('.js-uname-entry').val() = '';
	$('.js-pword-entry').val() = '';
}

//Checks query string and calls alertUser for any informational or warning messages.
function getStatusFromQstring() {
    const rawQuerystring = location.search;
    if (rawQuerystring == '?=welcome') {
		const signupSuccess = 'Signup successful! Please log in.';
		alertUser(signupSuccess);
	} else if (rawQuerystring == '?=unauth'){
		const unauth = 'Please log in to access this resource.';
		alertUser(unauth);
	}
}

//Watches login form click, intercepts default post behavior, performs light validation, and sends data to validate the attempt. On success, writes the JWT token to local storage to validate future endpoint and page calls for the next seven days.
function handleLoginSubmit() {
	$('.js-login-button').click(function(e) {
		e.preventDefault();
		const uname = $('.js-uname-entry').val();
		const pword = $('.js-pword-entry').val();

		//Make sure no empty strings will be submitted, then 
		if (uname != '' && pword != '') {
			const loginParams = {
				username: uname,
				password: pword
			};
			$.ajax({
				contentType: 'application/json',
				data: JSON.stringify(loginParams),
				dataType: 'json',
				success: function(response){
					if (response.authToken) {
						window.localStorage.setItem("Bearer", response.authToken);
						window.location.replace('/events?=welcome');
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
				url: '/api/auth/login'
			});
		} else {
			const alertBlank = 'Please enter a username and / or password.';
			alertUser(alertBlank);
		}
	});
}

//Document ready callback function - powers the page.
function renderLoginPage() {
	getStatusFromQstring();
	handleLoginSubmit();
}

//Document close to ready calls the functions that power the page.
$(renderLoginPage);