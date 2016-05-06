\echo 'UFMFSW Extent 1 in 1000 - Create Spatial Index'

CREATE INDEX ufmfsw_extent_1_in_1000_bv_bng_wkb_geometry_geom_idx
  ON ufmfsw_extent_1_in_1000_bv_bng
  USING gist
  (wkb_geometry)
TABLESPACE postgis_indexes;
