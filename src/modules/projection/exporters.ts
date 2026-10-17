import type { ProjectionInfo, RegionExtent } from './types'
import { effectiveParams } from './params'

/**
 * 参数导出 — 对应 spec/02 §7。
 * PROJ4 / WKT2 均可直接粘贴到 ArcGIS Pro / 超图 GIS；
 * EPSG 仅在有直接对应编号时给出，否则明示用 PROJ4/WKT。
 */

export function epsgHint(info: ProjectionInfo): string {
  return info.epsgHint ?? '无直接对应（自定义参数），请复制 PROJ4 或 WKT 导入 ArcGIS Pro / 超图 GIS'
}

export function buildProj4(info: ProjectionInfo, extent: RegionExtent): string {
  const p = effectiveParams(info, extent)
  const lon0 = `+lon_0=${p.centralMeridian}`
  const common = `${lon0} +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs`
  const sp = p.standardParallels
  switch (info.id) {
    case 'mercator':
      return `+proj=merc ${lon0} +lat_ts=0 +datum=WGS84 +units=m +no_defs`
    case 'transverse-mercator':
      return `+proj=tmerc +lat_0=0 ${lon0} +k=1 +x_0=500000 +y_0=0 +datum=WGS84 +units=m +no_defs`
    case 'lambert-conformal-conic':
      return `+proj=lcc +lat_1=${sp![0]} +lat_2=${sp![1]} +lat_0=${p.originLat} ${common}`
    case 'albers-equal-area-conic':
      return `+proj=aea +lat_1=${sp![0]} +lat_2=${sp![1]} +lat_0=${p.originLat} ${common}`
    case 'azimuthal-equidistant':
      return `+proj=aeqd +lat_0=${p.originLat} ${common}`
    case 'polar-stereographic':
      return `+proj=stere +lat_0=${p.originLat >= 0 ? 90 : -90} ${lon0} +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs`
    case 'lambert-azimuthal-equal-area':
      return `+proj=laea +lat_0=${p.originLat} ${common}`
    case 'equidistant-cylindrical':
      return `+proj=eqc +lat_ts=${sp?.[0] ?? 0} ${lon0} +datum=WGS84 +units=m +no_defs`
    case 'gall-peters':
      return `+proj=cea +lat_ts=45 ${lon0} +datum=WGS84 +units=m +no_defs`
    case 'robinson':
      return `+proj=robin ${lon0} +datum=WGS84 +units=m +no_defs`
    case 'winkel-tripel':
      return `+proj=wintri ${lon0} +datum=WGS84 +units=m +no_defs`
    case 'mollweide':
      return `+proj=moll ${lon0} +datum=WGS84 +units=m +no_defs`
    default:
      return `+proj=eqc ${lon0} +datum=WGS84 +units=m +no_defs`
  }
}

/** WKT2 PROJCRS 字符串；折中投影（Robinson/Winkel/Mollweide）无标准 EPSG 方法 ID，省略 ID 段 */
export function buildWkt(info: ProjectionInfo, extent: RegionExtent): string {
  const p = effectiveParams(info, extent)
  const sp = p.standardParallels
  const base =
    'BASEGEOGCRS["WGS 84",DATUM["World Geodetic System 1984",ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]]]'
  const cs =
    'CS[Cartesian,2],AXIS["easting",east,ORDER[1],LENGTHUNIT["metre",1]],AXIS["northing",north,ORDER[2],LENGTHUNIT["metre",1]]'
  const P = (name: string, v: number) => `PARAMETER["${name}",${v},ANGLEUNIT["degree",0.0174532925199433]]`
  const M = (name: string, v: number) => `PARAMETER["${name}",${v},LENGTHUNIT["metre",1]]`

  let method: string
  let params: string
  switch (info.id) {
    case 'albers-equal-area-conic':
      method = 'METHOD["Albers Equal Area",ID["EPSG",9822]]'
      params = [
        P('Latitude of false origin', p.originLat),
        P('Longitude of false origin', p.centralMeridian),
        P('Latitude of 1st standard parallel', sp![0]),
        P('Latitude of 2nd standard parallel', sp![1]),
        M('Easting at false origin', 0),
        M('Northing at false origin', 0),
      ].join(',')
      break
    case 'lambert-conformal-conic':
      method = 'METHOD["Lambert Conic Conformal (2SP)",ID["EPSG",9802]]'
      params = [
        P('Latitude of false origin', p.originLat),
        P('Longitude of false origin', p.centralMeridian),
        P('Latitude of 1st standard parallel', sp![0]),
        P('Latitude of 2nd standard parallel', sp![1]),
        M('Easting at false origin', 0),
        M('Northing at false origin', 0),
      ].join(',')
      break
    case 'mercator':
      method = 'METHOD["Mercator (variant A)",ID["EPSG",9804]]'
      params = [
        P('Latitude of natural origin', 0),
        P('Longitude of natural origin', p.centralMeridian),
        P('Scale factor at natural origin', 1),
        M('False easting', 0),
        M('False northing', 0),
      ].join(',')
      break
    case 'transverse-mercator':
      method = 'METHOD["Transverse Mercator",ID["EPSG",9807]]'
      params = [
        P('Latitude of natural origin', 0),
        P('Longitude of natural origin', p.centralMeridian),
        P('Scale factor at natural origin', 1),
        M('False easting', 500000),
        M('False northing', 0),
      ].join(',')
      break
    case 'polar-stereographic':
      method = 'METHOD["Polar Stereographic (variant A)",ID["EPSG",9810]]'
      params = [
        P('Latitude of natural origin', p.originLat >= 0 ? 90 : -90),
        P('Longitude of natural origin', p.centralMeridian),
        P('Scale factor at natural origin', 1),
        M('False easting', 0),
        M('False northing', 0),
      ].join(',')
      break
    case 'lambert-azimuthal-equal-area':
      method = 'METHOD["Lambert Azimuthal Equal Area",ID["EPSG",9820]]'
      params = [
        P('Latitude of natural origin', p.originLat),
        P('Longitude of natural origin', p.centralMeridian),
        M('False easting', 0),
        M('False northing', 0),
      ].join(',')
      break
    case 'azimuthal-equidistant':
      method = 'METHOD["Modified Azimuthal Equidistant",ID["EPSG",9832]]'
      params = [
        P('Latitude of natural origin', p.originLat),
        P('Longitude of natural origin', p.centralMeridian),
        M('False easting', 0),
        M('False northing', 0),
      ].join(',')
      break
    case 'equidistant-cylindrical':
      method = 'METHOD["Equidistant Cylindrical",ID["EPSG",9823]]'
      params = [
        P('Latitude of 1st standard parallel', sp?.[0] ?? 0),
        P('Longitude of natural origin', p.centralMeridian),
        M('False easting', 0),
        M('False northing', 0),
      ].join(',')
      break
    case 'gall-peters':
      method = 'METHOD["Cylindrical Equal Area",ID["EPSG",9835]]'
      params = [
        P('Latitude of 1st standard parallel', 45),
        P('Longitude of natural origin', p.centralMeridian),
        M('False easting', 0),
        M('False northing', 0),
      ].join(',')
      break
    default:
      // Robinson / Winkel Tripel / Mollweide：无标准 EPSG 方法 ID
      method = `METHOD["${info.name}"]`
      params = [
        P('Longitude of natural origin', p.centralMeridian),
        M('False easting', 0),
        M('False northing', 0),
      ].join(',')
      break
  }
  return `PROJCRS["custom_${info.id}",${base},CONVERSION["custom_${info.id}",${method},${params}],${cs}]`
}
