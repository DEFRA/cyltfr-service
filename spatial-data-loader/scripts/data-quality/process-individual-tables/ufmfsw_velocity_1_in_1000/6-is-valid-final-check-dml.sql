\echo 'UFMFSW Velocity 1 in 1000 - IsValid'

\o /home/ubuntu/ltfri/spatial-data-loader/reports/ufmfsw_velocity_1_in_1000.txt

SELECT reason(ST_IsValidDetail(wkb_geometry)) FROM u_ltfri.ufmfsw_velocity_1_in_1000_bv_bng WHERE ST_IsValid(wkb_geometry) = false;

\o