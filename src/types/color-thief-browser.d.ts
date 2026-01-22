declare module 'color-thief-browser' {
  export default class ColorThief {
    getColor(img: HTMLImageElement | null, quality?: number): [number, number, number];
    getPalette(img: HTMLImageElement | null, colorCount?: number, quality?: number): Array<[number, number, number]>;
  }
}
