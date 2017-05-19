const request = require("request");

var osu = function (api_key) {
	if (!(this instanceof osu)) {
		return new osu(api_key);
	}
	if (!api_key) {
		throw new Error("Please supply an API key. See https://osu.ppy.sh/p/api for details.");
	}
	this.api_key = api_key;
	this.base_url = "https://osu.ppy.sh/api";
	let self = this;

	this.api_call = function (url, options) {
		return new Promise(function (resolve) {
			options["k"] = self.api_key;
			var payload = {
				"baseUrl": self.base_url,
				"method": "GET",
				"qs": options,
				"url": url,
			};
			request(payload, function (error, response, body) {
				if (error) {
					throw new Error("API '" + url + "' failed. Error: " + error.toString());
				}
				var result = JSON.parse(body);
				resolve(result);
			});
		});
	};

	this.get_beatmaps = function (options) {
		return self.api_call("/get_beatmaps", options);
	};

	this.get_user = function (options) {
		return self.api_call("/get_user", options);
	};

	this.get_scores = function (options) {
		return self.api_call("/get_scores", options);
	};

	this.get_user_best = function (options) {
		return self.api_call("/get_user_best", options);
	};

	this.get_user_recent = function (options) {
		return self.api_call("/get_user_recent", options);
	};

	this.get_match = function (options) {
		return self.api_call("/get_match", options);
	};

	this.get_replay = function (options) {
		return self.api_call("/get_replay", options);
	};
};

module.exports = osu;
