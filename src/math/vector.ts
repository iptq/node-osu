export class Vector {
    constructor(public x: number, public y: number) {}

    // alternates for dimension
    public get w() { return this.x; }
    public get h() { return this.y; }

    public angleTo(other: Vector) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        return Math.atan(dy / dx);
    }
    public distanceTo(other: Vector) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }
    public midpoint(other: Vector) { return new Vector((this.x + other.x) / 2, (this.y + other.y) / 2); }
    public equals(other: Vector) { return this.x == other.x && this.y == other.y; }
    public toPol() {
        // treating x, y as r, theta
        let x = this.x * Math.cos(this.y);
        let y = this.x * Math.sin(this.y);
        return new Vector(x, y);
    }
    public get m() {
        // magnitude
        return Math.pow(this.x * this.x + this.y * this.y, 0.5);
    }
    public get m2() { return this.x * this.x + this.y * this.y; }
    public add(v: Vector) { return new Vector(this.x + v.x, this.y + v.y); }
    public sub(v: Vector) { return new Vector(this.x - v.x, this.y - v.y); }
    public dot(v: Vector) { return new Vector(this.x * v.x, this.y * v.y); }
    public smul(c: number) { return new Vector(c * this.x, c * this.y); }
    public norm() { return new Vector(this.x / this.m, this.y / this.m); }
    public toString(separator: string) {
        separator = separator || ",";
        return [ this.x, this.y ].join(separator);
    }
}
