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
			$.post("/api/auth/login", JSON.stringify(loginParams), (response) => {
				if (response.authToken) {
					Storage.setItem("TOKEN", response.authToken);
					console.log(response.authToken);
					window.location.replace('/event');
				} else {
					clearInputs();
					const alertInvalid = 'Please enter a valid username and/or password.';
					alertUser(alertInvalid);
				}
			});
		} else {
			const alertBlank = 'Please enter a username and / or password.';
			alertUser(alertBlank);
		}
	});
}

//Document ready callback function - powers the page.
function renderLoginPage() {
	handleLoginSubmit();
}

console.log('App started. Login page loaded.');
$(renderLoginPage);