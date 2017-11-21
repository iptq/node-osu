osu! Standard Library
=====================

This library aims to be an all-in-one library for developing osu! related applications using Javascript/Node.js. Here is a list of its current features (checked) and planned features (unchecked). Drop an issue if there's something you want to see in this list!

- [x] osu! API driver
- [ ] Beatmap parser
- [ ] Built-in implementation of oppai
- [ ] Mapset utils

Getting Started
---------------

To install this package, run the following command in the root directory of your project:

```bash
npm install --save osu
```

You're ready to use this package! Check out the documentation (coming soon) for guides and an API reference.

Using the osu! API
------------------

Replace the `xxxxx` below with your osu! API key. You can find your osu! API key at https://osu.ppy.sh/p/api.
```javascript
// replace xxxxx with your API key
const api = require("osu").api("xxxxx");
```

Now you can call any API function you'd like. Here is an example of retrieving the infamous beatmap for FREEDOM DiVE.

```javascript
api.getBeatmaps({
    "s": 39804,
    "limit": 1
}).then(function(result) {
    console.log(result);
);
```

This class employs Promises to handle asynchronous execution. This means the object returned by `api.getBeatmaps` is not the actual beatmap information you were looking for, but a `Promise` object that will execute independently of the current program. This is why the callback function that takes in the `result` object is necessary. To read more about Promises, read [this helpful introduction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) from the MDN reference.

Contact
------

Author: IOException

License: MIT

Email: ioexceptionosu@gmail.com