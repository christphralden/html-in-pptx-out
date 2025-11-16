import type { Dimensions, Position } from "@/types/base.types";
import { SERIALIZER } from "@/constants";

export const pxToInches = (px: number): number => {
  return px / SERIALIZER.DPI;
};

export const pxToPoints = (px: number): number => {
  return (px / SERIALIZER.DPI) * 72;
};

export const positionToPercentage = (
  position: Position,
  viewport: Dimensions,
): { x: `${number}%`; y: `${number}%` } => {
  const xPercent = (position.left / viewport.width) * 100;
  const yPercent = (position.top / viewport.height) * 100;

  return {
    x: `${xPercent}%`,
    y: `${yPercent}%`,
  };
};

export const dimensionsToPercentage = (
  dimensions: Dimensions,
  viewport: Dimensions,
): { w: `${number}%`; h: `${number}%` } => {
  const wPercent = (dimensions.width / viewport.width) * 100;
  const hPercent = (dimensions.height / viewport.height) * 100;

  return {
    w: `${wPercent}%`,
    h: `${hPercent}%`,
  };
};

export const positionToInches = (
  position: Position,
): { x: number; y: number } => {
  return {
    x: pxToInches(position.left),
    y: pxToInches(position.top),
  };
};

export const dimensionsToInches = (
  dimensions: Dimensions,
): { w: number; h: number } => {
  return {
    w: pxToInches(dimensions.width),
    h: pxToInches(dimensions.height),
  };
};
