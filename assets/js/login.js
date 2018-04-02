'use strict';

function alertUser(msg) {
	$('div.alert-area').html(msg);
	$('div.alert-container').fadeIn("fast");
	setTimeout(() => { $('div.alert-container').fadeOut("slow"); }, 4000);
}

function clearInputs() {
	$('.js-uname-entry').val() = '';
	$('.js-pword-entry').val() = '';
}

function getStatusFromQstring() {
    const rawQuerystring = location.search;
    if (rawQuerystring == '?=signupSuccess') {
		const signupSuccess = 'Signup successful! Please log in.';
		alertUser(signupSuccess);
	}
}

function handleLoginSubmit() {
	console.log('handleLoginSubmit ran.');
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

console.log('Login page loaded.');
$(renderLoginPage);