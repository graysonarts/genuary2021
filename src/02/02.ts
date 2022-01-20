// Copyright 2022 Grayson Hay.
// SPDX-License-Identifier: MIT

import * as p5 from "p5";

const ruleSet = [4, 3, 2, 1];
const CELL_COUNT = 25;
const SECTIONS = 4;

const sketch = (p5: p5) => {
  let generation = 0;
  let seed = 0;
  let maxGeneration;
  let oddGeneration = new Array<boolean>(CELL_COUNT);
  let evenGeneration = new Array<boolean>(CELL_COUNT);
  let x_span, y_span;
  let onColor, offColor;

  const drawCell = [
    (gen: number, idx: number) => {
      p5.rect(idx * x_span, (gen * y_span) / SECTIONS, x_span, y_span);
    },
    (gen: number, idx: number) => {
      p5.rect(idx * x_span, -(((gen + 3) * y_span) / SECTIONS), x_span, y_span);
    },
    (gen: number, idx: number) => {
      p5.rect(-((gen + 2) * x_span) / SECTIONS, idx * y_span, x_span, y_span);
    },
    (gen: number, idx: number) => {
      p5.rect(
        -((gen + 1) * x_span) / SECTIONS,
        -(idx + 1) * y_span,
        x_span,
        y_span
      );
    },
  ];
  p5.setup = () => {
    p5.colorMode(p5.HSB);
    p5.createCanvas(720, 720);
    p5.frameRate(60);
    seed = p5.random(-10000, 10000);
    p5.randomSeed(seed);
    const hue = p5.randomGaussian(128, 128);
    onColor = p5.color(hue, 255, 255);
    offColor = p5.color(Math.abs(128 - hue), 255, 32);
    x_span = p5.width / CELL_COUNT / 2;
    y_span = p5.height / CELL_COUNT / 2;
    maxGeneration = Math.ceil(p5.height / y_span / 2);

    for (let i = 0; i < oddGeneration.length; i++) {
      oddGeneration[i] = p5.randomGaussian(1, 10) < 0.5;
    }

    p5.noStroke();
    p5.fill(0);
    p5.rect(0, 0, p5.width, p5.height);
  };

  p5.draw = () => {
    p5.noStroke();

    p5.translate(p5.width / 2, p5.height / 2);
    const generationType = generation % SECTIONS;

    for (let i = 0; i < oddGeneration.length; i++) {
      p5.fill(oddGeneration[i] ? onColor : offColor);
      drawCell[generationType](generation, i);

      if (i > 1 || i < oddGeneration.length - 1) {
        const left = oddGeneration[i - 1] ? 4 : 0;
        const middle = oddGeneration[i] ? 2 : 0;
        const right = oddGeneration[i + 1] ? 1 : 0;
        const value = left + middle + right;
        evenGeneration[i] = ruleSet.includes(value);
      }
    }

    for (let i = 0; i < oddGeneration.length; i++) {
      oddGeneration[i] = evenGeneration[i];
    }

    generation++;
    if (generation > maxGeneration * 4) {
      p5.noLoop();
    }
  };
};

new p5(sketch);
