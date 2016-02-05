window.onload = function () {
	var fm = document.getElementsByTagName('form')[0];
	fm.onsubmit = function () {
		fm.s1.disabled = 'disabled';
	};
};