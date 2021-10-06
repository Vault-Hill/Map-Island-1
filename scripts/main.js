import * as d3 from "https://cdn.skypack.dev/d3@7";
import VaultHill from './vault-hill.js';

Promise.all([
  d3.csv("./data/data.csv", d3.autoType),
  d3.dsv(";", "./data/VHC_MAPandGreens.csv"),
  d3.dsv(";", "./data/VHC_MAPandstreets.csv"),
  d3.dsv(";", "./data/VHC_MAPandHills.csv"),
  d3.dsv(";", "./data/VHC_MAPandCommonSpaces.csv"),
]).then(([data, greens, streets, hills, commonSpaces]) => {
  const greenData = processGreens(greens);
  const streetsData = processStreets(streets);

  const hillsData = hills.map((d) => {
    return {
      Name: d.Name,
      coords: [
        d.HILLS_1_XY.split(",").map((d) => +d),
        d.HILLS_2_XY.split(",").map((d) => +d),
        d.HILLS_3_XY.split(",").map((d) => +d),
      ],
    };
  });

  const common = commonSpaces.map((d) => {
    return {
      Name: d.Name,
      coords: [
        d.COMMONSPACE_1_XY.split(",").map((d) => +d),
        d.COMMONSPACE_2_XY.split(",").map((d) => +d),
        d.COMMONSPACE_3_XY.split(",").map((d) => +d),
        d.COMMONSPACE_4_XY.split(",").map((d) => +d),
        // d.COMMONSPACE_5_XY.split(",").map(d => +d),
        d.COMMONSPACE_6_XY.split(",").map((d) => +d),
        d.COMMONSPACE_7_XY.split(",").map((d) => +d),
      ],
    };
  });

  const vaultHill = VaultHill({
    data: {
      lands: data,
      greenAreas: [...greenData, ...hillsData],
      commonSpaces: common,
      streets: streetsData,
    }
  });
});

function processStreets(input) {
  const columns = input.columns.slice(2);

  return input.map((d) => {
    const coords = columns
      .filter((x) => d[x])
      .map((x) => {
        return d[x].split(",").map((x) => +x);
      });

    return {
      Name: d.Name,
      coords,
    };
  });
}

function processGreens(greens) {
  const columns = greens.columns.slice(2);

  return greens.map((d) => {
    const coords = columns
      .filter((x) => d[x])
      .map((x) => {
        return d[x].split(",").map((x) => +x);
      });

    return {
      Name: d.Name,
      coords,
    };
  });
}
