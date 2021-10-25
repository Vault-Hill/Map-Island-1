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
    Exclusive: 0xFF7676,
    Deluxe: 0xF20000,
    Premium: 0x910000,
    Standard: 0x3F0A0A,
    Highlight: 0xd91e18,
  },
  dark: {
    Water: 0x122230,
    Green: 0x041922,

    Streets: {
      type: 'color',
      value: 0x32495c,
    },

    GreenLand: {
      type: 'color',
      value: 0x041922,
    },

    Lake: 0x122230,
    Ground: 0x0a0f1d,

    Bridges: 0x041922,

    Exclusive: 0xfdffcc,
    Deluxe: 0x7dcdbb,
    Premium: 0x347cb8,
    Standard: 0x3F0A0A,
    Highlight: 0xFFFFFF,
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
