\echo 'Flood Alert Areas - IsValid'

\o /home/ubuntu/ltfri/spatial-data-loader/reports/flood_alert_area.txt

SELECT reason(ST_IsValidDetail(wkb_geometry)) FROM u_ltfri.flood_alert_area_bv_bng WHERE ST_IsValid(wkb_geometry) = false;

\o