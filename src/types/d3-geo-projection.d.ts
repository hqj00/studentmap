declare module 'd3-geo-projection' {
  import type { GeoProjection } from 'd3-geo'
  export function geoCylindricalEqualArea(): GeoProjection & { parallel(value: number): GeoProjection }
  export function geoMollweide(): GeoProjection
  export function geoRobinson(): GeoProjection
  export function geoWinkel3(): GeoProjection
}
