var Settings = {
	PrimaryLanguage: "german",
	SubsequentLanguage: "english",
	Option: "loose"
};

(function Request() {
	
	var timer;
	var Instance = this;

	$(document).ready(function () {
		RegisterEventHandler();
	});

	var RegisterEventHandler = function () {

		$(window).on("OnLanguageChanged", function () {
			ClearResultContent();
			CleanInputText();
			SetLanguageHint();
		});

		$('#fuzzy').on('click', 'a', function (event) {
			PrepareForFuzzySearch(this.text);
		});

		$("#languagelink-de").click(function () {
			SetPrimaryLanguage("german");
			$.cookie("dgdictionary-language", "german")
		});

		$("#languagelink-en").click(function () {
			SetPrimaryLanguage("english");
			$.cookie("dgdictionary-language", "english")
		});

		$("#option-strict").click(function () {
			SetOption("strict");
			StartSearch();
			$.cookie("dgdictionary-option", "strict")
		});

		$("#option-loose").click(function () {
			SetOption("loose");
			StartSearch();
			$.cookie("dgdictionary-option", "loose")
		});

		$("#inputSearch").keyup(function () {
			StartSearch();
		});

		Progress = new Progress("myBar");

		var optionCookie = $.cookie("dgdictionary-option");
		if (optionCookie === undefined)
			optionCookie = "loose";
		SetOption(optionCookie);
		var languageCookie = $.cookie("dgdictionary-language");
		if (languageCookie === undefined)
			languageCookie = "german";
		SetPrimaryLanguage(languageCookie);
	};

	var SetPrimaryLanguage = function (primary) {
		Settings.PrimaryLanguage = primary;
		if (primary == "german") {
			Settings.SubsequentLanguage = "english";
		}
		else {
			Settings.SubsequentLanguage = "german";
		}

		$(window).trigger("OnLanguageChanged");

		$.cookie("dgdictionary-language", Settings.PrimaryLanguage);
	};

	var SetOption = function (option) {
		if (this.Option === option)
			return;

		Settings.Option = option;

		$("#inputSearch").trigger("keyup");

		$.cookie("dgdictionary-option", Settings.Option);
	};

	var GetCurrentSearchText = function () {
		var searchText = $("#inputSearch").val();
		return searchText.toLowerCase();
	}

	var ClearResultContent = function () {
		$("#tableDiv").html("");
		$("#fuzzy").addClass("hidden");
		$("#fuzzySearch").html("");
		$("#messagetext").html("");
	};

	var SetLanguageHint = function () {
		$('#languagehint').html(StringResources.GetResourceString(Settings.PrimaryLanguage)
				+ " - " + StringResources.GetResourceString(Settings.SubsequentLanguage));
	}

	var CleanInputText = function (){
		$('#inputSearch').val("");
		$('#inputSearch').focus();
	}

	var StartSearch = function () {
		window.clearTimeout(timer);
		var searchText = GetCurrentSearchText();
		if (searchText.length < 3)
		{
			ClearResultContent();
			$("#fuzzy").addClass("hidden");
			return;
		}
		timer = window.setTimeout(function () { RequestSimpleTranslation(searchText) }, 500);
	}

	var RequestSimpleTranslation = function(searchText){

		ClearResultContent();

		Progress.StartProgressBar();

		var searchTerm = CreateSimpleSearchTerm(searchText);
		var request = $.ajax({
			url: "https://gddictionary.search.windows.net/indexes/words/docs?api-version=2015-02-28",
			method: "GET",
			data: { queryType: "simple", searchFields: Settings.PrimaryLanguage, search: searchTerm, $top: 200 },
			beforeSend: function (request) {
				request.setRequestHeader('Api-Key', '[api key]');
			},
			contentType: "application/json",
			dataType: 'Json',
		});

		request.success(function (msg) {

			Progress.SetProgressBarEnd();

			DisplayTranslation(msg);
		});

		request.fail(function (jqXHR, textStatus) {
			alert("Request failed: " + textStatus);
		});
	}

	var RequestFuzzy = function (searchTerm, fuzzyDef, callback) {

		var url = "https://gddictionary.search.windows.net/indexes/" + Settings.PrimaryLanguage + "/docs?api-version=2015-02-28";
		var request = $.ajax({
			url: url,
			method: "GET",
			data: { queryType: "full", searchFields: Settings.PrimaryLanguage, search: searchTerm },
			beforeSend: function (request) {
				request.setRequestHeader('Api-Key', '[api key]');
			},
			contentType: "application/json",
			dataType: 'Json',
		});

		request.success(function (json) {
			var result = { result: json, fuzzy: fuzzyDef };
			CollectFuzzyRequest(result);

			if (callback )
				callback();
		});

		request.fail(function (jqXHR, textStatus) {
			alert("Request failed: " + textStatus);
		});
	}

	var CreateSuggestions = function () {

		_Suggestions = [];
		RequestFuzzy1();
	}

	var RequestFuzzy1 = function() {
		var searchTerm1 = CreateFuzzySearchTerm(1);
		RequestFuzzy(searchTerm1, 1, function () { RequestFuzzy2.call() });
	}

	var RequestFuzzy2 = function(){ 
		var searchTerm2 = CreateFuzzySearchTerm(2);
		RequestFuzzy(searchTerm2, 2, function () { RequestFuzzy3.call() });
	}

	var RequestFuzzy3 = function () {
		var searchTerm3 = CreateFuzzySearchTerm(3);
		RequestFuzzy(searchTerm3, 3, function () { DisplaySuggestions.call() });
	}

	var DisplaySuggestions = function () {

		var html = [];
		var added = [];
		var searchTerm = GetCurrentSearchText();

		$.each(_Suggestions, function () {
			if ($.inArray(this.suggestion, added) < 0) {

				added.push(this.suggestion);
				var classname = "fuzzytext" + this.fuzzy;

				var section = document.createElement("P");
				section.classList.add(classname);
				
				var link = "<a href=\"#\">" + this.suggestion + "</a>";
				section.innerHTML = link;
				html += section.outerHTML;
			}});

			// add the html block to the page
			if (html != "") {
				$("#fuzzy").removeClass("hidden");
				$("#fuzzyResult").html(html);
			}
			else
				$("#messagetext").html("Sorry, couldn't find any translation.");
		}			

	var CollectFuzzyRequest = function (msg) {
		$.each(msg.result.value, function () {
			var suggestion = this[Settings.PrimaryLanguage];
			var pushObject = { suggestion: suggestion, fuzzy: msg.fuzzy };
			_Suggestions.push(pushObject);
		});
	}

	var PrepareForFuzzySearch = function (suggestion) {
		$("#fuzzy").addClass("hidden");
		$("#fuzzySearch").html("");
		$("#inputSearch").val(suggestion);
		RequestSimpleTranslation(suggestion);
	}
 
	var CreateSimpleSearchTerm = function (searchText) {

		var searchTerm = searchText;
		var splitted = searchTerm.split(" ");

		// in case user keyed in more than one words
		// => each word must be concatenated with '+'
		if (splitted.length > 1) {
			var joined = splitted.join("+");
			searchTerm = joined.toString();
		}

		// - loose => find all translations containing the whole or a substring of the keyed-in text
		// - strict => find only whole words
		if (Settings.Option == "loose")
			searchTerm += "*";

		return searchTerm;
	}

	var CreateFuzzySearchTerm = function( fuzzyDef )
	{
		var searchTerm = GetCurrentSearchText();
		searchTerm += "~" + fuzzyDef; // fuzzy search parameter (possible: [1-3])
		return searchTerm;
	}

	DisplayTranslation = function (result) {

		var searchText = GetCurrentSearchText();

		if (result.value.length == 0 && searchText.length > 2) {
			
			$("#messagetext").html("");

			CreateSuggestions();

			return;
		}

		var tableCreator = new StyledTable(result);

		var table = tableCreator.CreateTable();

		$("#tableDiv").html(table);
	}
})();