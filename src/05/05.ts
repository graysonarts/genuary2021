// Copyright 2022 Grayson Hay.
// SPDX-License-Identifier: MIT
import * as p5 from "p5";

const PERIOD = 333;

const sketch = (p5: p5) => {
  let seed = 0;
  let scale1;
  let scale2;
  let scale3;
  let time = 0;

  p5.setup = () => {
    p5.createCanvas(1280, 720);
    p5.frameRate(60);
    seed = p5.random(-10000, 10000);
    p5.randomSeed(seed);
    newScale();
    newFunc();
  };

  const newScale = () => {
    scale1 = p5.random(25);
    scale2 = p5.random(15);
    scale3 = p5.random(10) + 5;
  };

  const pieces = {
    sin: "y * Math.sin(t * Math.PI)",
    cos: "x * Math.cos(t * Math.PI)",
    tan: "y * Math.tan(t * Math.PI)",
    exp: "Math.exp(t)",
    half: "t / 2",
    double: "t * 2",
    inverse: "-t",
    abs: "Math.abs(t)",
    x: "x",
    y: "y",
  };

  const ops = ["+", "-", "/", "*", "%"];

  const newFunc = () => {
    const numOps = Math.floor(p5.random(2, 15));
    const keys = Object.keys(pieces);
    const funcOps = [];
    for (let i = 0; i < numOps; i++) {
      const op = ops[Math.floor(p5.random(ops.length))];
      const keyIdx = Math.floor(p5.random(Object.keys(pieces).length));
      if (funcOps.length !== 0) {
        funcOps.push(op);
      }
      funcOps.push(pieces[keys[keyIdx]]);
    }
    const evalString = funcOps.reduce((acc, v) => (acc += ` ${v}`));
    func = eval(`(t,x,y) => (${evalString})`);
  };

  let func;

  p5.draw = () => {
    if (time === 0) {
      p5.fill(255);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
      newScale();

      newFunc();
    }
    p5.noStroke();
    p5.fill(255);
    p5.rect(0, p5.height - 30, p5.width, p5.height);
    p5.fill(0);
    p5.textFont("monospace");
    const funcStr = func.toString().replaceAll("Math.", "");
    p5.textSize(funcStr.length < 150 ? 12 : 10);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text(funcStr, p5.width / 2, p5.height - 18);

    p5.noFill();
    p5.stroke(0, 32);
    p5.strokeWeight(5);
    p5.translate(p5.width / 2, p5.height / 2);
    const quarter = p5.height / 4;

    for (let x = -p5.width / 20; x < p5.width / 20; x++) {
      for (let y = -p5.height / 20; y < p5.height / 20; y++) {
        const value = func(time / PERIOD, x * scale1, y * scale2) / 2;
        p5.point(x * 10 * value, y * 5 * value);
      }
    }

    time = (time + 1) % PERIOD;
  };
};

new p5(sketch);
