window.onload = function () {
	// validate input in browser side.
	var fm = document.getElementsByTagName('form')[0];

	fm.onsubmit = function () {
		// remove leading and tailing spaces if have.
		var clearSpaces = function (string) {
			var pattern1 = /^\s+/;
			var pattern2 = /\s+$/;
			string = string.replace(pattern1, '').replace(pattern2, '');
			return string;
		};

		var username = clearSpaces(fm.username.value);
		var password = clearSpaces(fm.password.value);

		// username validation
		if (!(/^[\w]{3,20}$/.test(username))) {
			alert('Only letter, number and underscore are allowed in username, within 3~20 characters!');
			fm.username.value = '';
			fm.username.focus();
			return false;
		}

		// password length validation
		if (password.length < 6) {
			alert('The length of password must be longer than 6 characters!');
			fm.password.value = '';
			fm.password.focus();
			return false;
		}

		return true;
	};
	
	
	// forbid the right-click
	document.oncontextmenu = function (e) {
		return false;
	};
};