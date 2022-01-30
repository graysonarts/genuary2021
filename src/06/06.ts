// Copyright 2022 Grayson Hay.
// SPDX-License-Identifier: MIT
import { colorsFromRange, css, hsv, lch } from "@thi.ng/color";
import { intersects, Line, Triangle } from "@thi.ng/geom";
import { IntersectionType } from "@thi.ng/geom-api";
import {
  add,
  asVec2,
  dist,
  mag,
  mul,
  mul2,
  mulN,
  mulS,
  normalize,
  sub,
  Vec2,
} from "@thi.ng/vectors";
import * as p5 from "p5";

const MAX_DISTANCE = 500;
const MAX_TRIS = 300;
const DEBUG = false;
const START_WEIGHT = 5;
const SUBDIVIDE_CHANCE = 0.25;
const NEW_TRI_CHANCE = 0.25;
const MIN_AREA_TO_SUBDIVIDE = 500;

const sketch = (p5: p5) => {
  const triangles: Triangle[] = [];
  const rejectedTriangles: Triangle[] = [];
  const subdivisionPoints: Vec2[] = [];

  const startHue = p5.random();

  const colors = [
    [
      ...colorsFromRange("cool", {
        num: 10,
        base: hsv(startHue, 1, 0.5),
        variance: 0.15,
      }),
    ],
    [
      ...colorsFromRange("warm", {
        num: 10,
        base: hsv(p5.norm(startHue + 0.5, 0, 1), 1, 0.5),
        variance: 0.15,
      }),
    ],
    [
      ...colorsFromRange("bright", {
        num: 10,
        base: hsv(p5.norm(startHue + 0.33, 0, 1), 1, 0.5),
        variance: 0.15,
      }),
    ],
  ];

  let seed = 0;
  p5.setup = () => {
    p5.createCanvas(1280, 720);
    p5.frameRate(60);
    seed = p5.random(-10000, 10000);
    p5.randomSeed(seed);
    p5.drawingContext.imageSmoothingEnabled = true;
    p5.drawingContext.shadowBlur = 10;
    p5.drawingContext.shadowColor = "#efefef";
  };

  p5.draw = () => {
    p5.background(255);

    p5.smooth();
    p5.translate(-p5.width / 2, -p5.height / 2);

    // debugDraw()c;
    realDraw();
  };

  const debugDraw = () => {
    p5.background(255);
    if (triangles.length < 1) {
      addTriangle();
      subdivide(0);
    }
    p5.stroke(0);
    p5.strokeWeight(1);
    triangles.forEach(drawTri);

    p5.noLoop();
  };

  const realDraw = () => {
    p5.translate(p5.width / 2, p5.height / 2);
    if (triangles.length > MAX_TRIS) {
      console.log("done");
      p5.noLoop();
    }
    if (p5.random() < NEW_TRI_CHANCE) {
      if (triangles.length < MAX_TRIS) addTriangle();
    } else if (p5.random() < SUBDIVIDE_CHANCE) {
      subdivideRandomTriangle();
    }

    // p5.strokeJoin(p5.ROUND);
    p5.stroke(0);
    p5.strokeWeight(3);
    p5.fill(255);
    triangles.forEach(drawTri);
    p5.fill(0, 16);
    p5.noStroke();
    if (DEBUG) rejectedTriangles.forEach(drawTri);
    p5.stroke(255, 0, 0);
    p5.strokeWeight(START_WEIGHT);
    if (DEBUG)
      subdivisionPoints.forEach((l) =>
        p5.line(l[0][0], l[0][1], l[1][0], l[1][1])
      );
  };

  const drawTri = (t: Triangle) => {
    // p5.strokeWeight(t.attribs.weight || 1);
    p5.noStroke();
    p5.fill(css(colors[t.attribs.theme][t.attribs.color]));
    p5.beginShape();
    for (const p of t.points) {
      p5.vertex(p[0], p[1]);
    }
    p5.endShape("close");
  };

  const addTriangle = () => {
    const pt1 = [p5.random(p5.width), p5.random(p5.height)];
    const distance =
      (p5.random() + 0.1) * MAX_DISTANCE * Math.sign(p5.randomGaussian(0, 1));
    const direction = p5.random();
    const pt2 = [pt1[0] + distance * direction, pt1[1] + distance];
    const pt3 = [pt1[0] + distance, pt1[1] - distance * direction];
    const theme = Math.floor(p5.random(colors.length));
    const newTri = new Triangle([pt1, pt2, pt3], {
      weight: START_WEIGHT,
      theme,
      color: Math.floor(p5.random(colors[theme].length)),
    });
    if (!collidesWithExisting(newTri)) triangles.push(newTri);
    else if (DEBUG) rejectedTriangles.push(newTri);
  };

  const subdivideRandomTriangle = () => {
    if (!triangles.length) return;

    const randomIndex = Math.floor(p5.random(0, triangles.length));
    if (triangleArea(triangles[randomIndex]) > MIN_AREA_TO_SUBDIVIDE)
      subdivide(randomIndex);
  };

  const triangleArea = (t: Triangle): number => {
    const ab = dist(t.points[0], t.points[1]);
    const ac = dist(t.points[0], t.points[2]);
    const bc = dist(t.points[1], t.points[2]);
    const s = (ab + ac + bc) / 2;
    return Math.sqrt(s * (s - ab) * (s - ac) * (s - bc));
  };

  const ptAlongLine = (
    pt1: Vec2,
    pt2: Vec2,
    percentage: number,
    flipSign: boolean
  ): Vec2 => {
    const lineVec = new Vec2();
    sub(lineVec, pt2, pt1);
    const d = -mag(lineVec) * p5.constrain(percentage, 0, 1);
    normalize(lineVec, lineVec);
    mulN(lineVec, lineVec, d);
    add(lineVec, lineVec, pt2);
    return lineVec;
  };

  const subdivide = (idx: number) => {
    const tri = triangles[idx];
    const side = Math.floor(p5.random(3));
    const p1 = asVec2(tri.points[side]);
    const p2 = asVec2(tri.points[(side + 1) % 3]);
    const p3 = asVec2(tri.points[(side + 2) % 3]);

    const percentage = p5.randomGaussian(0, 0.5) * 0.5 + 0.5;
    const padding = p5.random() / 100.0 + 0.07;
    const np1 = ptAlongLine(p1, p2, percentage + padding, true);
    const np2 = ptAlongLine(p1, p2, percentage - padding, true);

    const op1 = ptAlongLine(p3, p1, 1.0 - padding, true);
    const op2 = ptAlongLine(p3, p2, 1.0 - padding, true);

    const t1 = new Triangle([p1, np1, op1], {
      weight: p5.constrain(tri.attribs.weight - 1, 1, START_WEIGHT),
      theme: tri.attribs.theme,
      color: Math.floor(p5.random(colors[tri.attribs.theme].length)),
    });
    const t2 = new Triangle([p2, np2, op2], {
      weight: p5.constrain(tri.attribs.weight - 1, 1, START_WEIGHT),
      theme: tri.attribs.theme,
      color: Math.floor(p5.random(colors[tri.attribs.theme].length)),
    });

    if (
      triangleArea(t1) > MIN_AREA_TO_SUBDIVIDE / 2.0 ||
      triangleArea(t1) > MIN_AREA_TO_SUBDIVIDE / 2.0
    ) {
      triangles.splice(idx, 1);
      triangles.push(t1, t2);
    }
  };
  const intersectsTriTri = (t1: Triangle, t2: Triangle): boolean => {
    const t1pts = t1.points;
    const t2pts = t2.points;
    const t1l1 = new Line([t1pts[0], t1pts[1]]);
    const t1l2 = new Line([t1pts[1], t1pts[2]]);
    const t1l3 = new Line([t1pts[2], t1pts[0]]);
    const t2l1 = new Line([t2pts[0], t2pts[1]]);
    const t2l2 = new Line([t2pts[1], t2pts[2]]);
    const t2l3 = new Line([t2pts[2], t2pts[0]]);

    return (
      intersects(t1l1, t2l1).type === IntersectionType.INTERSECT ||
      intersects(t1l1, t2l2).type === IntersectionType.INTERSECT ||
      intersects(t1l1, t2l2).type === IntersectionType.INTERSECT ||
      intersects(t1l2, t2l1).type === IntersectionType.INTERSECT ||
      intersects(t1l2, t2l2).type === IntersectionType.INTERSECT ||
      intersects(t1l2, t2l3).type === IntersectionType.INTERSECT ||
      intersects(t1l3, t2l1).type === IntersectionType.INTERSECT ||
      intersects(t1l3, t2l2).type === IntersectionType.INTERSECT ||
      intersects(t1l3, t2l3).type === IntersectionType.INTERSECT
    );
  };

  const signPts = (p1, p2, p3) =>
    (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);

  const insideTriTri = (outer: Triangle, candidate: Triangle): boolean =>
    candidate.points
      .map((pt) => insideTriPt(outer, pt))
      .reduce((acc, v) => (acc = acc || v));
  const insideTriPt = (t: Triangle, candidate: any): boolean => {
    const d1 = signPts(candidate, t.points[0], t.points[1]);
    const d2 = signPts(candidate, t.points[1], t.points[2]);
    const d3 = signPts(candidate, t.points[2], t.points[0]);

    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

    return !(hasNeg && hasPos);
  };

  const collidesWithExisting = (t: Triangle): boolean => {
    for (const ot of triangles) {
      if (insideTriTri(ot, t)) return true;
      if (insideTriTri(t, ot)) return true;
      if (intersectsTriTri(t, ot)) return true;
    }

    return false;
  };
};

new p5(sketch);
