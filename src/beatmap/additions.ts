import {ParseError} from "../errors";

import {AdditionType, HitsoundType} from "./structs";

export default class Hitsound {
    constructor(
        public Sample: HitsoundType,
        public Additions: AdditionType,
    ) {}

    static parse(line: string): Hitsound {
        let parts = line.split(":");

        let sample = null;
        let addition = null;

        if (parts[0] && parts[0] !== "0")
            sample = HitsoundType[parseInt(parts[0])];
        if (parts[1] && parts[1] !== "0")
            additions.additionalSample = additionTypes[parseInt(parts[1])];
        if (parts[2] && parts[2] !== "0")
            additions.customSampleIndex = parseInt(parts[2]);
        if (parts[3] && parts[3] !== "0")
            additions.hitsoundVolume = parseInt(parts[3]);
        if (parts[4] && parts[4] !== "0")
            additions.hitsound = parts[4];

        if (sample == null || addition == null)
            throw new ParseError(`Invalid hitsound: '${line}'`);
        return new Hitsound(sample, addition);
    }
}
