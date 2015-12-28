window.onload = function () {
	// validate input in browser side.
	var fm = document.getElementsByTagName('form')[0];
	fm.onsubmit = function () {

		// Use client validation if possible!
		if (fm.roomName.value.length < 2 || fm.roomName.value.length > 20) {
			alert('The length of room mame should be within 2~20!');
			fm.roomName.value = '';
			fm.roomName.focus();
			return false;
		}

		// validate special characters.
		if (/[<>\'\"]/.test(fm.roomName.value)) {
			alert('Room name can not contain special characters!');
			fm.roomName.value = '';
			fm.roomName.focus();
			return false;
		}

		// validate the email format
		if (!(/^[\w-\.]+@[\w-\.]+(\.\w+)+$/.test(fm.userEmail.value))) {
			alert('Email format is not valid!');
			fm.userEmail.value = '';
			fm.userEmail.focus();
			return false;
		}

		return true;
	};
};