'use strict';

function alertUser(msg) {
	$('div.alert-area').html(msg);
	$('div.alert-container').fadeIn("fast");
	setTimeout(() => { $('div.alert-container').fadeOut("slow"); }, 4000);
}

function clearInputs() {
	$('.js-uname-entry').val() = '';
	$('.js-pword-entry').val() = '';
	$('.js-fname-entry').val() = '';
	$('.js-lname-entry').val() = '';
}

function handleSignupClick() {
	//reminder - send recaptcha token to https://www.google.com/recaptcha/api/siteverify

	console.log('handleSignupClick ran.');
	$('.js-signup-button').click(function(e) {
		e.preventDefault();
		const uname = $('.js-uname-entry').val();
		const pword = $('.js-pword-entry').val();
		const fname = $('.js-fname-entry').val();
		const lname = $('.js-lname-entry').val();

		//Make sure no empty strings will be submitted, then 
		if (uname != '' && pword != '') {
			const signupParams = {
				username: uname,
				password: pword,
				firstName: fname,
				lastName: lname
			};
			$.ajax({
				contentType: 'application/json',
				data: JSON.stringify(signupParams),
				dataType: 'json',
				success: function(data){
					if (data.username) {
						const alertSuccess = `Welcome ${data.username}! Please log in.`;
						window.location.replace('/login?welcome');
						alertUser(alertSuccess);
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
				url: '/api/users'
			});
		} else {
			const alertBlank = 'Please enter a username and / or password.';
			alertUser(alertBlank);
		}
	});
}

//Document ready callback function - powers the page.
function renderSignupPage() {
	handleSignupClick();
}

console.log('App started. Login page loaded.');
$(renderSignupPage);