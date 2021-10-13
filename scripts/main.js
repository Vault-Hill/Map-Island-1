import * as d3 from "https://cdn.skypack.dev/d3@7";
import VaultHill from "./vault-hill.js";

const scaleFactor = 1000;

let sidebarShown = false, vaultHill, threeD = false, day = true;

d3.select('#toggler').on('click', toggleSidebar);
// d3.select('#texture_selector').on('change', changeTexture)
d3.select('#day_night_toggle').on('click', toggleDayNight)
// d3.select('#threeDBtn').on('click', toggleThreeD);

Promise.all([
  d3.csv("./data/data.csv", d3.autoType),
  d3.dsv(";", "./data/VHC_MAPandGreens.csv"),
  d3.dsv(";", "./data/VHC_MAPandstreets.csv"),
  d3.dsv(";", "./data/VHC_MAPandHills.csv"),
  d3.dsv(";", "./data/VHC_MAPandCommonSpaces.csv"),
  d3.csv("./data/VHC_MAPandDiagonalsParallels.csv"),
  d3.dsv(";", "./data/VHC_MAPandLakes.csv"),
]).then(([data, greens, streets, hills, commonSpaces, bridges, lakes]) => {
  const greenData = processCoords(greens);
  const streetsData = processCoords(streets);
  const lakesData = processCoords(lakes);

  const hillsData = hills.map((d) => {
    return {
      Name: d.Name,
      coords: [
        d.HILLS_1_XY.split(",").map((d) => +d / scaleFactor),
        d.HILLS_2_XY.split(",").map((d) => +d / scaleFactor),
        d.HILLS_3_XY.split(",").map((d) => +d / scaleFactor),
      ],
    };
  });

  const common = commonSpaces.map((d) => {
    return {
      Name: d.Name,
      coords: [
        d.COMMONSPACE_1_XY.split(",").map((d) => +d / scaleFactor),
        d.COMMONSPACE_2_XY.split(",").map((d) => +d / scaleFactor),
        d.COMMONSPACE_3_XY.split(",").map((d) => +d / scaleFactor),
        d.COMMONSPACE_4_XY.split(",").map((d) => +d / scaleFactor),
        // d.COMMONSPACE_5_XY.split(",").map(d => +d),
        d.COMMONSPACE_6_XY.split(",").map((d) => +d / scaleFactor),
        d.COMMONSPACE_7_XY.split(",").map((d) => +d / scaleFactor),
      ],
    };
  });

  const bridgesData = processCoords(bridges);

  vaultHill = VaultHill({
    data: {
      lands: data.map(d => {
        return {
          ...d,
          x1: d.x1 / scaleFactor,
          y1: d.y1 / scaleFactor,
        }
      }),
      greenAreas: [...greenData, ...hillsData],
      commonSpaces: common,
      streets: streetsData,
      bridges: bridgesData,
      lakes: lakesData,
    },
    container: "#scene",
    material: 'ocean',
    onLandClick: (land) => {
      const el = d3.select('#land_info');

      if (land) {
        el.html(`
          <div style="margin-bottom: 10px">
            <label>ID:</label> 
            <div>${land.ID}</div>
          </div>
          <div>
            <label>
              NAME:
            </label>
            <div>
              ${land.Name}
            </div>
          </div>
        `)
        if (!sidebarShown) {
          toggleSidebar();
        }
      } else {
        el.html('');
      }
    }
  });
});

function toggleDayNight() {
  day = !day;

  d3.select(this).classed('day-selected', day).classed('night-selected', !day);

  vaultHill.updateMaterial(day ? 'ocean' : 'dark');
}

function changeTexture() {
  const val = this.value;
  vaultHill.updateMaterial(val);
}

function processCoords(greens, index = 2) {
  const columns = greens.columns.slice(index);

  return greens.map((d) => {
    const coords = columns
      .filter((x) => d[x])
      .map((x) => {
        return d[x].split(",").map((x) => +x / scaleFactor);
      });

    return {
      Name: d.Name,
      coords,
    };
  });
}

function toggleSidebar() {
  sidebarShown = !sidebarShown;
  
  const s = document.querySelector('#sidebar');
  s.setAttribute('class', 'sidebar' + (sidebarShown ? '' : ' sidebar__hidden'));

  const t = document.querySelector('#toggler');
  t.setAttribute('class', 'sidebar__close' + (sidebarShown ? '' : ' sidebar__hidden'));
}

// function toggleThreeD() {
//   threeD = !threeD;

//   d3.select(this).html(threeD ? '2D' : '3D');
//   // vaultHill.updateCamera(threeD);
// }