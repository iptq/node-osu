import {CurveType} from "../beatmap/structs";

import {Spline} from "./spline";
import Vector from "./vector";

export default class SliderMath {
    static GetCircumCircle(p1: Vector, p2: Vector, p3: Vector): [ Vector, number ] {
        // get the [center, radius] circumcircle of the points p1, p2, p3
        let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = p3.x, y3 = p3.y;
        let D = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
        let Ux = ((x1 * x1 + y1 * y1) * (y2 - y3) + (x2 * x2 + y2 * y2) * (y3 - y1) + (x3 * x3 + y3 * y3) * (y1 - y2)) / D;
        let Uy = ((x1 * x1 + y1 * y1) * (x3 - x2) + (x2 * x2 + y2 * y2) * (x1 - x3) + (x3 * x3 + y3 * y3) * (x2 - x1)) / D;
        let center = new Vector(Ux, Uy);
        let r = center.distanceTo(new Vector(x1, y1));
        return [ center, r ];
    }

    static GetEndPoint(spline: Spline, curveType: CurveType, sliderLength: number, points: Vector[]): Vector|null {
        // determines the other endpoint of the slider
        // points is the set of control points
        // curveType and sliderLength are given in the .osu
        switch (curveType) {
        case CurveType.Linear:
            return SliderMath.PointOnLine(points[0], points[1], sliderLength);
        case CurveType.Bezier:
            return spline.points[spline.points.length - 1];
        case CurveType.Perfect:
            if (!points || points.length < 2)
                return null;

            if (points.length == 2)
                return SliderMath.PointOnLine(points[0], points[1], sliderLength);
            if (points.length > 3)
                return SliderMath.GetEndPoint(spline, CurveType.Bezier, sliderLength, points);

            let [circumCenter, radius] = SliderMath.GetCircumCircle(points[0], points[1], points[2]);
            let radians = sliderLength / radius;
            if (SliderMath.IsLine(points[0], points[1], points[2]))
                radians *= -1;
            return SliderMath.Rotate(circumCenter, points[1], radians);
        case CurveType.Catmull:
            // not supported
        default:
            return null;
        }
    }

    static IsLine(a: Vector, b: Vector, c: Vector): boolean {
        // checks if a, b, and c are on the same line
        return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) == 0;
    }

    static PointOnLine(p1: Vector, p2: Vector, length: number): Vector {
        // gets the point on the line from p1 to p2 that's length away from p1
        let fullLength = p1.distanceTo(p2);
        let n = fullLength - length;

        let x = (n * p1.x + length * p2.x) / fullLength;
        let y = (n * p1.y + length * p2.y) / fullLength;
        return new Vector(x, y);
    }

    static Rotate(center: Vector, point: Vector, angle: number): Vector {
        // rotates point by angle around center

        let nx = Math.cos(angle), ny = Math.sin(angle);
        return new Vector(nx * (point.x - center.x) - ny * (point.y - center.y) + center.x,
                          ny * (point.x - center.x) + nx * (point.y - center.y) + center.y);
    }
}
