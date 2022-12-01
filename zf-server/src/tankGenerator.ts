import {appendFileSync, writeFileSync} from 'fs';

// A list of tanks on a shelf of shelves on a rack or racks
// e.g. tanks 1-10 or A-E
class TankList {
  names: string[] | number[];
}

// A list of shelves that share the SAME list of tanks
// e.g shelve A, B and C have 10 tanks each
class ShelfList {
  names: string[] | number[];
  tanks: TankList;
}

// A list of racks that share the same list of shelf lists
// e.g. Racks 1, 17 & Q are racks where shelves A,B and C have 10 tanks and
// shelved D and E have 20 tanks.
class RackList {
  names: string[] | number[];
  shelfLists: ShelfList[];
}


async function generateSql() {

  const sixTanks: TankList = {names: [1, 2, 3, 4, 5, 6]};
  const tenTanks: TankList = {names: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]};
  const fifteenTanks: TankList = {names: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]};

  const fiveByTen: ShelfList = {
    names: ['A', 'B', 'C', 'D', 'E'],
    tanks: tenTanks,
  };

  const fiveBySix: ShelfList = {
    names: ['A', 'B', 'C', 'D', 'E'],
    tanks: sixTanks,
  };

  const sixByFifteen: ShelfList = {
    names: ['A', 'B', 'C', 'D', 'E', 'F'],
    tanks: fifteenTanks,
  };

  const fiveByTenRacks: RackList = {
    names: [26, 27, 28, 29, 30, 32, 33, 34, 35, 37, 38, 39, 40],
    shelfLists: [fiveByTen],
  };

  const quarentineRack: RackList = {
    names: ['QT'],
    shelfLists: [fiveByTen],
  };

  const fiveBySixRacks: RackList = {
    names: [36, 41],
    shelfLists: [fiveBySix],
  };

  const sixByFifteenRack: RackList = {
    names: [31],
    shelfLists: [sixByFifteen],
  };

  const allRacks: RackList[] = [fiveByTenRacks, quarentineRack, fiveBySixRacks, sixByFifteenRack];

  const filename: string = 'tankCreation.sql';
  const f = writeFileSync(filename, '');
  for (const rack of allRacks) {
    for (const rackName of rack.names) {
      const d1: string[] = [];
      for (const shelfList of rack.shelfLists) {
        for (const shelfName of shelfList.names) {
          for (const tankName of shelfList.tanks.names) {
            const name: string = rackName.toString().concat(shelfName.toString(), tankName.toString());
            let sortOrder: string = '';
            if (typeof (rackName) === 'number') {
              sortOrder = String(rackName + 1000);
            } else {
              sortOrder = rackName;
            }
            if (typeof (shelfName) === 'number') {
              sortOrder = sortOrder.concat(String(shelfName + 1000));
            } else {
              sortOrder = sortOrder.concat(shelfName);
            }
            if (typeof (tankName) === 'number') {
              sortOrder = sortOrder.concat(String(tankName + 1000));
            } else {
              sortOrder = sortOrder.concat(tankName);
            }
            d1.push(`('${name}', '${sortOrder}', FALSE, null)`);
          }
        }
      }
      const q1 = 'INSERT INTO tank(name, sortOrder, isMultiTank, comment) ' +
        'values' + d1.join(',') + ';\n';
      appendFileSync(filename, q1);
    }
  }
}

generateSql();



