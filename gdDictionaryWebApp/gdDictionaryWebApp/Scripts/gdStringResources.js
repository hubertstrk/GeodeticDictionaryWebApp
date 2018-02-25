function StringResources() {
	this.GetResourceString = function (text) {
		if (text == "german")
			return "German";
		else if (text = "english")
			return "English";
		else
			return text;
	}
}