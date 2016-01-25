osu! API Helper Library
======

Node.js is an excellent way to build apps for the osu! API, and using the helper library makes accessing the osu! API easier than ever!

To use the library, you must first register an API key on [the osu! website](https://osu.ppy.sh/p/api). Installing the library into your project is as simple as

```bash
npm install osu
```

or use the `--save` option if you'd like to add it as a dependency. Here's how to use it:

```javascript
const osu = require("osu")("xxxxxxxx"); // replace xxxxxxxx with your API key
```

Then you may call any function. Check out the [osu! API's documentation](https://github.com/ppy/osu-api/wiki) for details. Every endpoint in the osu! API has a corresponding function; for example, if you're trying to access the `/api/get_beatmaps` endpoint, you would use the following code:

```javascript
osu.get_beatmaps({
	"s": 39804,
	"limit": 1
}, function(result) {
	console.log(result);
);
```

which of course, would return something like this:

```json
[{
    "beatmapset_id": "39804",
    "beatmap_id": "126645",
    "approved": "2",
    "total_length": "257",
    "hit_length": "225",
    "version": "Another",
    "file_md5": "7ec692e1bb3cd873d19ddaf922bb76bc",
    "diff_size": "4",
    "diff_overall": "8",
    "diff_approach": "9",
    "diff_drain": "7",
    "mode": "0",
    "approved_date": "2012-06-24 00:42:35",
    "last_update": "2012-06-23 11:19:39",
    "artist": "xi",
    "title": "FREEDOM DiVE",
    "creator": "Nakagawa-Kanon",
    "bpm": "222.22",
    "source": "BMS",
    "tags": "parousia onosakihito kirisaki_hayashi",
    "genre_id": "2",
    "language_id": "5",
    "favourite_count": "1215",
    "playcount": "2395804",
    "passcount": "152054",
    "max_combo": "1945",
    "difficultyrating": "6.422895908355713"
}]
```

Each function takes two parameters: the options that will help filter the search and the callback function that will be run when the call is complete (this is necessary because all the calls are asynchronous). The callback function should take in one parameter, `result`, the array of objects that is returned from the API.

Contact
------

Author: IOException

License: MIT

Email: ioexceptionosu@gmail.com