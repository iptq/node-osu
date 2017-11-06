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
 * const api = require("osu").api("xxxxx");
 * ```
 * 
 * Now you can call any API function you'd like. Here is an example of retrieving the infamous beatmap for FREEDOM DiVE.
 * ```javascript
 * api.getBeatmaps({
 *     "s": 39804,
 *     "limit": 1
 * }).then(function(result) {
 *     console.log(result);
 * );
 * ```
 * 
 * This class employs Promises to handle asynchronous execution. This means the object returned by `api.getBeatmaps` is not the actual beatmap information you were looking for, but a `Promise` object that will execute independently of the current program. This is why the callback function that takes in the `result` object is necessary. To read more about Promises, read [this helpful introduction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) from the MDN reference.
 */
export class APIWrapper {
    /**
     * The API key passed in by the user. This value should not change after the class has been initialized. Should you need to use another API key in the same program, create another instance of this class.
     */
    private _apiKey: string;

    /**
     * The base URL for the osu! API. This should only change if the osu! API location were to change (for example, in case the osu! API decides to use versioning).
     */
    private _baseUrl: string = "https://osu.ppy.sh/api";

    /**
     * Setter for the API key property. Right now this doesn't really do anything but exists in case any validation on the key needs to be performed.
     */
    set apiKey(apiKey: string) {
        this._apiKey = apiKey;
    }

    /**
     * Constructor for the API wrapper.
     * 
     * @param apiKey The API key that the class should be initialized with.
     */
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Makes an HTTP request to an osu! API.
     * 
     * @param url The URL of the API that's being called.
     * @param options An object consisting of parameters to be passed to the API.
     * @returns A Promise object that will resolve to the result from the API call.
     */
    private apiCall(url: string, options: APIOptions): Promise<Object> {
        options["k"] = this._apiKey;
        const payload = {
            "baseUrl": this._baseUrl,
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
    public getBeatmaps(options: APIOptions): Promise<Object> {
        return this.apiCall("/get_beatmaps", options);
    }

    /**
     * Makes a call to the `/get_match` API.
     * @param options A dictionary of parameters to provide to the API. See the osu! API documentation for more details.
     */
    public getMatch(options: APIOptions): Promise<Object> {
        return this.apiCall("/get_match", options);
    }

    /**
     * Makes a call to the `/get_replay` API.
     * @param options A dictionary of parameters to provide to the API. See the osu! API documentation for more details.
     */
    public getReplay(options: APIOptions): Promise<Object> {
        return this.apiCall("/get_replay", options);
    }

    /**
     * Makes a call to the `/get_scores` API.
     * @param options A dictionary of parameters to provide to the API. See the osu! API documentation for more details.
     */
    public getScores(options: APIOptions): Promise<Object> {
        return this.apiCall("/get_scores", options);
    }

    /**
     * Makes a call to the `/get_user` API.
     * @param options A dictionary of parameters to provide to the API. See the osu! API documentation for more details.
     */
    public getUser(options: APIOptions): Promise<Object> {
        return this.apiCall("/get_user", options);
    }

    /**
     * Makes a call to the `/get_user_best` API.
     * @param options A dictionary of parameters to provide to the API. See the osu! API documentation for more details.
     */
    public getUserBest(options: APIOptions): Promise<Object> {
        return this.apiCall("/get_user_best", options);
    }

    /**
     * Makes a call to the `/get_user_recent` API.
     * @param options A dictionary of parameters to provide to the API. See the osu! API documentation for more details.
     */
    public getUserRecent(options: APIOptions): Promise<Object> {
        return this.apiCall("/get_user_recent", options);
    }
}

/**
 * A function for users to easily initialize the APIWrapper class without having to use the `new` operator.
 * @param apiKey The API key used to initialize the class.
 */
export function api(apiKey: string): APIWrapper {
    return new APIWrapper(apiKey);
}
