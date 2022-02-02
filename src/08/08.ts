// Copyright 2022 Grayson Hay.
// SPDX-License-Identifier: MIT
import {
  ColorRangePreset,
  colorsFromRange,
  COLOR_RANGES,
  css,
  hsv,
} from "@thi.ng/color";
import * as p5 from "p5";

const DEBUG = false;
const MAX_STEP = 3;

type cellAddr = { row: number; col: number };

const sketch = (p5: p5) => {
  let seed = 0;
  let grid: number[][];
  let gridSpan: { x: number; y: number } = { x: 0, y: 0 };
  let curves: cellAddr[][] = [];

  const startHue = p5.random();
  const colorThemes: ColorRangePreset[] = [
    "cool",
    "warm",
    "bright",
    "light",
    "dark",
    "neutral",
    "fresh",
    "soft",
    "hard",
    "intense",
  ];
  const colorTheme = colorThemes[Math.floor(p5.random(colorThemes.length))];

  const colors = [
    ...colorsFromRange(colorTheme, {
      num: 10,
      base: hsv(startHue, 1, 0.5),
      variance: 0.15,
    }),
  ];
  p5.setup = () => {
    p5.createCanvas(1280, 720);
    p5.frameRate(60);
    seed = p5.random(-10000, 10000);
    p5.randomSeed(seed);
    p5.drawingContext.imageSmoothingEnabled = true;
    setupGrid(64);
    setupCurves(25);
  };

  p5.draw = () => {
    p5.randomSeed(seed);
    p5.background(255);
    p5.noFill();

    curves.forEach((c, i) => growCurve(i));
    curves.forEach(drawCurve);

    drawDebug();
    if (curves[0].length > grid.length) {
      p5.noLoop();
    }
  };

  const addrToCoord = (addr: cellAddr): cellAddr => ({
    row: addr.row * gridSpan.y,
    col: addr.col * gridSpan.x,
  });
  const centerOfCell = (addr: cellAddr): cellAddr => ({
    row: addr.row + gridSpan.y / 2,
    col: addr.col + gridSpan.x / 2,
  });

  const drawCurve = (curve: cellAddr[], idx: number) => {
    p5.stroke(css(colors[idx % colors.length]));
    p5.strokeWeight(p5.lerp(1, 10, idx / curves.length));
    p5.beginShape();
    curve
      .map(addrToCoord)
      .map(centerOfCell)
      .forEach((addr) => {
        p5.curveVertex(addr.col, addr.row);
      });
    p5.endShape();

    if (!DEBUG) return;

    curve
      .map(addrToCoord)
      .map(centerOfCell)
      .forEach((addr) => {
        p5.circle(addr.col, addr.row, 10);
      });
  };

  const drawDebug = () => {
    if (!DEBUG) return;
    p5.noFill();
    p5.stroke(0);
    p5.strokeWeight(0.5);
    grid.forEach((row, x) =>
      row.forEach((cell, y) => {
        p5.rect(x * gridSpan.x, y * gridSpan.y, gridSpan.x, gridSpan.y);
        p5.text(`${cell}`, x * gridSpan.x + 5, y * gridSpan.y + gridSpan.y / 2);
      })
    );
  };

  const setupGrid = (size: number) => {
    grid = new Array<number[]>(size);
    for (let x = 0; x < size; x++) {
      grid[x] = new Array<number>(size).fill(0);
    }
    gridSpan.x = p5.width / size;
    gridSpan.y = p5.height / size;
  };

  const growCurve = (idx: number) => {
    const currentRow = curves[idx].at(-1).row;
    const currentCol = curves[idx].at(-1).col;
    if (currentRow >= grid[0].length) return;
    let offset = Math.floor(p5.randomGaussian(0, 1) * MAX_STEP);
    while (
      currentCol + offset < 0 ||
      currentCol + offset > grid.length - 1 ||
      grid[currentCol + offset][currentRow]
    ) {
      offset = Math.floor(p5.randomGaussian(0, 1) * MAX_STEP);
    }
    grid[currentCol + offset][currentRow + 1] = idx + 1;
    curves[idx].push({ col: currentCol + offset, row: currentRow + 1 });
  };

  const setupCurves = (count: number) => {
    curves = new Array<cellAddr[]>(count);
    for (let i = 0; i < count; i++) {
      curves[i] = new Array<cellAddr>();
      let startCol = Math.floor(
        p5.randomGaussian(grid.length / 2, grid.length / 8)
      );
      while (grid[startCol][0]) {
        startCol = Math.floor(
          p5.randomGaussian(grid.length / 2, grid.length / 8)
        );
      }
      grid[startCol][0] = i + 1;
      curves[i].push({ row: 0, col: startCol });
    }
  };
};

new p5(sketch);
