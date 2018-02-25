var StyledTable = function(result) {

	this.Result = result;

	this.StringComparer = function (a, b) {
		if (a.primary < b.primary)
			return -1;
		else if (a.primary > b.primary)
			return 1;
		else
			return 0;
	}
}

StyledTable.prototype.CreateTable = function () {

	// Create a new table element
	var table = document.createElement("TABLE");
	table.className = "styledtable";
	table.id = "table1";
	// Create an empty <thead> element and add it to the table:
	var header = table.createTHead();

	// Create an empty <tr> element and add it to the first position of <thead>:
	var rowhead = header.insertRow(0);
	rowhead.className = "styledtableheadrow";
	// Insert a new cell (<td>) at the first position of the "new" <tr> element:
	var cell1 = rowhead.insertCell(0);

	// Add some bold text in the new cell:
	cell1.innerHTML = StringResources.GetResourceString(Settings.PrimaryLanguage);

	// Insert a new cell (<td>) at the first position of the "new" <tr> element:
	var cell2 = rowhead.insertCell(1);

	// Add some bold text in the new cell:
	cell2.innerHTML = StringResources.GetResourceString(Settings.SubsequentLanguage);

	var directHits = [];
	var secondHits = [];
	$.each(this.Result.value, function () {
		var searchText = $("#inputSearch").val();
		// if the current result starts with the keyed-in text
		// => add it immediately to the result html
		if (this[Settings.PrimaryLanguage].match("^" + searchText)) {
			var row = {
				primary: this[Settings.PrimaryLanguage],
				secondary: this[Settings.SubsequentLanguage]
			};
			directHits.push(row);
		}
		else {
			// all other translations are stored in a list and added at the bottom
			var row = {
				primary: this[Settings.PrimaryLanguage],
				secondary: this[Settings.SubsequentLanguage]
			};
			secondHits.push(row);
		}
	});

	var tbody = table.createTBody();

	directHits.sort(this.StringComparer);
	secondHits.sort(this.StringComparer);
	var concatenated = directHits.concat(secondHits);

	var languagecounthtml = "<span class=\"badge\">" + concatenated.length + "</span>";
	$("#messagetext").html(languagecounthtml);

	var index = 1;
	$.each(concatenated, function () {
		var zebraClass = "";
		if (index % 2 == 0)
			zebraClass = "zebra";

		// Create an empty <tr> element and add it to the last position of the table:
		var row = table.insertRow(index);
		row.className = zebraClass + " styledtablebodyrow";

		// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		cell1.className = "styledtablebodycell";
		cell2.className = "styledtablebodycell";

		var searchText = $("#inputSearch").val().toLowerCase();
		var indexStart = this.primary.indexOf(searchText);
		var endIndex = indexStart + searchText.length;
		var cellHtml = this.primary.substring(0, indexStart) +
			"<span class=\"hightlighted\">" + this.primary.substring(indexStart, endIndex) + "</span>" +
			this.primary.substring(endIndex, this.primary.length + 1);
		cell1.innerHTML = cellHtml;

		cell2.innerHTML = this.secondary
		index++;
	});

	return table;
};