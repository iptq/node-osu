import {Difficulty, DifficultyProperties, Mods} from "./structs";

export function ModActivated(mods: number, mod: number) { return (mods & mod) == mod; }

export function AdjustForMods(diff: Difficulty, mods: number): Difficulty {
    let approachRate = diff.ApproachRate;
    let circleSize = diff.CircleSize;
    let hpDrain = diff.HPDrainRate;
    let overallDiff = diff.OverallDifficulty;

    if (ModActivated(mods, Mods.Easy)) {
        approachRate = Math.max(0, diff.ApproachRate / 2);
        circleSize = Math.max(0, diff.CircleSize / 2);
        hpDrain = Math.max(0, diff.HPDrainRate / 2);
        overallDiff = Math.max(0, diff.OverallDifficulty / 2);
    } else if (ModActivated(mods, Mods.HardRock)) {
        approachRate = Math.min(10, diff.ApproachRate * 1.4);
        circleSize = Math.min(10, diff.CircleSize * 1.3);
        hpDrain = Math.min(10, diff.HPDrainRate * 1.4);
        overallDiff = Math.min(10, diff.OverallDifficulty * 1.4);
    }

    return {
        ApproachRate : approachRate,
        CircleSize : circleSize,
        HPDrainRate : hpDrain,
        OverallDifficulty : overallDiff,
    };
}

export function MapDiffRange(diff: number, min: number, mid: number, max: number) {
    // something that osu uses to (kind of) linearly map a difficulty value to a
    // range, whatever that range may be. the slope gets steeper for higher
    // difficulty value at a cutoff of 5
    if (diff > 5)
        return mid + (max - mid) * (diff - 5) / 5;
    if (diff < 5)
        return mid - (mid - min) * (5 - diff) / 5;
    return mid;
}

export function CalculateDifficultyProperties(diff: Difficulty): DifficultyProperties {
    let adjDiff = AdjustForMods(diff, 0);

    let reactionTime = MapDiffRange(adjDiff.ApproachRate, 1800, 1200, 450);
    let hit300 = MapDiffRange(adjDiff.OverallDifficulty, 80, 50, 20);
    let hit100 = MapDiffRange(adjDiff.OverallDifficulty, 140, 100, 60);
    let hit50 = MapDiffRange(adjDiff.OverallDifficulty, 200, 150, 100);

    // let gameFieldWidth = constants.ACTUAL_WIDTH;
    // // this.RealCS = 88 - 8 * (this.AdjDiff.CS - 2); // ?
    // this.RealCS = gameFieldWidth / 8 * (1 - 0.7 * (this.AdjDiff.CS - 5) / 5);
    // // let scount = 0;
    // for (let obj of this.HitObjects) {
    //     obj.radius = this.RealCS;
    //     if (obj instanceof Slider)
    //         obj.calculate();
    //

    return { ReactionTime: reactionTime, Hit300: hit300, Hit100: hit100, Hit50: hit50 }
}
