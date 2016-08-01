window.onload = function () {
	
	var location = '';
	// set anchor
	var locator = document.getElementsByName('locator')[0];
	if(locator.id !== '') {
		location = locator.id;
		locator.id = '';
	}
	
	// remove leading and tailing spaces if have.
	var clearSpaces = function (string) {
		var pattern1 = /^\s+/;
		var pattern2 = /\s+$/;
		string = string.replace(pattern1, '').replace(pattern2, '');
		return string;
	};
	
	
	// the form of submitting email to request tokens
	var fm = document.getElementsByTagName('form');

	fm[0].onsubmit = function () {

		var email = clearSpaces(fm[0].email.value);

		// simple email validation
		if (!(/^([\w\.\-]+)@([\w\.\-]+)\.([a-zA-Z]{2,4})$/.test(email))) {
			alert('The email format is incorrect!');
			fm[0].email.value = '';
			fm[0].email.focus();
			return false;
		}

		return true;
	};
	
	// register events for each form
	for (var i = 1; i < fm.length; i++) {
		fm[i].onsubmit = function () {
			// confirm before taking action
			if (!confirm('Are you sure? you will miss the current token!')) {
				return false;
			}			
			// Check Token index ID in database
			if (/^[a-zA-Z0-9]{24}$/.test(clearSpaces(this.token_id.value))) {
				// Check Token ID
				if (/^[a-zA-Z0-9]{64}$/.test(clearSpaces(this.refresh_token.value))) {
					// Check email format
					if (/^([\w\.\-]+)@([\w\.\-]+)\.([a-zA-Z]{2,4})$/.test(clearSpaces(this.email.value))) {
						// Check anchor ID format
						if (/^[1-9]{1}[0-9]*$/.test(clearSpaces(this.anchorID.value))) {
							for (var j = 0; j < fm.length; j++) {
								fm[j].s.disabled = 'disabled';
							}
							this.s.value='Operating, please wait!';
							return true;							
						} else {
							alert('In refreshing Token - The anchor ID format is not correct!');
							return false;								
						}
					} else {
						alert('In refreshing Token - The email format is not correct!');
						return false;							
					}
				} else {
					alert('In refreshing Token - The refresh_token ID format is not correct!');
					return false;						
				}
			} else {
				alert('In refreshing Token - The refresh_token ID format is not correct!');
				return false;				
			}
		}
	}
	
	// forbid the right-click
	document.oncontextmenu = function (e) {
		return false;
	};
	
	window.location.hash = location;
};