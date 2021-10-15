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

    Lake: 0x122230,
    Bridges: 0xffffff,
    Exclusive: 0xc1e5e6,
    Deluxe: 0x75bac1,
    Premium: 0x4aa6af,
    Standard: 0x00929c,
    Highlight: 0xd91e18,
  },
  dark: {
    Water: 0x122230,
    Green: 0x00ff00,

    Streets: {
      type: 'color',
      value: 0x32495c,
    },

    GreenLand: {
      type: 'color',
      value: 0x00ff00,
    },

    Lake: 0x122230,
    Ground: 0x0a0f1d,

    Bridges: 0xffffff,

    Exclusive: 0xc1e5e6,
    Deluxe: 0x75bac1,
    Premium: 0x4aa6af,
    Standard: 0x00929c,
    Highlight: 0xd91e18,
  },
}

export const sizes = {
  Exclusive: 48 / scaleFactor,
  Deluxe: 32 / scaleFactor,
  Premium: 16 / scaleFactor,
  Standard: 8 / scaleFactor,
};

export const waterColor = 0x259CC8;
export const sunColor = 0xffffff;
export const waterMaterial = "images/textures/waternormals.jpeg";
