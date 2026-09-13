import * as migration_20260912_180532_initial from './20260912_180532_initial';
import * as migration_20260912_184057_add_alt_names from './20260912_184057_add_alt_names';
import * as migration_20260913_173201_add_geo_tables from './20260913_173201_add_geo_tables';

export const migrations = [
  {
    up: migration_20260912_180532_initial.up,
    down: migration_20260912_180532_initial.down,
    name: '20260912_180532_initial',
  },
  {
    up: migration_20260912_184057_add_alt_names.up,
    down: migration_20260912_184057_add_alt_names.down,
    name: '20260912_184057_add_alt_names',
  },
  {
    up: migration_20260913_173201_add_geo_tables.up,
    down: migration_20260913_173201_add_geo_tables.down,
    name: '20260913_173201_add_geo_tables'
  },
];
