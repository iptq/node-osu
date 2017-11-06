import { get } from "request";
import { APIError } from "./errors";

/**
 * Basic definition for a key-value pair, used for API options.
 */
export type APIOptions = { [key: string]: string };

/**
 * API wrapper class.
 * 
 * To use this class, you must first initialize it with your osu! API key. You can find your osu! API key at https://osu.ppy.sh/p/api.
 * ```javascript
 * // replace xxxxx with your API key
 * const api = require("osu").API("xxxxx");
 * ```
 * 
 * Now you can call any API function you'd like. Here is an example of retrieving the infamous beatmap for FREEDOM DiVE.
 * ```javascript
 * api.get_beatmaps({
 *     "s": 39804,
 *     "limit": 1
 * }).then(function(result) {
 *     console.log(result);
 * );
 * ```
 * 
 * This class employs Promises to handle asynchronous execution. This means the object returned by `api.get_beatmaps` is not the actual beatmap information you were looking for, but a `Promise` object that will execute independently of the current program. This is why the callback function that takes in the `result` object is necessary. To read more about Promises, read [this helpful introduction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) from the MDN reference.
 */
export class API {
    /**
     * The API key passed in by the user. This value should not change after the class has been initialized. Should you need to use another API key in the same program, create another instance of this class.
     */
    private _api_key: string;

    /**
     * The base URL for the osu! API. This should only change if the osu! API location were to change (for example, in case the osu! API decides to use versioning).
     */
    private _base_url: string = "https://osu.ppy.sh/api";

    /**
     * Setter for the API key property. Right now this doesn't really do anything but exists in case any validation on the key needs to be performed.
     */
    set api_key(api_key: string) {
        this._api_key = api_key;
    }

    /**
     * Constructor for the API wrapper.
     * 
     * @param api_key The API key that the class should be initialized with.
     */
    constructor(api_key: string) {
        this.api_key = api_key;
    }

    /**
     * Makes an HTTP request to an osu! API.
     * 
     * @param url The URL of the API that's being called.
     * @param options An object consisting of parameters to be passed to the API.
     * @returns A Promise object that will resolve to the result from the API call.
     */
    private api_call(url: string, options: APIOptions): Promise<Object> {
        options["k"] = this._api_key;
        const payload = {
            "baseUrl": this._base_url,
            "qs": options,
            "url": url
        };
        return new Promise((resolve) => {
            get(payload, (error, response, body) => {
                if (error)
                    throw new APIError(`Failed to call API ${url}. Error: ${error.toString()}`);
                const result = JSON.parse(body);
                resolve(result);
            });
        });
    }

    /**
     * Makes a call to the `/get_beatmaps` API.
     * @param options A dictionary of parameters to provide to the API. See the osu! API documentation for more details.
     */
    public get_beatmaps(options: APIOptions): Promise<Object> {
        return this.api_call("/get_beatmaps", options);
    }

    /**
     * Makes a call to the `/get_scores` API.
     * @param options A dictionary of parameters to provide to the API. See the osu! API documentation for more details.
     */
    public get_scores(options: APIOptions): Promise<Object> {
        return this.api_call("/get_scores", options);
    }

    /**
     * Makes a call to the `/get_user` API.
     * @param options A dictionary of parameters to provide to the API. See the osu! API documentation for more details.
     */
    public get_user(options: APIOptions): Promise<Object> {
        return this.api_call("/get_user", options);
    }
}