\echo 'UFMFSW Flow Direction 1 in 1000 - Renaming _valid table original table'

ALTER TABLE u_ltfri.ufmfsw_flow_direction_1_in_1000_bv_bng_valid RENAME TO ufmfsw_flow_direction_1_in_1000_bv_bng;

ALTER SEQUENCE ufmfsw_flow_direction_1_in_1000_bv_bng_valid_ogc_fid_seq
  RENAME TO ufmfsw_flow_direction_1_in_1000_bv_bng_ogc_fid_seq;
