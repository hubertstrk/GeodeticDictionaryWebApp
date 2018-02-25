var Progress = function (elementId) {

	var id = elementId;
	var timerId;
	this.StartProgressBar = function () {
		requestDone = false;
		var elem = document.getElementById(elementId);
		var width = 1;

		timerId = setInterval(frame, 3);
		function frame() {
			if (width >= 100) {
				clearInterval(timerId);
			} else {
				width++;
				elem.style.width = width + '%';
			}
		}
	}

	this.SetProgressBarEnd = function () {
		clearInterval(timerId);
		var elem = document.getElementById(elementId);
		elem.style.width = 100 + '%';
	}
}