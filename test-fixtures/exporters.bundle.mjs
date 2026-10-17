// src/modules/projection/params.ts
var r1 = (v) => Math.round(v * 10) / 10;
function isChinaExtent(e) {
  return e.minLon <= 75 && e.maxLon >= 133 && e.minLat <= 20 && e.maxLat >= 52;
}
function gaussKrugerCentral(lon) {
  return (Math.floor(lon / 6) + 1) * 6 - 3;
}
function effectiveParams(info, extent) {
  const centerLon = r1((extent.minLon + extent.maxLon) / 2);
  const centerLat = r1((extent.minLat + extent.maxLat) / 2);
  const latSpan = extent.maxLat - extent.minLat;
  const innerParallels = [r1(extent.minLat + latSpan / 6), r1(extent.maxLat - latSpan / 6)];
  switch (info.id) {
    case "albers-equal-area-conic":
      return isChinaExtent(extent) ? { centralMeridian: 105, standardParallels: [25, 47], originLat: 0 } : { centralMeridian: centerLon, standardParallels: innerParallels, originLat: centerLat };
    case "lambert-conformal-conic":
      return { centralMeridian: centerLon, standardParallels: innerParallels, originLat: centerLat };
    case "transverse-mercator":
      return { centralMeridian: gaussKrugerCentral(centerLon), originLat: 0 };
    case "polar-stereographic":
      return { centralMeridian: centerLon, originLat: centerLat >= 0 ? 90 : -90 };
    case "equidistant-cylindrical":
      return { centralMeridian: centerLon, standardParallels: [centerLat], originLat: 0 };
    case "gall-peters":
      return { centralMeridian: centerLon, standardParallels: [45], originLat: 0 };
    default:
      return { centralMeridian: centerLon, originLat: centerLat };
  }
}

// src/modules/projection/exporters.ts
function epsgHint(info) {
  return info.epsgHint ?? "\u65E0\u76F4\u63A5\u5BF9\u5E94\uFF08\u81EA\u5B9A\u4E49\u53C2\u6570\uFF09\uFF0C\u8BF7\u590D\u5236 PROJ4 \u6216 WKT \u5BFC\u5165 ArcGIS Pro / \u8D85\u56FE GIS";
}
function buildProj4(info, extent) {
  const p = effectiveParams(info, extent);
  const lon0 = `+lon_0=${p.centralMeridian}`;
  const common = `${lon0} +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs`;
  const sp = p.standardParallels;
  switch (info.id) {
    case "mercator":
      return `+proj=merc ${lon0} +lat_ts=0 +datum=WGS84 +units=m +no_defs`;
    case "transverse-mercator":
      return `+proj=tmerc +lat_0=0 ${lon0} +k=1 +x_0=500000 +y_0=0 +datum=WGS84 +units=m +no_defs`;
    case "lambert-conformal-conic":
      return `+proj=lcc +lat_1=${sp[0]} +lat_2=${sp[1]} +lat_0=${p.originLat} ${common}`;
    case "albers-equal-area-conic":
      return `+proj=aea +lat_1=${sp[0]} +lat_2=${sp[1]} +lat_0=${p.originLat} ${common}`;
    case "azimuthal-equidistant":
      return `+proj=aeqd +lat_0=${p.originLat} ${common}`;
    case "polar-stereographic":
      return `+proj=stere +lat_0=${p.originLat >= 0 ? 90 : -90} ${lon0} +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs`;
    case "lambert-azimuthal-equal-area":
      return `+proj=laea +lat_0=${p.originLat} ${common}`;
    case "equidistant-cylindrical":
      return `+proj=eqc +lat_ts=${sp?.[0] ?? 0} ${lon0} +datum=WGS84 +units=m +no_defs`;
    case "gall-peters":
      return `+proj=cea +lat_ts=45 ${lon0} +datum=WGS84 +units=m +no_defs`;
    case "robinson":
      return `+proj=robin ${lon0} +datum=WGS84 +units=m +no_defs`;
    case "winkel-tripel":
      return `+proj=wintri ${lon0} +datum=WGS84 +units=m +no_defs`;
    case "mollweide":
      return `+proj=moll ${lon0} +datum=WGS84 +units=m +no_defs`;
    default:
      return `+proj=eqc ${lon0} +datum=WGS84 +units=m +no_defs`;
  }
}
function buildWkt(info, extent) {
  const p = effectiveParams(info, extent);
  const sp = p.standardParallels;
  const base = 'BASEGEOGCRS["WGS 84",DATUM["World Geodetic System 1984",ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]]]';
  const cs = 'CS[Cartesian,2],AXIS["easting",east,ORDER[1],LENGTHUNIT["metre",1]],AXIS["northing",north,ORDER[2],LENGTHUNIT["metre",1]]';
  const P = (name, v) => `PARAMETER["${name}",${v},ANGLEUNIT["degree",0.0174532925199433]]`;
  const M = (name, v) => `PARAMETER["${name}",${v},LENGTHUNIT["metre",1]]`;
  let method;
  let params;
  switch (info.id) {
    case "albers-equal-area-conic":
      method = 'METHOD["Albers Equal Area",ID["EPSG",9822]]';
      params = [
        P("Latitude of false origin", p.originLat),
        P("Longitude of false origin", p.centralMeridian),
        P("Latitude of 1st standard parallel", sp[0]),
        P("Latitude of 2nd standard parallel", sp[1]),
        M("Easting at false origin", 0),
        M("Northing at false origin", 0)
      ].join(",");
      break;
    case "lambert-conformal-conic":
      method = 'METHOD["Lambert Conic Conformal (2SP)",ID["EPSG",9802]]';
      params = [
        P("Latitude of false origin", p.originLat),
        P("Longitude of false origin", p.centralMeridian),
        P("Latitude of 1st standard parallel", sp[0]),
        P("Latitude of 2nd standard parallel", sp[1]),
        M("Easting at false origin", 0),
        M("Northing at false origin", 0)
      ].join(",");
      break;
    case "mercator":
      method = 'METHOD["Mercator (variant A)",ID["EPSG",9804]]';
      params = [
        P("Latitude of natural origin", 0),
        P("Longitude of natural origin", p.centralMeridian),
        P("Scale factor at natural origin", 1),
        M("False easting", 0),
        M("False northing", 0)
      ].join(",");
      break;
    case "transverse-mercator":
      method = 'METHOD["Transverse Mercator",ID["EPSG",9807]]';
      params = [
        P("Latitude of natural origin", 0),
        P("Longitude of natural origin", p.centralMeridian),
        P("Scale factor at natural origin", 1),
        M("False easting", 5e5),
        M("False northing", 0)
      ].join(",");
      break;
    case "polar-stereographic":
      method = 'METHOD["Polar Stereographic (variant A)",ID["EPSG",9810]]';
      params = [
        P("Latitude of natural origin", p.originLat >= 0 ? 90 : -90),
        P("Longitude of natural origin", p.centralMeridian),
        P("Scale factor at natural origin", 1),
        M("False easting", 0),
        M("False northing", 0)
      ].join(",");
      break;
    case "lambert-azimuthal-equal-area":
      method = 'METHOD["Lambert Azimuthal Equal Area",ID["EPSG",9820]]';
      params = [
        P("Latitude of natural origin", p.originLat),
        P("Longitude of natural origin", p.centralMeridian),
        M("False easting", 0),
        M("False northing", 0)
      ].join(",");
      break;
    case "azimuthal-equidistant":
      method = 'METHOD["Modified Azimuthal Equidistant",ID["EPSG",9832]]';
      params = [
        P("Latitude of natural origin", p.originLat),
        P("Longitude of natural origin", p.centralMeridian),
        M("False easting", 0),
        M("False northing", 0)
      ].join(",");
      break;
    case "equidistant-cylindrical":
      method = 'METHOD["Equidistant Cylindrical",ID["EPSG",9823]]';
      params = [
        P("Latitude of 1st standard parallel", sp?.[0] ?? 0),
        P("Longitude of natural origin", p.centralMeridian),
        M("False easting", 0),
        M("False northing", 0)
      ].join(",");
      break;
    case "gall-peters":
      method = 'METHOD["Cylindrical Equal Area",ID["EPSG",9835]]';
      params = [
        P("Latitude of 1st standard parallel", 45),
        P("Longitude of natural origin", p.centralMeridian),
        M("False easting", 0),
        M("False northing", 0)
      ].join(",");
      break;
    default:
      method = `METHOD["${info.name}"]`;
      params = [
        P("Longitude of natural origin", p.centralMeridian),
        M("False easting", 0),
        M("False northing", 0)
      ].join(",");
      break;
  }
  return `PROJCRS["custom_${info.id}",${base},CONVERSION["custom_${info.id}",${method},${params}],${cs}]`;
}
export {
  buildProj4,
  buildWkt,
  epsgHint
};
