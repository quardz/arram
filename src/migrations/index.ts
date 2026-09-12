import * as migration_20260912_180532_initial from './20260912_180532_initial';

export const migrations = [
  {
    up: migration_20260912_180532_initial.up,
    down: migration_20260912_180532_initial.down,
    name: '20260912_180532_initial'
  },
];
