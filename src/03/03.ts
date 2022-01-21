// Copyright 2022 Grayson Hay.
// SPDX-License-Identifier: MIT
import * as p5 from "p5";

const PERIOD = 500;

const sketch = (p5: p5) => {
  let seed = 0;
  let scale1;
  let scale2;
  let time = 0;

  p5.setup = () => {
    p5.createCanvas(1280, 720);
    p5.frameRate(60);
    seed = p5.random(-10000, 10000);
    p5.randomSeed(seed);
    newScale();
  };

  const newScale = () => {
    scale1 = p5.random(25);
    scale2 = p5.random(15);
  };

  const sinScale = (c) => (t) => c(t * Math.PI);
  const half = (c) => (t) => c(t) / 2;
  const func = sinScale(
    half((t) => (Math.sin(scale1 * t) + Math.sin(scale2 * t)) / Math.exp(t))
  );

  p5.draw = () => {
    if (time === 0) {
      p5.fill(255);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
      newScale();
      console.log("clearing");
    }

    p5.noFill();
    p5.stroke(0);
    p5.strokeWeight(5);
    p5.translate(0, p5.height / 2);
    const y = (func(time / PERIOD) * p5.height) / 2;
    const x = (time / PERIOD) * p5.width;

    p5.point(x, y);

    time = (time + 1) % PERIOD;

    // p5.beginShape();
    // for (let i = 0; i < PERIOD; i++) {
    //   const value = func(i / PERIOD);
    //   p5.vertex((i / PERIOD) * p5.width, (value * p5.height) / 2);
    // }
    // p5.endShape();
  };
};

new p5(sketch);
