export const worldYPosition = 0.1;
export const scaleFactor = 1000;

export const theme = {
  ocean: {
    Water: 0x122230,
    Green: 0x041922,
    Ground: 0x0a0f1d,

    Streets: {
      type: 'texture',
      value: 'images/textures/gravel.jpeg',
    },

    GreenLand: {
      type: 'texture',
      value: 'images/textures/grass.jpeg',

    },

    Lake: 0x5a7c99,
    Bridges: 0x22384a,
    Exclusive: 0xc1e5e6,
    Deluxe: 0x75bac1,
    Premium: 0x4aa6af,
    Standard: 0x00929c,
    Highlight: 0xd91e18,
  },
  dark: {
    Water: 0x122230,
    Green: 0x041922,

    Streets: {
      type: 'color',
      value: 0x2d344a,
    },

    GreenLand: {
      type: 'color',
      value: 0x041922,
    },

    Lake: 0x122230,
    Ground: 0x47255a,

    Bridges: 0x243546,

    Exclusive: 0xfdffcc,
    Deluxe: 0x7dcdbb,
    Premium: 0x347cb8,
    Standard: 0x503777,
    Highlight: 0xd91e18,
  },
}

export const sizes = {
  Exclusive: 96 / scaleFactor,
  Deluxe: 64 / scaleFactor,
  Premium: 48 / scaleFactor,
  Standard: 32 / scaleFactor,
};

export const waterColor = 0x259CC8;
export const sunColor = 0xffffff;
export const waterMaterial = "images/textures/waternormals.jpeg";
