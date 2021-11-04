import * as d3 from "https://cdn.skypack.dev/d3@7";
import VaultHill from "./vault-hill.js";

const scaleFactor = 1000;

let sidebarShown = false, vaultHill, threeD = false, day = true;

// #sidebartoggler').on('click', toggleSidebar);
d3.select('#day_night_toggle').on('click', toggleDayNight)

Promise.all([
  d3.dsv(";", "./data/VHC_VLANDS_IDandCoordinates.csv"),
  d3.dsv(";", "./data/VHC_MAPandGreens.csv"),
  d3.dsv(";", "./data/VHC_MAPandstreets.csv"),
  d3.dsv(";", "./data/VHC_MAPandHills.csv"),
  d3.dsv(";", "./data/VHC_MAPandCommonSpaces.csv"),
  d3.csv("./data/VHC_MAPandDiagonalsParallels.csv"),
  d3.dsv(";", "./data/VHC_MAPandLakes.csv"),
]).then(([all_lands, greens, streets, hills, commonSpaces, bridges, lakes]) => {
  const data = all_lands.map(d => {
    const [xy1_x, xy1_y] = d._1_XY.split(", ").map(d => +d);
    const [xy2_x, xy2_y] = d._2_XY.split(", ").map(d => +d);
    const [xy3_x, xy3_y] = d._3_XY.split(", ").map(d => +d);
    const [xy4_x, xy4_y] = d._4_XY.split(", ").map(d => +d);
  
    const x1 = Math.min(xy1_x, xy2_x, xy3_x, xy4_x);
    const y1 = Math.min(xy1_y, xy2_y, xy3_y, xy4_y);

    // columns that you want to keep
    const keys = [
      'DISTRICT',
      'HUMAN INSTINCT',
      'VLAND ID',
      'COORDINATES',
    ];

    const obj = { x1, y1, Type: d['TYPE OF LAND'], };

    keys.forEach(k => obj[k] = d[k]);

    return obj;
  });

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
      console.log("land was clicked", land);
      // const el = d3.select('#land_info');

      // const fieldsNotShown = [];
      // let html = '';

      // if (land) {
      //   Object.keys(land).filter(k => {
      //     return fieldsNotShown.indexOf(k) === -1;
      //   }).forEach(k => {
      //     html += `
      //       <div class="sidebar-content-row">
      //         <label>${k}:</label> 
      //         <div>${land[k]}</div>
      //       </div>
      //     `
      //   });

      //   el.html(html);
      //   if (!sidebarShown) {
      //     toggleSidebar();
      //   }
      // } else {
      //   el.html('');
      // }
    },
    landTooltipHTML: (land) => {
      const fieldsNotShown = ['DISTRICT'];
      let html = `<div class="tooltip-header">${land.DISTRICT}</div>`;
      
      Object.keys(land).filter(k => {
        return fieldsNotShown.indexOf(k) === -1;
      }).forEach(k => {
        html += `
          <div class="tooltip-row">
            <label>${k}</label> 
            <div class="tooltip-row_value">${land[k]}</div>
          </div>
        `
      });      
      return html;
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

// function toggleSidebar() {
//   sidebarShown = !sidebarShown;
  
//   const s = document.querySelector('#sidebar');
//   s.setAttribute('class', 'sidebar' + (sidebarShown ? '' : ' sidebar__hidden'));

//   const t = document.querySelector('#toggler');
//   t.setAttribute('class', 'sidebar__close' + (sidebarShown ? '' : ' sidebar__hidden'));
// }