import {existsSync} from "fs";

import Color from "../color";
import {readFileAsync} from "../utils";

import {HitCircle, HitObject, Slider, Spinner} from "./hitObject";
import {Difficulty, DifficultyProperties} from "./structs";
import TimingPoint, {UninheritedTimingPoint} from "./timingPoint";

const sectionPattern = /^\[([a-zA-Z0-9]+)\]$/, keyPairPattern = /^([a-zA-Z0-9]+)[ ]*:[ ]*(.+)?$/;

export class Beatmap {
    public MaxCombo: number = 0;

    public ComboColors: Color[] = [];
    public Tags: string[] = [];

    constructor(
        public FileFormat: number,
        public BpmMin: number = 0,
        public BpmMax: number = Infinity,
        public Difficulty: Difficulty,
        public Bookmarks: number[],
        public HitObjects: HitObject[],
        public TimingPoints: TimingPoint[],
    ) {}

    static async parse(file: string): Promise<Beatmap> {
        if (!existsSync(file)) {
            throw new Error("File doesn't exist.");
        }
        let data = await readFileAsync(file);
        return Beatmap.parseString(data.toString());
    }
    static async parseString(data: string): Promise<Beatmap> {
        let i;
        let beatmap: Beatmap;
        let lines = data.split(/\r?\n/);
        let fileFormat = -1;
        let osuSection;
        let sections = {};
        let parseBookmark = (bookmark: string) => {
            return parseInt(bookmark); // avoid
                                       // http://stackoverflow.com/questions/14528397/strange-behavior-for-map-parseint
        };
        let prev: TimingPoint|null = null;
        let bpmMin = 0;
        let bpmMax = Infinity;

        let comboNumber = 0;
        let comboColor = 0;
        let maxCombo = 0;

        let bookmarks: number[] = [];
        let hitObjects = [];
        let timingPoints = [];

        let approachRate: number = 0, circleSize: number = 0, hpDrain: number = 0, overallDiff: number = 0;

        for (i = 0; i < lines.length; i += 1) {
            let line = lines[i].trim();
            if (!line)
                continue;
            let match = sectionPattern.exec(line);
            if (match) {
                osuSection = match[1].toLowerCase();
                continue;
            }
            switch (osuSection) {
            case "timingpoints":
                let timingPoint = TimingPoint.parse(line);
                if (timingPoint instanceof UninheritedTimingPoint) {
                    bpmMin = Math.min(bpmMin, timingPoint.BPM);
                    bpmMax = Math.max(bpmMax, timingPoint.BPM);
                    timingPoint.BaseOffset = timingPoint.Offset;
                } else if (prev) {
                    timingPoint.BeatLength = prev.BeatLength;
                    timingPoint.BPM = prev.BPM;
                    timingPoint.BaseOffset = prev.BaseOffset;
                }
                prev = timingPoint;
                timingPoints.push(timingPoint);
                break;
            case "hitobjects":
                let hitObject = HitObject.parse(this, line);
                if (i == 0 || hitObject.NewCombo) { // or spinner or break apparently
                    comboNumber = 1;
                    comboColor = (comboColor + 1 + (hitObject instanceof Spinner ? hitObject.customColor : 0)) % beatmap.ComboColors.length;
                } else {
                    comboNumber += 1;
                    maxCombo = Math.max(maxCombo, comboNumber);
                }
                hitObject.comboNumber = comboNumber;
                hitObject.comboColor = beatmap.ComboColors[comboColor].clone();
                hitObjects.push(hitObject);
                break;
            case "events":
                // TODO: actually parse events lol
                break;
            default:
                if (!osuSection) {
                    match = /^osu file format (v[0-9]+)$/.exec(line);
                    if (match) {
                        fileFormat = match[1];
                        continue;
                    }
                } else {
                    match = keyPairPattern.exec(line);
                    if (match) {
                        if (!match[2])
                            match[2] = "";
                        if (/combo(\d+)/i.exec(match[1])) {
                            beatmap.ComboColors.push(Color.fromArray(match[2].split(",")));
                            continue;
                        }
                        switch (match[1].toLowerCase()) {
                        case "tags":
                            beatmap[match[1]] = match[2].split(" ");
                            break;
                        case "bookmarks":
                            bookmarks = match[2].split(",").map(x => parseInt(x));
                            break;
                        case "hpdrainrate":
                            hpDrain = parseFloat(match[2]);
                            break;
                        case "circlesize":
                            circleSize = parseFloat(match[2]);
                            break;
                        case "approachrate":
                            approachRate = parseFloat(match[2]);
                            break;
                        case "overalldifficulty":
                            overallDiff = parseFloat(match[2]);
                            break;
                        case "stackleniency":
                        case "distancespacing":
                        case "beatdivisor":
                        case "gridsize":
                        case "previewtime":
                        case "mode":
                        case "slidermultiplier":
                        case "slidertickrate":
                            beatmap[match[1]] = parseFloat(match[2]);
                            break;
                        default:
                            beatmap[match[1]] = match[2];
                            break;
                        }
                    }
                }
                break;
            }
        }

        let difficulty: Difficulty = {ApproachRate : approachRate, CircleSize : circleSize, HPDrainRate : hpDrain, OverallDifficulty : overallDiff};

        timingPoints.sort(function(a, b) { return a.Offset - b.Offset; });
        hitObjects.sort(function(a, b) { return a.StartTime - b.StartTime; });

        // EVENT PARSING

        // beatmap.breakTimes = [];
        // beatmap.originalEvents = sections.Events.join("\n");
        // for (i = 0; i < sections.Events.length; i += 1) {
        //     let members = sections.Events[i].split(",");

        //     if (members[0] == "0" && members[1] == "0" && members[2]) {
        //         let bgName = members[2].trim();

        //         if (bgName.charAt(0) == "\"" && bgName.charAt(bgName.length - 1) == "\"") {
        //             beatmap.bgFilename = bgName.substring(1, bgName.length - 1);
        //         } else {
        //             beatmap.bgFilename = bgName;
        //         }
        //     } else if (members[0] == "2" && /^[0-9]+$/.test(members[1]) && /^[0-9]+$/.test(members[2])) {
        //         beatmap.breakTimes.push({startTime : parseInt(members[1]), endTime : parseInt(members[2])});
        //     }
        // }

        return new Beatmap(fileFormat, bpmMin, bpmMax, difficulty, bookmarks, hitObjects, timingPoints);
    }

    public AdjustForMods(mods: number): Difficulty {
        let approachRate = this.Difficulty.ApproachRate;
        let circleSize = this.Difficulty.CircleSize;
        let hpDrain = this.Difficulty.HPDrainRate;
        let overallDiff = this.Difficulty.OverallDifficulty;

        if (mods.Easy) {
            approachRate = Math.max(0, this.Difficulty.ApproachRate / 2);
            circleSize = Math.max(0, this.Difficulty.CircleSize / 2);
            hpDrain = Math.max(0, this.Difficulty.HPDrainRate / 2);
            overallDiff = Math.max(0, this.Difficulty.OverallDifficulty / 2);
        } else if (mods.HardRock) {
            approachRate = Math.min(10, this.Difficulty.ApproachRate * 1.4);
            circleSize = Math.min(10, this.Difficulty.CircleSize * 1.3);
            hpDrain = Math.min(10, this.Difficulty.HPDrainRate * 1.4);
            overallDiff = Math.min(10, this.Difficulty.OverallDifficulty * 1.4);
            for (let obj of this.HitObjects)
                obj.FlipVertical();
        }

        return {
            ApproachRate : approachRate,
            CircleSize : circleSize,
            HPDrainRate : hpDrain,
            OverallDifficulty : overallDiff,
        };
    }

    public MapDiffRange(diff: number, min: number, mid: number, max: number) {
        // something that osu uses to (kind of) linearly map a difficulty value to a
        // range, whatever that range may be. the slope gets steeper for higher
        // difficulty value at a cutoff of 5
        if (diff > 5)
            return mid + (max - mid) * (diff - 5) / 5;
        if (diff < 5)
            return mid - (mid - min) * (5 - diff) / 5;
        return mid;
    }

    public CalculateDifficultyProperties(diff: Difficulty): DifficultyProperties {
        let reactionTime = this.mapDiffRange(this.AdjDiff.AR, 1800, 1200, 450);
        this.Hit300 = this.mapDiffRange(this.AdjDiff.OD, 80, 50, 20);
        this.Hit100 = this.mapDiffRange(this.AdjDiff.OD, 140, 100, 60);
        this.Hit50 = this.mapDiffRange(this.AdjDiff.OD, 200, 150, 100);

        let gameFieldWidth = constants.ACTUAL_WIDTH;
        // this.RealCS = 88 - 8 * (this.AdjDiff.CS - 2); // ?
        this.RealCS = gameFieldWidth / 8 * (1 - 0.7 * (this.AdjDiff.CS - 5) / 5);
        // let scount = 0;
        for (let obj of this.HitObjects) {
            obj.radius = this.RealCS;
            if (obj instanceof Slider)
                obj.calculate();
        }

        return { ReactionTime: reactionTime, }
    }

    public UpdateStacking(start = 0, end = -1) {
        // basically a direct port of the stacking algorithm

        const STACK_LENIENCE = 3; // in osupx i assume
        let nObj = this.HitObjects.length;
        while (end < 0)
            end += nObj;
        let stackThreshold = this.ReactionTime * this.StackLeniency;

        // reset stacking first
        for (let i = end; i >= start; --i)
            this.HitObjects[i].StackHeight = 0;

        // just extend the end index in case it's not the base
        let extEnd = end;
        for (let i = end; i >= start; --i) {
            let stackBase = i;
            for (let n = stackBase + 1; n < nObj; ++n) {
                // bottom of the stack
                let stackBaseObj = this.HitObjects[stackBase];
                if (stackBaseObj instanceof Spinner)
                    break;

                // current object
                let objN = this.HitObjects[n];
                if (objN instanceof Spinner)
                    continue;

                // check if out of range
                if (objN.StartTime - stackBaseObj.EndTime > stackThreshold)
                    break;

                if (stackBaseObj.Position.distanceTo(objN.Position) < STACK_LENIENCE ||
                    (stackBaseObj instanceof Slider && stackBaseObj.EndPosition.distanceTo(objN.Position) < STACK_LENIENCE)) {
                    stackBase = n;
                    this.HitObjects[n].StackHeight = 0;
                }
            }
            if (stackBase > extEnd) {
                extEnd = stackBase;
                if (extEnd == nObj - 1)
                    break;
            }
        }

        // actually build the stacks now :D
        let extStart = start;
        for (let i = extEnd; i > start; --i) {
            let n = i;
            if (this.HitObjects[i].StackHeight != 0 || this.HitObjects[i] instanceof Spinner)
                continue;

            let j = i;
            if (this.HitObjects[i] instanceof HitCircle) {
                while (--n >= 0) {
                    let objN = this.HitObjects[n];
                    if (objN instanceof Spinner)
                        continue;
                    if (this.HitObjects[j].StartTime - objN.EndTime > stackThreshold)
                        break;
                    if (n < extStart) {
                        this.HitObjects[n].StackHeight = 0;
                        extStart = n;
                    }
                    if (objN instanceof Slider && objN.EndPosition.distanceTo(this.HitObjects[j].Position) < STACK_LENIENCE) {
                        let offset = this.HitObjects[j].StackHeight - objN.StackHeight + 1;
                        for (let j = n + 1; j <= i; ++j) {
                            let objJ = this.HitObjects[j];
                            if (objN.EndPosition.distanceTo(objJ.Position) < STACK_LENIENCE)
                                objJ.StackHeight -= offset;
                        }
                        break;
                    }
                    if (objN.Position.distanceTo(this.HitObjects[j].Position) < STACK_LENIENCE) {
                        this.HitObjects[n].StackHeight = this.HitObjects[j].StackHeight + 1;
                        j = n;
                    }
                }
            } else if (this.HitObjects[i] instanceof Slider) {
                while (--n >= start) {
                    let objN = this.HitObjects[n];
                    if (objN instanceof Spinner)
                        continue;
                    if (this.HitObjects[j].StartTime - objN.EndTime > stackThreshold)
                        break;
                    if (objN.EndPosition.distanceTo(this.HitObjects[j].Position) < STACK_LENIENCE) {
                        this.HitObjects[n].StackHeight = this.HitObjects[j].StackHeight + 1;
                        j = n;
                    }
                }
            }
        }
    }

    public GetTimingPoint(offset: number) {
        // perform binary search for the timing section to which this offset belongs
        let left = 0, right = this.TimingPoints.length - 1;
        let result = 0;
        while (left <= right) {
            let midpoint = ~~((left + right) / 2);
            if (this.TimingPoints[midpoint].Offset > offset) {
                right = midpoint - 1;
            } else {
                result = midpoint;
                left = midpoint + 1;
            }
        }
        return this.TimingPoints[result];
        // for (var i = this.TimingPoints.length - 1; i >= 0; i -= 1) {
        //  if (this.TimingPoints[i].offset <= offset)
        //      return this.TimingPoints[i];
        // }
        // return this.TimingPoints[0];
    }

    public GetIndexAt(offset: number) {
        let i;
        for (i = 0; i < this.HitObjects.length; i++) {
            let obj = this.HitObjects[i];
            if (obj instanceof Slider || obj instanceof Spinner) {
                if (offset < obj.EndTime)
                    return i;
            } else {
                if (offset <= obj.StartTime)
                    return i;
            }
        }
        return i - 1;
    }
}
