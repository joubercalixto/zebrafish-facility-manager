import {appendFileSync, writeFileSync} from 'fs';

// Simple ad-hoc program to generate SQL statements for creating tanks for the NIH.

class NIHRack {
  constructor(
    public room: string,
    public system: number,
    public aisle: number,
    public rack: string,
    public shelves: number,
    public spouts: number,
    public topLeft: number
  ) {
  }
}

async function generateSql() {
  const filename: string = 'tankCreation.sql';
  const f = writeFileSync(filename, '');
  const racks: NIHRack[] = [
    new NIHRack('B226', 1, 19, 'A', 6, 144, 10001),
    new NIHRack('B226', 1, 19, 'B', 6, 144, 10145),
    new NIHRack('B226', 1, 19, 'C', 8, 112, 10289),
    new NIHRack('B226', 4, 9, 'C', 6, 144, 45133),
    new NIHRack('B226', 4, 9, 'D', 6, 144, 45277),
    new NIHRack('B226', 4, 9, 'E', 6, 144, 45421),
    new NIHRack('B226', 4, 9, 'F', 8, 112, 45565),
    new NIHRack('B132', 1, 1, 'A', 6, 102, 15700),
    new NIHRack('B138', 2, 1, 'A', 6, 102, 25700),
    new NIHRack('B134', 3, 1, 'A', 6, 102, 35800),
    new NIHRack('B141', 4, 1, 'A', 6, 102, 45700),
  ];
  for (let rack of racks) {
    if (rack.system === 2 && rack.aisle === 3 && rack.rack === 'D') {
      rack.spouts = 112;
    }
    let tankNumber = rack.topLeft - 1;
    let data: string[] = [];
    let shelf = 0;
    let tankName;
    const spoutsPerShelf = rack.spouts / rack.shelves;
    for (let spout = 1; spout <= rack.spouts; spout++) {

      // The missing spout!!! System 2, Aisle 3 Top shelf, last spout.
      // Note that the tank number does not increase for this non-existent spout.
      if (rack.system === 2 && rack.aisle === 3 && spout === 14) {
        continue;
      }

      tankNumber++;
      tankName = String(tankNumber);
      if ((spout - 1) % spoutsPerShelf === 0) {
        shelf++;
      }
      let room = '';
      if (rack.room !== 'B226') {
        room = `room ${rack.room}, `;
      }
      data.push(`('${tankName}','${tankName}',` +
        `'${room}sys ${rack.system}, aisle ${rack.aisle}, rack ${rack.rack},  shelf ${shelf} ${tankName}')`);

    }
    const query = 'INSERT INTO tank(name, sortOrder, comment) ' +
      'values' + data.join(',') + ';\n'
    appendFileSync(filename, query);
  }
}

generateSql();


