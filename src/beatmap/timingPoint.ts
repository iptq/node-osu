import {ParseError} from "../errors";

export default class TimingPoint {
    public BPM: number;
    public BaseOffset: number;

    constructor(
        public Offset: number,
        public BeatLength: number,
        public Velocity: number,
        public Meter: number,
        public SampleSetId: number,
        public CustomSampleIndex: number,
        public SampleVolume: number,
        public TimingChange: boolean,
        public KiaiTimeActive: boolean,
    ) {
        this.BPM = 0;
        this.BaseOffset = Offset;
    }

    static parse(line: string): TimingPoint {
        let parts = line.split(",");
        let offset = parseInt(parts[0]);
        let beatLength = parseFloat(parts[1]);
        let tp: TimingPoint;

        if (isNaN(beatLength) || beatLength == 0)
            throw new ParseError(`Could not determine timing point type with beatLength = '${parts[1]}'`);

        let BeatLength = beatLength;
        let Meter = parseInt(parts[2]);
        let SampleSetId = parseInt(parts[3]);
        let CustomSampleIndex = parseInt(parts[4]);
        let SampleVolume = parseInt(parts[5]);
        let TimingChange = parseInt(parts[6]) == 1;
        let KiaiTimeActive = parseInt(parts[7]) == 1;

        if (beatLength > 0) {
            // Red line
            tp = new UninheritedTimingPoint(offset, BeatLength, 1, Meter, SampleSetId, CustomSampleIndex, SampleVolume, TimingChange, KiaiTimeActive);
            tp.BPM = Math.round(60000 / beatLength);
        } else {
            // Green line
            let Velocity = Math.abs(100 / beatLength);
            tp = new InheritedTimingPoint(offset, BeatLength, Velocity, Meter, SampleSetId, CustomSampleIndex, SampleVolume, TimingChange,
                                          KiaiTimeActive);
        }

        return tp;
    }

    serialize(): string {
        let parts: string[] = [];
        // parts.push(this.Offset);
        // parts.push(this.timingChange ? this.beatLength : -100 / this.velocity);
        // parts.push(this.timingSignature);
        // parts.push(this.sampleSetId);
        // parts.push(this.customSampleIndex);
        // parts.push(this.sampleVolume);
        // parts.push(this.timingChange ? "1" : "0");
        // parts.push(this.kiaiTimeActive ? "1" : "0");
        return parts.join(",");
    }
}

export class UninheritedTimingPoint extends TimingPoint {}

export type RedTimingPoint = UninheritedTimingPoint;

export class InheritedTimingPoint extends TimingPoint {}

export type GreenTimingPoint = InheritedTimingPoint;
