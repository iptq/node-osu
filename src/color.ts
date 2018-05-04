import {pad} from "./utils";

export default class Color {
    constructor(public red: number, public green: number, public blue: number) {}
    static hex(red: number, green: number, blue: number) {
        red = Math.floor(Math.min(red, 255));
        green = Math.floor(Math.min(green, 255));
        blue = Math.floor(Math.min(blue, 255));

        let redH = red.toString(16), greenH = green.toString(16), blueH = blue.toString(16);
        return pad(redH, 2) + pad(greenH, 2) + pad(blueH, 2);
    }
    static fromArray(colors: number[]) { return new Color(colors[0], colors[1], colors[2]); }
    hex() { return Color.hex(this.red, this.green, this.blue); }
    clone() { return new Color(this.red, this.green, this.blue); }
    toArray() { return [ this.red, this.green, this.blue ]; }
}
