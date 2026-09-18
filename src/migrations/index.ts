import * as migration_20260912_180532_initial from './20260912_180532_initial';
import * as migration_20260912_184057_add_alt_names from './20260912_184057_add_alt_names';
import * as migration_20260913_173201_add_geo_tables from './20260913_173201_add_geo_tables';
import * as migration_20260915_073609_add_event_session_fields from './20260915_073609_add_event_session_fields';
import * as migration_20260915_150000_add_audit_log from './20260915_150000_add_audit_log';
import * as migration_20260916_090000_super_admin_and_profile from './20260916_090000_super_admin_and_profile';
import * as migration_20260916_100000_otp_log_fields from './20260916_100000_otp_log_fields';
import * as migration_20260916_110000_campaign_windows from './20260916_110000_campaign_windows';
import * as migration_20260916_120000_people_source_join_form from './20260916_120000_people_source_join_form';
import * as migration_20260916_130000_people_source_member_added from './20260916_130000_people_source_member_added';
import * as migration_20260917_100000_state_functionary_and_lastlogin from './20260917_100000_state_functionary_and_lastlogin';
import * as migration_20260918_100000_audit_delete_session from './20260918_100000_audit_delete_session';

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
    name: '20260913_173201_add_geo_tables',
  },
  {
    up: migration_20260915_073609_add_event_session_fields.up,
    down: migration_20260915_073609_add_event_session_fields.down,
    name: '20260915_073609_add_event_session_fields'
  },
  {
    up: migration_20260915_150000_add_audit_log.up,
    down: migration_20260915_150000_add_audit_log.down,
    name: '20260915_150000_add_audit_log',
  },
  {
    up: migration_20260916_090000_super_admin_and_profile.up,
    down: migration_20260916_090000_super_admin_and_profile.down,
    name: '20260916_090000_super_admin_and_profile',
  },
  {
    up: migration_20260916_100000_otp_log_fields.up,
    down: migration_20260916_100000_otp_log_fields.down,
    name: '20260916_100000_otp_log_fields',
  },
  {
    up: migration_20260916_110000_campaign_windows.up,
    down: migration_20260916_110000_campaign_windows.down,
    name: '20260916_110000_campaign_windows',
  },
  {
    up: migration_20260916_120000_people_source_join_form.up,
    down: migration_20260916_120000_people_source_join_form.down,
    name: '20260916_120000_people_source_join_form',
  },
  {
    up: migration_20260916_130000_people_source_member_added.up,
    down: migration_20260916_130000_people_source_member_added.down,
    name: '20260916_130000_people_source_member_added',
  },
  {
    up: migration_20260917_100000_state_functionary_and_lastlogin.up,
    down: migration_20260917_100000_state_functionary_and_lastlogin.down,
    name: '20260917_100000_state_functionary_and_lastlogin',
  },
  {
    up: migration_20260918_100000_audit_delete_session.up,
    down: migration_20260918_100000_audit_delete_session.down,
    name: '20260918_100000_audit_delete_session',
  },
];
