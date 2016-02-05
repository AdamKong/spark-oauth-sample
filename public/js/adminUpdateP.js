window.onload = function () {
	// validate input in browser side.
	var fm = document.getElementsByTagName('form')[0];

	fm.onsubmit = function () {

		// A function for confirming with user when user trying to update own profile.
		if (!confirm('Are you sure you want to update your profile?')) {
			return false;
		}

		var defaultValuePassword = fm.password.defaultValue;
		var defaultValueRe_password = fm.re_password.defaultValue;
		var defaultValueEmail = fm.email.defaultValue;

		var currentValuePassword = fm.password.value;
		var currentValueRe_password = fm.re_password.value;
		var currentValueEmail = fm.email.value;

		// If there is no change to the form, then no need to submit form
		if ((defaultValuePassword === currentValuePassword) && (defaultValueRe_password === currentValueRe_password) && (defaultValueEmail === currentValueEmail)) {
			alert('You have not changed anything to the profile. No need to submit!');
			return false;
		}

		// remove leading and tailing spaces if have.
		var clearSpaces = function (string) {
			var pattern1 = /^\s+/;
			var pattern2 = /\s+$/;
			string = string.replace(pattern1, '').replace(pattern2, '');
			return string;
		};

		var password = clearSpaces(currentValuePassword);
		var re_password = clearSpaces(currentValueRe_password);
		var email = clearSpaces(currentValueEmail);

		// password length validation
		if (((password.length !== 0) || (re_password.length !== 0)) && (password.length < 6)) {
			alert('The length of password must be longer than 6 characters!');
			fm.password.value = '';
			fm.re_password.value = '';
			fm.password.focus();
			return false;
		}

		// password validation
		if (((password.length !== 0) || (re_password.length !== 0)) && (password !== re_password)) {
			alert('The passwords you input do not match!');
			fm.password.value = '';
			fm.re_password.value = '';
			fm.password.focus();
			return false;
		}

		// simple email validation
		if (!(/^([\w\.\-]+)@([\w\.\-]+)\.([a-zA-Z]{2,4})$/.test(email))) {
			alert('The email format is incorrect!');
			fm.email.value = '';
			fm.email.focus();
			return false;
		}

		return true;
	};
	
	// forbid the right-click
	document.oncontextmenu = function (e) {
		return false;
	};
	
};