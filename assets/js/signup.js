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
			// $.ajax({
			// 	type: "POST",
			// 	url: "/api/users",
			// 	data: JSON.stringify(signupParams),
			// })
			// 	.done ((data) => {
			// 		if (data.username) {
			// 			alertSuccess = `Welcome ${data.username}! Please log in.`
			// 			window.location.replace('/login');
			// 			alertUser(alertSuccess);
			// 		} else {
			// 			clearInputs();
			// 			const alertInvalid = 'Please enter a valid username and/or password.';
			// 			alertUser(alertInvalid);
			// 		}
			// 	});
			$.post("/api/users", JSON.stringify(signupParams), function(data) {			
				if (data.username) {
					alertSuccess = `Welcome ${data.username}! Please log in.`
					window.location.replace('/login');
					alertUser(alertSuccess);
				} else {
					clearInputs();
					const alertInvalid = 'Please enter a valid username and/or password.';
					alertUser(alertInvalid);
				}
			}, "json");
		} else {
			const alertBlank = 'Please enter a username and / or password.';
			alertUser(alertBlank);
		}
	});
}

// function postCallback(data) {			
// 	if (data.username) {
// 		alertSuccess = `Welcome ${data.username}! Please log in.`
// 		window.location.replace('/login');
// 		alertUser(alertSuccess);
// 	} else {
// 		clearInputs();
// 		const alertInvalid = 'Please enter a valid username and/or password.';
// 		alertUser(alertInvalid);
// 	}
// };

//Document ready callback function - powers the page.
function renderSignupPage() {
	handleSignupClick();
}

console.log('App started. Login page loaded.');
$(renderSignupPage);