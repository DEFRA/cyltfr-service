\echo 'UFMFSW Extent 1 in 30 - Renaming _valid table original table'

ALTER TABLE u_ltfri.ufmfsw_extent_1_in_30_bv_bng_valid RENAME TO ufmfsw_extent_1_in_30_bv_bng;

ALTER SEQUENCE ufmfsw_extent_1_in_30_bv_bng_valid_ogc_fid_seq
  RENAME TO ufmfsw_extent_1_in_30_bv_bng_ogc_fid_seq;
