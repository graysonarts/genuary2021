// Copyright 2022 Grayson Hay.
// SPDX-License-Identifier: MIT
import * as p5 from "p5";
import { range, map, transduce, filter, comp, push } from "@thi.ng/transducers";
import {
  ColorRangePreset,
  colorsFromRange,
  css,
  hsl,
  lch,
} from "@thi.ng/color";

type Item = {
  x: number;
  y: number;
  size: number;
  color?: p5.Color;
  selected?: boolean;
};

const MAX_SIZE = 0.8;

const ColorPresets: ColorRangePreset[] = [
  "light",
  "dark",
  "bright",
  "weak",
  "neutral",
  "fresh",
  "soft",
  "hard",
  "warm",
  "cool",
  "intense",
];

const sketch = (p5: p5) => {
  let seed = 0;
  let objects = [];
  let candidates = [];
  let sizeAndCounts = [];
  let totalObjects = 0;
  let aspectScale;
  let backgroundColor;
  const colors = [
    ...colorsFromRange(
      ColorPresets[Math.floor(p5.random(ColorPresets.length))],
      {
        num: 10,
        base: hsl(p5.random(), p5.random(), 0.5),
        variance: 0.1,
      } as any
    ),
  ];

  const makeCandidate = (startSize: number) => {
    const candidate = {
      x: p5.random() * 2 - 1,
      y: p5.random() * 2 - 1,
      size: Math.abs(p5.randomGaussian(startSize, 0.1)),
    };

    return candidate;
  };

  const makeCandidateObjects = () => {
    candidates = sizeAndCounts.flatMap(([size, count]) => {
      const transformer = comp(
        map(() => makeCandidate(size)),
        filter((x) => !!x)
      );

      return transduce(transformer, push(), range(count));
    });
  };

  const pickDistribution = () => {
    let remainingObjects = totalObjects;
    let currentSize = MAX_SIZE;
    while (remainingObjects > 0 && currentSize > 0.1) {
      const currentCount = totalObjects - remainingObjects + 1;
      const numberAtSize = Math.ceil(
        p5.randomGaussian(currentCount, currentCount / 2)
      );
      sizeAndCounts.push([currentSize, numberAtSize]);
      remainingObjects -= numberAtSize;
      currentSize /= p5.randomGaussian(0, 0.4) + 1.3;
    }
  };

  const drawObject = (c: Item) => {
    const x = (c.x * p5.width) / 2;
    const y = (c.y * p5.height) / 2;
    const radius = (p5.height * c.size) / 2;
    if (c.color) {
      p5.fill(c.color);
      p5.circle(x, y, radius);
    } else {
      p5.strokeWeight(1);
      p5.circle(x, y, radius * 2);
    }
  };

  const distance = (x1: number, y1: number, x2: number, y2: number): number => {
    const x = (x2 - x1) * aspectScale;
    const y = y2 - y1;
    return Math.sqrt(x * x + y * y);
  };

  const doesCollideWithExisting = (c: Item, setSelected?: boolean): boolean => {
    if (setSelected)
      for (const v of objects) {
        v.selected = false;
      }
    for (const v of objects) {
      const minDist = (c.size + v.size + 0.05) / 2;
      const dist = distance(v.x, v.y, c.x, c.y);
      if (dist < minDist) {
        if (setSelected) v.selected = true;
        return true;
      }
    }
    return false;
  };

  const fitNextCandidate = () => {
    const candidate = candidates.shift();
    if (!candidate) return;
    if (doesCollideWithExisting(candidate)) {
      return;
    }

    let lastCandidateSize = { ...candidate };
    while (candidate.size < MAX_SIZE && !doesCollideWithExisting(candidate)) {
      lastCandidateSize = { ...candidate };
      candidate.size += 0.001;
    }

    // pick color
    const idx = Math.floor(p5.random(colors.length));
    lastCandidateSize.color = css(colors[idx]);
    objects.push(lastCandidateSize);
  };

  p5.setup = () => {
    p5.createCanvas(1280, 720);
    aspectScale = p5.width / p5.height;
    p5.frameRate(60);
    seed = p5.random(-10000, 10000);
    p5.randomSeed(seed);
    totalObjects = p5.randomGaussian(1000, 1);
    pickDistribution();
    makeCandidateObjects();
    candidates.sort((a, b) => b.size - a.size);
    const c = colors[Math.floor(p5.random(colors.length))];
    c.l = 0.01;
    backgroundColor = p5.color(css(c));
  };

  p5.draw = () => {
    p5.background(backgroundColor);
    fitNextCandidate();
    p5.stroke(255, 32);
    p5.noFill();
    p5.translate(p5.width / 2, p5.height / 2);
    candidates.forEach(drawObject);
    objects.forEach(drawObject);

    if (candidates.length < 0) {
      p5.noLoop();
    }
  };
};

new p5(sketch);
