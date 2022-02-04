// Copyright 2022 Grayson Hay.
// SPDX-License-Identifier: MIT
import * as p5 from "p5";

const SHAPE = 5;
const LAYER_COUNT = 3;

const sketch = (p5: p5) => {
  let seed = 0;
  let layers: p5.Graphics[] = [];
  let angles: number[] = [];
  let rates: number[] = [];
  let rotateOne, rotateTwo;
  p5.setup = () => {
    p5.createCanvas(1280, 720);
    p5.frameRate(60);
    seed = p5.random(-10000, 10000);
    p5.randomSeed(seed);
    const bufferSize = Math.max(p5.width, p5.height) * 2;
    for (let i = 0; i < LAYER_COUNT; i++) {
      layers.push(p5.createGraphics(bufferSize, bufferSize));
      angles.push(p5.random() * p5.PI);
      rates.push(p5.random() / 1000);
    }

    layers.forEach((l) => {
      const shapeSize = Math.max(
        Math.abs(p5.randomGaussian(0, 1)) * SHAPE * SHAPE,
        5
      );
      switch (Math.floor(p5.random(2))) {
        case 0:
          l.noFill();
          l.stroke(0);
          l.strokeWeight(SHAPE);
          l.rectMode(p5.CENTER);
          for (let i = 0; i < bufferSize; i += shapeSize * 3) {
            l.rect(bufferSize / 2, bufferSize / 2, i, i);
          }
          break;
        case 1:
          l.noFill();
          l.stroke(0);
          l.strokeWeight(SHAPE);
          for (let i = 0; i < bufferSize; i += SHAPE * 3) {
            l.triangle(0, -1 * i, -1 * i, 1 * i, 1 * i, 1 * i);
          }
          break;
      }
    });
  };

  p5.draw = () => {
    p5.background(255);
    p5.translate(p5.width / 2, p5.height / 2);
    layers.forEach((l, idx) => {
      p5.push();
      p5.rotate(angles[idx]);
      p5.image(l, -l.width / 2, -l.height / 2);
      p5.pop();
      angles[idx] += rates[idx];
    });
  };
};

new p5(sketch);
