import SliderMath from "./slider";
import Vector from "./vector";
const constants = require("../constants");

export class Spline {
    public points: Vector[];
    private pxLength: number = 0;
    private lengthMap: number[] = [];

    // in this context, a spline is literally just a list of points
    constructor(public cs: number, public control: Vector[], public length: number) { this.points = []; }

    static bezier(cs: number, control: Vector[], length: number): Spline {
        if (control.length == 2)
            return Spline.linear(cs, control, length);
        return new BezierSpline(cs, control, length);
    }
    static linear(cs: number, control: Vector[], length: number): Spline {
        if (control.length != 2)
            throw new Error("Linear slider with the wrong number of control points (expected: 2, got: " + control.length + ")");

        return new LinearSpline(cs, control, length);
    }
    static perfect(cs: number, control: Vector[], length: number): Spline {
        if (control.length != 3)
            throw new Error("Perfect slider with the wrong number of control points (expected: 3, got: " + control.length + ")");

        // if they're on a line, abort mission now
        if (SliderMath.isLine(control[0], control[1], control[2]))
            return Spline.linear(cs, [ control[0], control[1] ], length);

        return new PerfectSpline(cs, control, length);
    }

    calculate() {
        this.pxLength = 0;
        this.lengthMap = new Array();
        this.lengthMap.push(0);
        for (let i = 1; i < this.points.length; ++i) {
            let segmentDistance = this.points[i].distanceTo(this.points[i - 1]);
            this.pxLength += segmentDistance;
            this.lengthMap.push(this.pxLength);
        }
    }

    pointAt(progress: number): Vector {
        let i, distancePercent = 0;
        for (i = 1; i < this.lengthMap.length; ++i) {
            distancePercent = 1.0 * this.lengthMap[i] / this.pxLength;
            if (progress == distancePercent)
                return this.points[i];
            if (progress < distancePercent)
                break;
        }
        // interpolate
        let pi = Math.max(0, i - 1);
        let left = this.points[pi];
        let right = this.points[i];
        let segmentPercent = (this.lengthMap[i] - this.lengthMap[pi]) / this.pxLength;
        let p = (distancePercent - progress) / segmentPercent;
        return new Vector(right.x - p * (right.x - left.x), right.y - p * (right.y - left.y));
    }
}

// thank based peppy
class BezierApproximator {
    public subdivBuf1: Vector[] = [];
    public subdivBuf2: Vector[] = [];

    // using the repeated subdividing method
    constructor(public control: Vector[]) {}

    static isFlatEnough(curve: Vector[]): boolean {
        for (let i = 1; i < curve.length - 1; ++i) {
            if ((curve[i - 1].sub(curve[i].smul(2)).add(curve[i + 1])).m2 > constants.bezierTolerance)
                return false;
        }
        return true;
    }

    subdivide(points: Vector[], left: Vector[], right: Vector[]): void {
        let midpoints = this.subdivBuf1;
        for (let i = 0; i < this.control.length; ++i)
            midpoints[i] = points[i];
        for (let i = 0; i < this.control.length; ++i) {
            left[i] = midpoints[0];
            right[this.control.length - i - 1] = midpoints[this.control.length - i - 1];
            for (let j = 0; j < this.control.length - i - 1; ++j)
                midpoints[j] = midpoints[j].add(midpoints[j + 1]).smul(0.5);
        }
    }

    approximate(points: Vector[], output: Vector[]): void {
        let left = this.subdivBuf2;
        let right = this.subdivBuf1;
        this.subdivide(points, left, right);

        // add right to left
        for (let i = 0; i < this.control.length - 1; ++i)
            left[this.control.length + i] = right[i + 1];
        output.push(points[0]);
        for (let i = 1; i < this.control.length - 1; ++i) {
            let index = 2 * i;
            let p = left[index - 1].add(left[index].smul(2)).add(left[index + 1]).smul(0.25);
            output.push(p);
        }
    }

    calculate() {
        let output: Vector[] = [];
        // curves that haven't been flattened out yet
        let toFlatten: Vector[][] = [ this.control.slice(0) ];
        let freeBuffers = [];
        let leftChild = this.subdivBuf2;

        while (toFlatten.length > 0) {
            // get the next potentially unflattened curve
            let parent = toFlatten.pop();
            // satisfy typechecker
            if (parent == undefined)
                break;
            // don't flatten it if it's already flattened
            if (BezierApproximator.isFlatEnough(parent)) {
                this.approximate(parent, output);
                freeBuffers.push(parent);
                continue;
            }

            let rightChild: Vector[];
            let tmp;
            if ((tmp = freeBuffers.pop()) != undefined)
                rightChild = tmp;
            else
                rightChild = Array(this.control.length);
            this.subdivide(parent, leftChild, rightChild);
            for (let i = 0; i < this.control.length; ++i)
                parent[i] = leftChild[i];
            toFlatten.push(rightChild);
            toFlatten.push(parent);
        }
        output.push(this.control[this.control.length - 1]);
        return output;
    }
}

export class BezierSpline extends Spline {
    constructor(cs: number, points: Vector[], length: number) {
        super(cs, points, length);
        let lastIndex = 0;
        for (let i = 0; i < points.length; ++i) {
            // split on red anchors
            let multipart = i < points.length - 2 && points[i].equals(points[i + 1]);
            if (multipart || i == points.length - 1) { // end of curve segment
                let segment = points.slice(lastIndex, i + 1);
                if (segment.length == 2) {
                    // linear
                    this.points.push(points[lastIndex]);
                    this.points.push(points[i]);
                } else {
                    let bezier = new BezierApproximator(segment);
                    let points = bezier.calculate();
                    for (let j = 0; j < points.length; ++j)
                        this.points.push(points[j]);
                }
                if (multipart)
                    i++;
                lastIndex = i;
            }
        }
        this.calculate();
    }
}

export class LinearSpline extends Spline {
    constructor(cs: number, points: Vector[], length: number) {
        super(cs, points, length);

        // since we can just draw a single line from one point to another we don't
        // need a million points

        // start point
        this.points.push(points[0]);

        // end point determined by length of slider
        // v1 = p0 + ((p1 - p0) * length / |p1 - p0|)
        let unit = points[1].sub(points[0]).norm();
        this.points.push(points[0].add(unit.smul(length)));
        this.calculate();
    }
}

export class PerfectSpline extends Spline {
    constructor(cs: number, points: Vector[], length: number) {
        super(cs, points, length);

        // get circumcircle
        let [center, radius] = SliderMath.getCircumCircle(points[0], points[1], points[2]);

        // figure out what t-values the slider begins and ends at
        let t0 = Math.atan2(center.y - points[0].y, points[0].x - center.x);
        let t1 = Math.atan2(center.y - points[2].y, points[2].x - center.x);

        let mid = Math.atan2(center.y - points[1].y, points[1].x - center.x);
        while (mid < t0)
            mid += 2 * Math.PI;
        while (t1 < t0)
            t1 += 2 * Math.PI;
        if (mid > t1)
            t1 -= 2 * Math.PI;

        // circumference is 2*pi*r, slider length over circumference is
        // length/(2*pi*r)
        // limit t1 by pixel length, so new t1 is 2*pi*length/(2*pi*r) = length/r
        let direction = (t1 - t0) / Math.abs(t1 - t0);
        let nt1 = t0 + direction * (length / radius);

        // construct the circle parametrically
        for (let t = t0; nt1 >= t0 ? t < nt1 : t > nt1; t += (nt1 - t0) / length) {
            let rel = new Vector(Math.cos(t) * radius, -Math.sin(t) * radius);
            this.points.push(center.add(rel));
        }
        this.calculate();
    }
}
