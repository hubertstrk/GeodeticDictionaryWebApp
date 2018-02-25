(function About() {
	
	var Instance = this;

	$(document).ready(function () {
		RegisterEventHandler();
		RequestDocumentCount();
	});
	
	var RegisterEventHandler = function () {

	}

	this.RequestDocumentCount = function () {
		var request = $.ajax({
			url: "https://gddictionary.search.windows.net/indexes/words/docs/$count?api-version=2015-02-28",
			method: "GET",
			beforeSend: function (request) {
				request.setRequestHeader('Api-Key', '[api key]');
				request.setRequestHeader('Accept', 'text/plain');
			}
		});

		request.success(function (msg) {
			var text = "Currently there are <span class=\"badge\">" + msg + "</span> word translations available.";
			$("#count").html(text);
		});

		request.fail(function (jqXHR, textStatus) {
			alert("Request failed: " + textStatus);
		});
	}
})();