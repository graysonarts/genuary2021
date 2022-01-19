// Copyright 2022 Grayson Hay.
// SPDX-License-Identifier: MIT

import * as p5 from "p5";
const GRID_SIZE = 19;
const PADDING = 0;

const sketch = (p5: p5) => {
  let x_span, y_span;
  let seed = 0;
  p5.setup = () => {
    p5.createCanvas(1280, 720);
    p5.frameRate(60);
    seed = p5.random(-10000, 10000);
    p5.randomSeed(seed);

    x_span = (p5.width - PADDING * 2) / GRID_SIZE;
    y_span = (p5.height - PADDING * 2) / GRID_SIZE;
  };

  p5.draw = () => {
    p5.randomSeed(seed);
    p5.background([0, 0, 0]);
    p5.translate(-x_span / 2, -y_span / 2);
    p5.noFill();
    for (let i = 1; i < GRID_SIZE; i++) {
      for (let j = 1; j < GRID_SIZE; j++) {
        let lastX, lastY;
        lastX = (i / GRID_SIZE) * p5.width;
        lastY = (j / GRID_SIZE) * p5.height;
        for (let k = 1; k < GRID_SIZE; k++) {
          const z =
            (i / GRID_SIZE) *
            p5.sin((k / GRID_SIZE) * p5.TAU) *
            p5.atan((j / GRID_SIZE) * p5.TAU * p5.randomGaussian(0, 0.3)) *
            p5.randomGaussian(0, 1);
          const a =
            (i / GRID_SIZE) *
            p5.tan((k / GRID_SIZE) * p5.TAU * p5.randomGaussian(1, 0.5)) *
            p5.cos((j / GRID_SIZE) * p5.TAU) *
            p5.randomGaussian(0, 1);
          p5.stroke(255, 255, 255, z * a * 255);
          p5.strokeWeight((3 * z) / a);
          const x = (i / GRID_SIZE) * p5.width + z * x_span;
          const y = (j / GRID_SIZE) * p5.height + a * y_span;
          p5.line(lastX, lastY, x, y);
          lastX = x;
          lastY = y;
        }
      }
    }
    p5.noLoop();
  };
};

new p5(sketch);
