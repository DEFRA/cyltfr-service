--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.19
-- Dumped by pg_dump version 10.0

-- Started on 2018-02-02 13:30:45 GMT


--
-- TOC entry 285 (class 1259 OID 677582)
-- Name: flood_alert_area_bv_bng; Type: TABLE; Schema: u_ltfri; Owner: u_ltfri; Tablespace: postgis_tables
--

CREATE TABLE flood_alert_area_bv_bng (
    area character varying(50),
    fws_tacode character varying(50),
    ta_name character varying(100),
    descrip character varying(254),
    la_name character varying(254),
    qdial character varying(50),
    river_sea character varying(254),
    shape_length double precision,
    shape_area double precision,
    wkb_geometry geometry(MultiPolygon,27700),
    ogc_fid integer NOT NULL
);


ALTER TABLE flood_alert_area_bv_bng OWNER TO u_ltfri;

--
-- TOC entry 286 (class 1259 OID 690755)
-- Name: flood_alert_area_bv_bng_ogc_fid_seq; Type: SEQUENCE; Schema: u_ltfri; Owner: u_ltfri
--

CREATE SEQUENCE flood_alert_area_bv_bng_ogc_fid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE flood_alert_area_bv_bng_ogc_fid_seq OWNER TO u_ltfri;

--
-- TOC entry 3462 (class 0 OID 0)
-- Dependencies: 286
-- Name: flood_alert_area_bv_bng_ogc_fid_seq; Type: SEQUENCE OWNED BY; Schema: u_ltfri; Owner: u_ltfri
--

ALTER SEQUENCE flood_alert_area_bv_bng_ogc_fid_seq OWNED BY flood_alert_area_bv_bng.ogc_fid;


--
-- TOC entry 3338 (class 2604 OID 690757)
-- Name: flood_alert_area_bv_bng ogc_fid; Type: DEFAULT; Schema: u_ltfri; Owner: u_ltfri
--

ALTER TABLE ONLY flood_alert_area_bv_bng ALTER COLUMN ogc_fid SET DEFAULT nextval('flood_alert_area_bv_bng_ogc_fid_seq'::regclass);


SET default_tablespace = '';

--
-- TOC entry 3340 (class 2606 OID 696254)
-- Name: flood_alert_area_bv_bng flood_alert_area_bv_bng_valid_pkey; Type: CONSTRAINT; Schema: u_ltfri; Owner: u_ltfri
--

ALTER TABLE ONLY flood_alert_area_bv_bng
    ADD CONSTRAINT flood_alert_area_bv_bng_valid_pkey PRIMARY KEY (ogc_fid);


SET default_tablespace = postgis_indexes;

--
-- TOC entry 3341 (class 1259 OID 696255)
-- Name: flood_alert_area_bv_bng_wkb_geometry_geom_idx; Type: INDEX; Schema: u_ltfri; Owner: u_ltfri; Tablespace: postgis_indexes
--

CREATE INDEX flood_alert_area_bv_bng_wkb_geometry_geom_idx ON flood_alert_area_bv_bng USING gist (wkb_geometry);

ALTER TABLE flood_alert_area_bv_bng CLUSTER ON flood_alert_area_bv_bng_wkb_geometry_geom_idx;


-- Completed on 2018-02-02 13:30:45 GMT

--
-- PostgreSQL database dump complete
--

