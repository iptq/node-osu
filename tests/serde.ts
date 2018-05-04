import * as assert from "assert";
import {Beatmap} from "../src";

describe("serialize/deserializing beatmaps", () => {
    it("should parse successfully", (cb) => { Beatmap.parse(__dirname + "/files/1606067.osu").then(map => { cb(); }).catch(err => { cb(err); }); });
});
