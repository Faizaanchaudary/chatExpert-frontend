import React from "react";
import Svg, { Path, Line, Rect } from "react-native-svg";

export const SingleImageSVG = ({ width, height }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 512 388"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Rect width="512" height="388" fill="white" />
    <Path
      d="M 256 0 C 384 0 512 0 512 194 C 512 388 384 388 256 388 C 128 388 0 388 0 194 C 0 0 128 0 256 0 Z"
      fill="none"
      stroke="black"
      strokeWidth="2"
    />
    <Path d="M 256 0 L 256 388" stroke="black" strokeWidth="2" />
  </Svg>
);

export const DoubleImageSVG = ({ width, height }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 512 800"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer book shape */}
    <Rect width="512" height="800" fill="white" />
    <Path
      d="M 0 0 C 128 0 384 0 512 0 C 512 400 384 400 256 400 C 128 400 0 400 0 0 Z"
      fill="none"
      stroke="black"
      strokeWidth="2"
    />
    <Path
      d="M 0 400 C 128 400 384 400 512 400 C 512 800 384 800 256 800 C 128 800 0 800 0 400 Z"
      fill="none"
      stroke="black"
      strokeWidth="2"
    />

    {/* Spine divider */}
    <Line x1="256" y1="0" x2="256" y2="800" stroke="black" strokeWidth="2" />

    {/* Top page lines */}
    <Line
      x1="128"
      y1="100"
      x2="384"
      y2="100"
      stroke="black"
      strokeWidth="1"
      strokeDasharray="5 5"
    />
    <Line
      x1="128"
      y1="200"
      x2="384"
      y2="200"
      stroke="black"
      strokeWidth="1"
      strokeDasharray="5 5"
    />

    {/* Bottom page lines */}
    <Line
      x1="128"
      y1="600"
      x2="384"
      y2="600"
      stroke="black"
      strokeWidth="1"
      strokeDasharray="5 5"
    />
    <Line
      x1="128"
      y1="700"
      x2="384"
      y2="700"
      stroke="black"
      strokeWidth="1"
      strokeDasharray="5 5"
    />
  </Svg>
);
