'use strict';

//Displays warning and informational messages to the user.
function alertUser(msg) {
	$('div.alert-area').html(msg);
	$('div.alert-container').fadeIn("fast");
	setTimeout(() => { $('div.alert-container').fadeOut("slow"); }, 4000);
}

//Clears most important fields on a rejected attempt.
function clearInputs() {
	$('.js-uname-entry').val() = '';
	$('.js-pword-entry').val() = '';
	$('.js-pwordB-entry').val() = '';
}

//Watches signup form click, intercepts default post behavior, performs light validation, and sends data to create the user.
function handleSignupClick() {
	//TODO: Experiment with Google reCaptcha on this form
	$('#signupForm').submit((e) => {
		e.preventDefault();
		const uname = $('.js-uname-entry').val();
		const pword = $('.js-pword-entry').val();
		const pwordB = $('.js-pwordB-entry').val();
		const fname = $('.js-fname-entry').val();
		const email = $('.js-email-entry').val();

		//Make sure no empty strings will be submitted, then 
		if (uname != '' && pword != '') {
			//Make sure passwords match.
			if (pword === pwordB) {
				let formData = new FormData;
				//Add form variables to form data with correct keys
				formData.append('username', uname);
				formData.append('password', pword);
				formData.append('firstName', fname);
				formData.append('email', email);
				$.ajax({
					contentType: 'application/json',
					//contentType and processData must be set to false when using FormData
					contentType: false,
					processData: false,
					data: formData,
					success: function(result){
						if (result.username) {
							window.location.replace("/login?=welcome");
						} else {
							clearInputs();
							const alertInvalid = 'Please enter a valid username and/or password.';
							alertUser(alertInvalid);
						}
					},
					error: function(err){
						clearInputs();
						const alertError = err.responseJSON.message;
						alertUser(alertError);
					},
					type: 'POST',
					url: '/api/users'
				});
			} else {
				const alertBlank = `Passwords don't match. (sad trombones)`;
				alertUser(alertBlank);
			}
		} else {
			const alertBlank = 'Please enter a username and / or password.';
			alertUser(alertBlank);
		}
	});
}

//Document ready callback function - powers the page.
function renderSignupPage() {
	//Sent to bottom of stack, otherwise form post is not intercepted.
	setTimeout(() => { 
		handleSignupClick();
    }, 0);
}

$(renderSignupPage);