export enum HitsoundType {
    None,
    Normal,
    Soft,
    Drum,
}

export enum AdditionType {
    None,
    Whistle,
    Finish,
    Clap,
}

export enum CurveType {
    Unknown,
    Linear,
    Catmull,
    Bezier,
    Perfect,
}

export enum Mods {

}

export interface Difficulty {
    ApproachRate: number, CircleSize: number, HPDrainRate: number, OverallDifficulty: number,
}

export interface DifficultyProperties {
    ReactionTime: number,
}
