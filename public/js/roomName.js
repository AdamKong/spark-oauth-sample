window.onload = function () {
	// validate input in browser side.
	var fm = document.getElementsByTagName('form')[0];
	fm.onsubmit = function () {
		// remove leading and ending spaces if have.
		var roomNameBeforeClear = fm.roomName.value;
		var pattern1 = /^\s+/;
		var pattern2 = /\s+$/;
		var roomName = roomNameBeforeClear.replace(pattern1, '').replace(pattern2, '');

		// Control the length of valid room name.
		if (roomName.length < 3 || roomName.length > 20) {
			alert('The length of valid room name should be within 3~20!');
			fm.roomName.value = '';
			fm.roomName.focus();
			return false;
		} else {
			fm.s1.disabled = 'disabled';
			return true;
		}
	};

	// forbid the right-click
	document.oncontextmenu = function (e) {
		return false;
	};
};