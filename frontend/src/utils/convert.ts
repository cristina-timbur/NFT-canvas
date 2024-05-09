import { Color } from "./types";

export const hexToColor = (hex: string): Color | undefined => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    red: BigInt(parseInt(result[1], 16)),
    green: BigInt(parseInt(result[2], 16)),
    blue: BigInt(parseInt(result[3], 16))
  } : undefined;
}

export const rgbToHex = (r: bigint, g: bigint, b: bigint): string => {
  return "#" + (BigInt(1 << 24) + BigInt(r << BigInt(16)) + BigInt(g << BigInt(8)) + BigInt(b)).toString(16).slice(1);
};