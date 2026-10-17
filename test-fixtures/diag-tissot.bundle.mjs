// test-fixtures/d3Factory.bundle.mjs
var Adder = class {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }
  add(x) {
    const p = this._partials;
    let i = 0;
    for (let j = 0; j < this._n && j < 32; j++) {
      const y = p[j], hi = x + y, lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
      if (lo) p[i++] = lo;
      x = hi;
    }
    p[i] = x;
    this._n = i + 1;
    return this;
  }
  valueOf() {
    const p = this._partials;
    let n = this._n, x, y, lo, hi = 0;
    if (n > 0) {
      hi = p[--n];
      while (n > 0) {
        x = hi;
        y = p[--n];
        hi = x + y;
        lo = y - (hi - x);
        if (lo) break;
      }
      if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
        y = lo * 2;
        x = hi + y;
        if (y == x - hi) hi = x;
      }
    }
    return hi;
  }
};
function* flatten(arrays) {
  for (const array of arrays) {
    yield* array;
  }
}
function merge(arrays) {
  return Array.from(flatten(arrays));
}
var epsilon = 1e-6;
var epsilon2 = 1e-12;
var pi = Math.PI;
var halfPi = pi / 2;
var quarterPi = pi / 4;
var tau = pi * 2;
var degrees = 180 / pi;
var radians = pi / 180;
var abs = Math.abs;
var atan = Math.atan;
var atan2 = Math.atan2;
var cos = Math.cos;
var exp = Math.exp;
var log = Math.log;
var pow = Math.pow;
var sin = Math.sin;
var sign = Math.sign || function(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};
var sqrt = Math.sqrt;
var tan = Math.tan;
function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}
function asin(x) {
  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
}
function noop() {
}
function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}
var streamObjectType = {
  Feature: function(object, stream) {
    streamGeometry(object.geometry, stream);
  },
  FeatureCollection: function(object, stream) {
    var features = object.features, i = -1, n = features.length;
    while (++i < n) streamGeometry(features[i].geometry, stream);
  }
};
var streamGeometryType = {
  Sphere: function(object, stream) {
    stream.sphere();
  },
  Point: function(object, stream) {
    object = object.coordinates;
    stream.point(object[0], object[1], object[2]);
  },
  MultiPoint: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
  },
  LineString: function(object, stream) {
    streamLine(object.coordinates, stream, 0);
  },
  MultiLineString: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamLine(coordinates[i], stream, 0);
  },
  Polygon: function(object, stream) {
    streamPolygon(object.coordinates, stream);
  },
  MultiPolygon: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamPolygon(coordinates[i], stream);
  },
  GeometryCollection: function(object, stream) {
    var geometries = object.geometries, i = -1, n = geometries.length;
    while (++i < n) streamGeometry(geometries[i], stream);
  }
};
function streamLine(coordinates, stream, closed) {
  var i = -1, n = coordinates.length - closed, coordinate;
  stream.lineStart();
  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}
function streamPolygon(coordinates, stream) {
  var i = -1, n = coordinates.length;
  stream.polygonStart();
  while (++i < n) streamLine(coordinates[i], stream, 1);
  stream.polygonEnd();
}
function stream_default(object, stream) {
  if (object && streamObjectType.hasOwnProperty(object.type)) {
    streamObjectType[object.type](object, stream);
  } else {
    streamGeometry(object, stream);
  }
}
function spherical(cartesian22) {
  return [atan2(cartesian22[1], cartesian22[0]), asin(cartesian22[2])];
}
function cartesian(spherical22) {
  var lambda = spherical22[0], phi = spherical22[1], cosPhi = cos(phi);
  return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
}
function cartesianDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cartesianCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function cartesianAddInPlace(a, b) {
  a[0] += b[0], a[1] += b[1], a[2] += b[2];
}
function cartesianScale(vector, k) {
  return [vector[0] * k, vector[1] * k, vector[2] * k];
}
function cartesianNormalizeInPlace(d) {
  var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}
function compose_default(a, b) {
  function compose(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }
  if (a.invert && b.invert) compose.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  };
  return compose;
}
function rotationIdentity(lambda, phi) {
  if (abs(lambda) > pi) lambda -= Math.round(lambda / tau) * tau;
  return [lambda, phi];
}
rotationIdentity.invert = rotationIdentity;
function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau) ? deltaPhi || deltaGamma ? compose_default(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma)) : rotationLambda(deltaLambda) : deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma) : rotationIdentity;
}
function forwardRotationLambda(deltaLambda) {
  return function(lambda, phi) {
    lambda += deltaLambda;
    if (abs(lambda) > pi) lambda -= Math.round(lambda / tau) * tau;
    return [lambda, phi];
  };
}
function rotationLambda(deltaLambda) {
  var rotation = forwardRotationLambda(deltaLambda);
  rotation.invert = forwardRotationLambda(-deltaLambda);
  return rotation;
}
function rotationPhiGamma(deltaPhi, deltaGamma) {
  var cosDeltaPhi = cos(deltaPhi), sinDeltaPhi = sin(deltaPhi), cosDeltaGamma = cos(deltaGamma), sinDeltaGamma = sin(deltaGamma);
  function rotation(lambda, phi) {
    var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaPhi + x * sinDeltaPhi;
    return [
      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin(k * cosDeltaGamma + y * sinDeltaGamma)
    ];
  }
  rotation.invert = function(lambda, phi) {
    var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaGamma - y * sinDeltaGamma;
    return [
      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
      asin(k * cosDeltaPhi - x * sinDeltaPhi)
    ];
  };
  return rotation;
}
function rotation_default(rotate) {
  rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);
  function forward(coordinates) {
    coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  }
  forward.invert = function(coordinates) {
    coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  };
  return forward;
}
function circleStream(stream, radius, delta, direction, t0, t1) {
  if (!delta) return;
  var cosRadius = cos(radius), sinRadius = sin(radius), step = direction * delta;
  if (t0 == null) {
    t0 = radius + direction * tau;
    t1 = radius - step / 2;
  } else {
    t0 = circleRadius(cosRadius, t0);
    t1 = circleRadius(cosRadius, t1);
    if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
  }
  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
    point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
    stream.point(point[0], point[1]);
  }
}
function circleRadius(cosRadius, point) {
  point = cartesian(point), point[0] -= cosRadius;
  cartesianNormalizeInPlace(point);
  var radius = acos(-point[1]);
  return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
}
function buffer_default() {
  var lines = [], line;
  return {
    point: function(x, y, m) {
      line.push([x, y, m]);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop,
    rejoin: function() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}
function pointEqual_default(a, b) {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
}
function Intersection(point, points, other, entry) {
  this.x = point;
  this.z = points;
  this.o = other;
  this.e = entry;
  this.v = false;
  this.n = this.p = null;
}
function rejoin_default(segments, compareIntersection2, startInside, interpolate, stream) {
  var subject = [], clip = [], i, n;
  segments.forEach(function(segment) {
    if ((n2 = segment.length - 1) <= 0) return;
    var n2, p0 = segment[0], p1 = segment[n2], x;
    if (pointEqual_default(p0, p1)) {
      if (!p0[2] && !p1[2]) {
        stream.lineStart();
        for (i = 0; i < n2; ++i) stream.point((p0 = segment[i])[0], p0[1]);
        stream.lineEnd();
        return;
      }
      p1[0] += 2 * epsilon;
    }
    subject.push(x = new Intersection(p0, segment, null, true));
    clip.push(x.o = new Intersection(p0, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip.push(x.o = new Intersection(p1, null, x, true));
  });
  if (!subject.length) return;
  clip.sort(compareIntersection2);
  link(subject);
  link(clip);
  for (i = 0, n = clip.length; i < n; ++i) {
    clip[i].e = startInside = !startInside;
  }
  var start = subject[0], points, point;
  while (1) {
    var current = start, isSubject = true;
    while (current.v) if ((current = current.n) === start) return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
}
function link(array) {
  if (!(n = array.length)) return;
  var n, i = 0, a = array[0], b;
  while (++i < n) {
    a.n = b = array[i];
    b.p = a;
    a = b;
  }
  a.n = b = array[0];
  b.p = a;
}
function longitude(point) {
  return abs(point[0]) <= pi ? point[0] : sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
}
function polygonContains_default(polygon, point) {
  var lambda = longitude(point), phi = point[1], sinPhi = sin(phi), normal = [sin(lambda), -cos(lambda), 0], angle = 0, winding = 0;
  var sum = new Adder();
  if (sinPhi === 1) phi = halfPi + epsilon;
  else if (sinPhi === -1) phi = -halfPi - epsilon;
  for (var i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length)) continue;
    var ring, m, point0 = ring[m - 1], lambda0 = longitude(point0), phi0 = point0[1] / 2 + quarterPi, sinPhi0 = sin(phi0), cosPhi0 = cos(phi0);
    for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
      var point1 = ring[j], lambda1 = longitude(point1), phi1 = point1[1] / 2 + quarterPi, sinPhi1 = sin(phi1), cosPhi1 = cos(phi1), delta = lambda1 - lambda0, sign3 = delta >= 0 ? 1 : -1, absDelta = sign3 * delta, antimeridian = absDelta > pi, k = sinPhi0 * sinPhi1;
      sum.add(atan2(k * sign3 * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
      angle += antimeridian ? delta + sign3 * tau : delta;
      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
        var arc = cartesianCross(cartesian(point0), cartesian(point1));
        cartesianNormalizeInPlace(arc);
        var intersection = cartesianCross(normal, arc);
        cartesianNormalizeInPlace(intersection);
        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }
  return (angle < -epsilon || angle < epsilon && sum < -epsilon2) ^ winding & 1;
}
function clip_default(pointVisible, clipLine, interpolate, start) {
  return function(sink) {
    var line = clipLine(sink), ringBuffer = buffer_default(), ringSink = clipLine(ringBuffer), polygonStarted = false, polygon, segments, ring;
    var clip = {
      point,
      lineStart,
      lineEnd,
      polygonStart: function() {
        clip.point = pointRing;
        clip.lineStart = ringStart;
        clip.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip.point = point;
        clip.lineStart = lineStart;
        clip.lineEnd = lineEnd;
        segments = merge(segments);
        var startInside = polygonContains_default(polygon, start);
        if (segments.length) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          rejoin_default(segments, compareIntersection, startInside, interpolate, sink);
        } else if (startInside) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
        }
        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
        segments = polygon = null;
      },
      sphere: function() {
        sink.polygonStart();
        sink.lineStart();
        interpolate(null, null, 1, sink);
        sink.lineEnd();
        sink.polygonEnd();
      }
    };
    function point(lambda, phi) {
      if (pointVisible(lambda, phi)) sink.point(lambda, phi);
    }
    function pointLine(lambda, phi) {
      line.point(lambda, phi);
    }
    function lineStart() {
      clip.point = pointLine;
      line.lineStart();
    }
    function lineEnd() {
      clip.point = point;
      line.lineEnd();
    }
    function pointRing(lambda, phi) {
      ring.push([lambda, phi]);
      ringSink.point(lambda, phi);
    }
    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }
    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringSink.lineEnd();
      var clean = ringSink.clean(), ringSegments = ringBuffer.result(), i, n = ringSegments.length, m, segment, point2;
      ring.pop();
      polygon.push(ring);
      ring = null;
      if (!n) return;
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (i = 0; i < m; ++i) sink.point((point2 = segment[i])[0], point2[1]);
          sink.lineEnd();
        }
        return;
      }
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
      segments.push(ringSegments.filter(validSegment));
    }
    return clip;
  };
}
function validSegment(segment) {
  return segment.length > 1;
}
function compareIntersection(a, b) {
  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
}
var antimeridian_default = clip_default(
  function() {
    return true;
  },
  clipAntimeridianLine,
  clipAntimeridianInterpolate,
  [-pi, -halfPi]
);
function clipAntimeridianLine(stream) {
  var lambda0 = NaN, phi0 = NaN, sign0 = NaN, clean;
  return {
    lineStart: function() {
      stream.lineStart();
      clean = 1;
    },
    point: function(lambda1, phi1) {
      var sign1 = lambda1 > 0 ? pi : -pi, delta = abs(lambda1 - lambda0);
      if (abs(delta - pi) < epsilon) {
        stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        stream.point(lambda1, phi0);
        clean = 0;
      } else if (sign0 !== sign1 && delta >= pi) {
        if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon;
        if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
        phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        clean = 0;
      }
      stream.point(lambda0 = lambda1, phi0 = phi1);
      sign0 = sign1;
    },
    lineEnd: function() {
      stream.lineEnd();
      lambda0 = phi0 = NaN;
    },
    clean: function() {
      return 2 - clean;
    }
  };
}
function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
  var cosPhi0, cosPhi1, sinLambda0Lambda1 = sin(lambda0 - lambda1);
  return abs(sinLambda0Lambda1) > epsilon ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1) - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0)) / (cosPhi0 * cosPhi1 * sinLambda0Lambda1)) : (phi0 + phi1) / 2;
}
function clipAntimeridianInterpolate(from, to, direction, stream) {
  var phi;
  if (from == null) {
    phi = direction * halfPi;
    stream.point(-pi, phi);
    stream.point(0, phi);
    stream.point(pi, phi);
    stream.point(pi, 0);
    stream.point(pi, -phi);
    stream.point(0, -phi);
    stream.point(-pi, -phi);
    stream.point(-pi, 0);
    stream.point(-pi, phi);
  } else if (abs(from[0] - to[0]) > epsilon) {
    var lambda = from[0] < to[0] ? pi : -pi;
    phi = direction * lambda / 2;
    stream.point(-lambda, phi);
    stream.point(0, phi);
    stream.point(lambda, phi);
  } else {
    stream.point(to[0], to[1]);
  }
}
function circle_default2(radius) {
  var cr = cos(radius), delta = 2 * radians, smallRadius = cr > 0, notHemisphere = abs(cr) > epsilon;
  function interpolate(from, to, direction, stream) {
    circleStream(stream, radius, delta, direction, from, to);
  }
  function visible(lambda, phi) {
    return cos(lambda) * cos(phi) > cr;
  }
  function clipLine(stream) {
    var point0, c0, v0, v00, clean;
    return {
      lineStart: function() {
        v00 = v0 = false;
        clean = 1;
      },
      point: function(lambda, phi) {
        var point1 = [lambda, phi], point2, v = visible(lambda, phi), c = smallRadius ? v ? 0 : code(lambda, phi) : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
        if (!point0 && (v00 = v0 = v)) stream.lineStart();
        if (v !== v0) {
          point2 = intersect(point0, point1);
          if (!point2 || pointEqual_default(point0, point2) || pointEqual_default(point1, point2))
            point1[2] = 1;
        }
        if (v !== v0) {
          clean = 0;
          if (v) {
            stream.lineStart();
            point2 = intersect(point1, point0);
            stream.point(point2[0], point2[1]);
          } else {
            point2 = intersect(point0, point1);
            stream.point(point2[0], point2[1], 2);
            stream.lineEnd();
          }
          point0 = point2;
        } else if (notHemisphere && point0 && smallRadius ^ v) {
          var t;
          if (!(c & c0) && (t = intersect(point1, point0, true))) {
            clean = 0;
            if (smallRadius) {
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
            } else {
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
              stream.lineStart();
              stream.point(t[0][0], t[0][1], 3);
            }
          }
        }
        if (v && (!point0 || !pointEqual_default(point0, point1))) {
          stream.point(point1[0], point1[1]);
        }
        point0 = point1, v0 = v, c0 = c;
      },
      lineEnd: function() {
        if (v0) stream.lineEnd();
        point0 = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return clean | (v00 && v0) << 1;
      }
    };
  }
  function intersect(a, b, two) {
    var pa = cartesian(a), pb = cartesian(b);
    var n1 = [1, 0, 0], n2 = cartesianCross(pa, pb), n2n2 = cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
    if (!determinant) return !two && a;
    var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = cartesianCross(n1, n2), A = cartesianScale(n1, c1), B = cartesianScale(n2, c2);
    cartesianAddInPlace(A, B);
    var u = n1xn2, w = cartesianDot(A, u), uu = cartesianDot(u, u), t2 = w * w - uu * (cartesianDot(A, A) - 1);
    if (t2 < 0) return;
    var t = sqrt(t2), q = cartesianScale(u, (-w - t) / uu);
    cartesianAddInPlace(q, A);
    q = spherical(q);
    if (!two) return q;
    var lambda0 = a[0], lambda1 = b[0], phi0 = a[1], phi1 = b[1], z;
    if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;
    var delta2 = lambda1 - lambda0, polar = abs(delta2 - pi) < epsilon, meridian = polar || delta2 < epsilon;
    if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;
    if (meridian ? polar ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1) : phi0 <= q[1] && q[1] <= phi1 : delta2 > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
      var q1 = cartesianScale(u, (-w + t) / uu);
      cartesianAddInPlace(q1, A);
      return [q, spherical(q1)];
    }
  }
  function code(lambda, phi) {
    var r = smallRadius ? radius : pi - radius, code2 = 0;
    if (lambda < -r) code2 |= 1;
    else if (lambda > r) code2 |= 2;
    if (phi < -r) code2 |= 4;
    else if (phi > r) code2 |= 8;
    return code2;
  }
  return clip_default(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
}
function line_default(a, b, x052, y052, x122, y122) {
  var ax = a[0], ay = a[1], bx = b[0], by = b[1], t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
  r = x052 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }
  r = x122 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }
  r = y052 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }
  r = y122 - ay;
  if (!dy && r < 0) return;
  r /= dy;
  if (dy < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dy > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }
  if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
  if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
  return true;
}
var clipMax = 1e9;
var clipMin = -clipMax;
function clipRectangle(x052, y052, x122, y122) {
  function visible(x, y) {
    return x052 <= x && x <= x122 && y052 <= y && y <= y122;
  }
  function interpolate(from, to, direction, stream) {
    var a = 0, a1 = 0;
    if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
      do
        stream.point(a === 0 || a === 3 ? x052 : x122, a > 1 ? y122 : y052);
      while ((a = (a + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }
  function corner(p, direction) {
    return abs(p[0] - x052) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x122) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y052) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
  }
  function compareIntersection2(a, b) {
    return comparePoint(a.x, b.x);
  }
  function comparePoint(a, b) {
    var ca = corner(a, 1), cb = corner(b, 1);
    return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
  }
  return function(stream) {
    var activeStream = stream, bufferStream = buffer_default(), segments, polygon, ring, x__, y__, v__, x_, y_, v_, first, clean;
    var clipStream = {
      point,
      lineStart,
      lineEnd,
      polygonStart,
      polygonEnd
    };
    function point(x, y) {
      if (visible(x, y)) activeStream.point(x, y);
    }
    function polygonInside() {
      var winding = 0;
      for (var i = 0, n = polygon.length; i < n; ++i) {
        for (var ring2 = polygon[i], j = 1, m = ring2.length, point2 = ring2[0], a0, a1, b0 = point2[0], b1 = point2[1]; j < m; ++j) {
          a0 = b0, a1 = b1, point2 = ring2[j], b0 = point2[0], b1 = point2[1];
          if (a1 <= y122) {
            if (b1 > y122 && (b0 - a0) * (y122 - a1) > (b1 - a1) * (x052 - a0)) ++winding;
          } else {
            if (b1 <= y122 && (b0 - a0) * (y122 - a1) < (b1 - a1) * (x052 - a0)) --winding;
          }
        }
      }
      return winding;
    }
    function polygonStart() {
      activeStream = bufferStream, segments = [], polygon = [], clean = true;
    }
    function polygonEnd() {
      var startInside = polygonInside(), cleanInside = clean && startInside, visible2 = (segments = merge(segments)).length;
      if (cleanInside || visible2) {
        stream.polygonStart();
        if (cleanInside) {
          stream.lineStart();
          interpolate(null, null, 1, stream);
          stream.lineEnd();
        }
        if (visible2) {
          rejoin_default(segments, compareIntersection2, startInside, interpolate, stream);
        }
        stream.polygonEnd();
      }
      activeStream = stream, segments = polygon = ring = null;
    }
    function lineStart() {
      clipStream.point = linePoint;
      if (polygon) polygon.push(ring = []);
      first = true;
      v_ = false;
      x_ = y_ = NaN;
    }
    function lineEnd() {
      if (segments) {
        linePoint(x__, y__);
        if (v__ && v_) bufferStream.rejoin();
        segments.push(bufferStream.result());
      }
      clipStream.point = point;
      if (v_) activeStream.lineEnd();
    }
    function linePoint(x, y) {
      var v = visible(x, y);
      if (polygon) ring.push([x, y]);
      if (first) {
        x__ = x, y__ = y, v__ = v;
        first = false;
        if (v) {
          activeStream.lineStart();
          activeStream.point(x, y);
        }
      } else {
        if (v && v_) activeStream.point(x, y);
        else {
          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))], b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
          if (line_default(a, b, x052, y052, x122, y122)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a[0], a[1]);
            }
            activeStream.point(b[0], b[1]);
            if (!v) activeStream.lineEnd();
            clean = false;
          } else if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
            clean = false;
          }
        }
      }
      x_ = x, y_ = y, v_ = v;
    }
    return clipStream;
  };
}
var identity_default = (x) => x;
var areaSum = new Adder();
var areaRingSum = new Adder();
var x02 = Infinity;
var y02 = x02;
var x1 = -x02;
var y1 = x1;
var boundsStream = {
  point: boundsPoint,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop,
  result: function() {
    var bounds = [[x02, y02], [x1, y1]];
    x1 = y1 = -(y02 = x02 = Infinity);
    return bounds;
  }
};
function boundsPoint(x, y) {
  if (x < x02) x02 = x;
  if (x > x1) x1 = x;
  if (y < y02) y02 = y;
  if (y > y1) y1 = y;
}
var bounds_default = boundsStream;
function PathContext(context) {
  this._context = context;
}
PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._context.closePath();
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau);
        break;
      }
    }
  },
  result: noop
};
var lengthSum = new Adder();
function transformer(methods) {
  return function(stream) {
    var s = new TransformStream();
    for (var key in methods) s[key] = methods[key];
    s.stream = stream;
    return s;
  };
}
function TransformStream() {
}
TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x, y) {
    this.stream.point(x, y);
  },
  sphere: function() {
    this.stream.sphere();
  },
  lineStart: function() {
    this.stream.lineStart();
  },
  lineEnd: function() {
    this.stream.lineEnd();
  },
  polygonStart: function() {
    this.stream.polygonStart();
  },
  polygonEnd: function() {
    this.stream.polygonEnd();
  }
};
function fit(projection2, fitBounds, object) {
  var clip = projection2.clipExtent && projection2.clipExtent();
  projection2.scale(150).translate([0, 0]);
  if (clip != null) projection2.clipExtent(null);
  stream_default(object, projection2.stream(bounds_default));
  fitBounds(bounds_default.result());
  if (clip != null) projection2.clipExtent(clip);
  return projection2;
}
function fitExtent(projection2, extent, object) {
  return fit(projection2, function(b) {
    var w = extent[1][0] - extent[0][0], h = extent[1][1] - extent[0][1], k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2, y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k).translate([x, y]);
  }, object);
}
function fitSize(projection2, size, object) {
  return fitExtent(projection2, [[0, 0], size], object);
}
function fitWidth(projection2, width, object) {
  return fit(projection2, function(b) {
    var w = +width, k = w / (b[1][0] - b[0][0]), x = (w - k * (b[1][0] + b[0][0])) / 2, y = -k * b[0][1];
    projection2.scale(150 * k).translate([x, y]);
  }, object);
}
function fitHeight(projection2, height, object) {
  return fit(projection2, function(b) {
    var h = +height, k = h / (b[1][1] - b[0][1]), x = -k * b[0][0], y = (h - k * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k).translate([x, y]);
  }, object);
}
var maxDepth = 16;
var cosMinDistance = cos(30 * radians);
function resample_default(project, delta2) {
  return +delta2 ? resample(project, delta2) : resampleNone(project);
}
function resampleNone(project) {
  return transformer({
    point: function(x, y) {
      x = project(x, y);
      this.stream.point(x[0], x[1]);
    }
  });
}
function resample(project, delta2) {
  function resampleLineTo(x052, y052, lambda0, a0, b0, c0, x122, y122, lambda1, a1, b1, c1, depth, stream) {
    var dx = x122 - x052, dy = y122 - y052, d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = sqrt(a * a + b * b + c * c), phi2 = asin(c /= m), lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a), p = project(lambda2, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x052, dy2 = y2 - y052, dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
        resampleLineTo(x052, y052, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda2, a, b, c, x122, y122, lambda1, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda00, x004, y004, a00, b00, c00, lambda0, x052, y052, a0, b0, c0;
    var resampleStream = {
      point,
      lineStart,
      lineEnd,
      polygonStart: function() {
        stream.polygonStart();
        resampleStream.lineStart = ringStart;
      },
      polygonEnd: function() {
        stream.polygonEnd();
        resampleStream.lineStart = lineStart;
      }
    };
    function point(x, y) {
      x = project(x, y);
      stream.point(x[0], x[1]);
    }
    function lineStart() {
      x052 = NaN;
      resampleStream.point = linePoint;
      stream.lineStart();
    }
    function linePoint(lambda, phi) {
      var c = cartesian([lambda, phi]), p = project(lambda, phi);
      resampleLineTo(x052, y052, lambda0, a0, b0, c0, x052 = p[0], y052 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
      stream.point(x052, y052);
    }
    function lineEnd() {
      resampleStream.point = point;
      stream.lineEnd();
    }
    function ringStart() {
      lineStart();
      resampleStream.point = ringPoint;
      resampleStream.lineEnd = ringEnd;
    }
    function ringPoint(lambda, phi) {
      linePoint(lambda00 = lambda, phi), x004 = x052, y004 = y052, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint;
    }
    function ringEnd() {
      resampleLineTo(x052, y052, lambda0, a0, b0, c0, x004, y004, lambda00, a00, b00, c00, maxDepth, stream);
      resampleStream.lineEnd = lineEnd;
      lineEnd();
    }
    return resampleStream;
  };
}
var transformRadians = transformer({
  point: function(x, y) {
    this.stream.point(x * radians, y * radians);
  }
});
function transformRotate(rotate) {
  return transformer({
    point: function(x, y) {
      var r = rotate(x, y);
      return this.stream.point(r[0], r[1]);
    }
  });
}
function scaleTranslate(k, dx, dy, sx, sy) {
  function transform(x, y) {
    x *= sx;
    y *= sy;
    return [dx + k * x, dy - k * y];
  }
  transform.invert = function(x, y) {
    return [(x - dx) / k * sx, (dy - y) / k * sy];
  };
  return transform;
}
function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
  if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
  var cosAlpha = cos(alpha), sinAlpha = sin(alpha), a = cosAlpha * k, b = sinAlpha * k, ai = cosAlpha / k, bi = sinAlpha / k, ci = (sinAlpha * dy - cosAlpha * dx) / k, fi = (sinAlpha * dx + cosAlpha * dy) / k;
  function transform(x, y) {
    x *= sx;
    y *= sy;
    return [a * x - b * y + dx, dy - b * x - a * y];
  }
  transform.invert = function(x, y) {
    return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
  };
  return transform;
}
function projection(project) {
  return projectionMutator(function() {
    return project;
  })();
}
function projectionMutator(projectAt) {
  var project, k = 150, x = 480, y = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = antimeridian_default, x052 = null, y052, x122, y122, postclip = identity_default, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache, cacheStream;
  function projection2(point) {
    return projectRotateTransform(point[0] * radians, point[1] * radians);
  }
  function invert(point) {
    point = projectRotateTransform.invert(point[0], point[1]);
    return point && [point[0] * degrees, point[1] * degrees];
  }
  projection2.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
  };
  projection2.preclip = function(_) {
    return arguments.length ? (preclip = _, theta = void 0, reset()) : preclip;
  };
  projection2.postclip = function(_) {
    return arguments.length ? (postclip = _, x052 = y052 = x122 = y122 = null, reset()) : postclip;
  };
  projection2.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? circle_default2(theta = _ * radians) : (theta = null, antimeridian_default), reset()) : theta * degrees;
  };
  projection2.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x052 = y052 = x122 = y122 = null, identity_default) : clipRectangle(x052 = +_[0][0], y052 = +_[0][1], x122 = +_[1][0], y122 = +_[1][1]), reset()) : x052 == null ? null : [[x052, y052], [x122, y122]];
  };
  projection2.scale = function(_) {
    return arguments.length ? (k = +_, recenter()) : k;
  };
  projection2.translate = function(_) {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
  };
  projection2.center = function(_) {
    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
  };
  projection2.rotate = function(_) {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
  };
  projection2.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
  };
  projection2.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
  };
  projection2.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
  };
  projection2.precision = function(_) {
    return arguments.length ? (projectResample = resample_default(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
  };
  projection2.fitExtent = function(extent, object) {
    return fitExtent(projection2, extent, object);
  };
  projection2.fitSize = function(size, object) {
    return fitSize(projection2, size, object);
  };
  projection2.fitWidth = function(width, object) {
    return fitWidth(projection2, width, object);
  };
  projection2.fitHeight = function(height, object) {
    return fitHeight(projection2, height, object);
  };
  function recenter() {
    var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)), transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
    rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
    projectTransform = compose_default(project, transform);
    projectRotateTransform = compose_default(rotate, projectTransform);
    projectResample = resample_default(projectTransform, delta2);
    return reset();
  }
  function reset() {
    cache = cacheStream = null;
    return projection2;
  }
  return function() {
    project = projectAt.apply(this, arguments);
    projection2.invert = project.invert && invert;
    return recenter();
  };
}
function conicProjection(projectAt) {
  var phi0 = 0, phi1 = pi / 3, m = projectionMutator(projectAt), p = m(phi0, phi1);
  p.parallels = function(_) {
    return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
  };
  return p;
}
function cylindricalEqualAreaRaw(phi0) {
  var cosPhi0 = cos(phi0);
  function forward(lambda, phi) {
    return [lambda * cosPhi0, sin(phi) / cosPhi0];
  }
  forward.invert = function(x, y) {
    return [x / cosPhi0, asin(y * cosPhi0)];
  };
  return forward;
}
function conicEqualAreaRaw(y052, y122) {
  var sy0 = sin(y052), n = (sy0 + sin(y122)) / 2;
  if (abs(n) < epsilon) return cylindricalEqualAreaRaw(y052);
  var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n;
  function project(x, y) {
    var r = sqrt(c - 2 * n * sin(y)) / n;
    return [r * sin(x *= n), r0 - r * cos(x)];
  }
  project.invert = function(x, y) {
    var r0y = r0 - y, l = atan2(x, abs(r0y)) * sign(r0y);
    if (r0y * n < 0)
      l -= pi * sign(x) * sign(r0y);
    return [l / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
  };
  return project;
}
function conicEqualArea_default() {
  return conicProjection(conicEqualAreaRaw).scale(155.424).center([0, 33.6442]);
}
function azimuthalRaw(scale) {
  return function(x, y) {
    var cx = cos(x), cy = cos(y), k = scale(cx * cy);
    if (k === Infinity) return [2, 0];
    return [
      k * cy * sin(x),
      k * sin(y)
    ];
  };
}
function azimuthalInvert(angle) {
  return function(x, y) {
    var z = sqrt(x * x + y * y), c = angle(z), sc = sin(c), cc = cos(c);
    return [
      atan2(x * sc, z * cc),
      asin(z && y * sc / z)
    ];
  };
}
var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
  return sqrt(2 / (1 + cxcy));
});
azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
  return 2 * asin(z / 2);
});
function azimuthalEqualArea_default() {
  return projection(azimuthalEqualAreaRaw).scale(124.75).clipAngle(180 - 1e-3);
}
var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
  return (c = acos(c)) && c / sin(c);
});
azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
  return z;
});
function azimuthalEquidistant_default() {
  return projection(azimuthalEquidistantRaw).scale(79.4188).clipAngle(180 - 1e-3);
}
function mercatorRaw(lambda, phi) {
  return [lambda, log(tan((halfPi + phi) / 2))];
}
mercatorRaw.invert = function(x, y) {
  return [x, 2 * atan(exp(y)) - halfPi];
};
function mercator_default() {
  return mercatorProjection(mercatorRaw).scale(961 / tau);
}
function mercatorProjection(project) {
  var m = projection(project), center = m.center, scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, x052 = null, y052, x122, y122;
  m.scale = function(_) {
    return arguments.length ? (scale(_), reclip()) : scale();
  };
  m.translate = function(_) {
    return arguments.length ? (translate(_), reclip()) : translate();
  };
  m.center = function(_) {
    return arguments.length ? (center(_), reclip()) : center();
  };
  m.clipExtent = function(_) {
    return arguments.length ? (_ == null ? x052 = y052 = x122 = y122 = null : (x052 = +_[0][0], y052 = +_[0][1], x122 = +_[1][0], y122 = +_[1][1]), reclip()) : x052 == null ? null : [[x052, y052], [x122, y122]];
  };
  function reclip() {
    var k = pi * scale(), t = m(rotation_default(m.rotate()).invert([0, 0]));
    return clipExtent(x052 == null ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw ? [[Math.max(t[0] - k, x052), y052], [Math.min(t[0] + k, x122), y122]] : [[x052, Math.max(t[1] - k, y052)], [x122, Math.min(t[1] + k, y122)]]);
  }
  return reclip();
}
function tany(y) {
  return tan((halfPi + y) / 2);
}
function conicConformalRaw(y052, y122) {
  var cy0 = cos(y052), n = y052 === y122 ? sin(y052) : log(cy0 / cos(y122)) / log(tany(y122) / tany(y052)), f = cy0 * pow(tany(y052), n) / n;
  if (!n) return mercatorRaw;
  function project(x, y) {
    if (f > 0) {
      if (y < -halfPi + epsilon) y = -halfPi + epsilon;
    } else {
      if (y > halfPi - epsilon) y = halfPi - epsilon;
    }
    var r = f / pow(tany(y), n);
    return [r * sin(n * x), f - r * cos(n * x)];
  }
  project.invert = function(x, y) {
    var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy), l = atan2(x, abs(fy)) * sign(fy);
    if (fy * n < 0)
      l -= pi * sign(x) * sign(fy);
    return [l / n, 2 * atan(pow(f / r, 1 / n)) - halfPi];
  };
  return project;
}
function conicConformal_default() {
  return conicProjection(conicConformalRaw).scale(109.5).parallels([30, 30]);
}
function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}
equirectangularRaw.invert = equirectangularRaw;
function equirectangular_default() {
  return projection(equirectangularRaw).scale(152.63);
}
function stereographicRaw(x, y) {
  var cy = cos(y), k = 1 + cos(x) * cy;
  return [cy * sin(x) / k, sin(y) / k];
}
stereographicRaw.invert = azimuthalInvert(function(z) {
  return 2 * atan(z);
});
function stereographic_default() {
  return projection(stereographicRaw).scale(250).clipAngle(142);
}
function transverseMercatorRaw(lambda, phi) {
  return [log(tan((halfPi + phi) / 2)), -lambda];
}
transverseMercatorRaw.invert = function(x, y) {
  return [-y, 2 * atan(exp(x)) - halfPi];
};
function transverseMercator_default() {
  var m = mercatorProjection(transverseMercatorRaw), center = m.center, rotate = m.rotate;
  m.center = function(_) {
    return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
  };
  m.rotate = function(_) {
    return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
  };
  return rotate([0, 0, 90]).scale(159.155);
}
var abs2 = Math.abs;
var cos2 = Math.cos;
var floor = Math.floor;
var max = Math.max;
var min = Math.min;
var sign2 = Math.sign || function(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};
var sin2 = Math.sin;
var epsilon3 = 1e-6;
var epsilon22 = 1e-12;
var pi2 = Math.PI;
var halfPi2 = pi2 / 2;
var quarterPi2 = pi2 / 4;
var sqrt2 = sqrt3(2);
var sqrtPi = sqrt3(pi2);
var tau2 = pi2 * 2;
var degrees2 = 180 / pi2;
var radians2 = pi2 / 180;
function sinci(x) {
  return x ? x / Math.sin(x) : 1;
}
function asin2(x) {
  return x > 1 ? halfPi2 : x < -1 ? -halfPi2 : Math.asin(x);
}
function acos2(x) {
  return x > 1 ? 0 : x < -1 ? pi2 : Math.acos(x);
}
function sqrt3(x) {
  return x > 0 ? Math.sqrt(x) : 0;
}
function aitoffRaw(x, y) {
  var cosy = cos2(y), sincia = sinci(acos2(cosy * cos2(x /= 2)));
  return [2 * cosy * sin2(x) * sincia, sin2(y) * sincia];
}
aitoffRaw.invert = function(x, y) {
  if (x * x + 4 * y * y > pi2 * pi2 + epsilon3) return;
  var x122 = x, y122 = y, i = 25;
  do {
    var sinx = sin2(x122), sinx_2 = sin2(x122 / 2), cosx_2 = cos2(x122 / 2), siny = sin2(y122), cosy = cos2(y122), sin_2y = sin2(2 * y122), sin2y = siny * siny, cos2y = cosy * cosy, sin2x_2 = sinx_2 * sinx_2, c = 1 - cos2y * cosx_2 * cosx_2, e = c ? acos2(cosy * cosx_2) * sqrt3(f = 1 / c) : f = 0, f, fx = 2 * e * cosy * sinx_2 - x, fy = e * siny - y, dxdx = f * (cos2y * sin2x_2 + e * cosy * cosx_2 * sin2y), dxdy = f * (0.5 * sinx * sin_2y - e * 2 * siny * sinx_2), dydx = f * 0.25 * (sin_2y * sinx_2 - e * siny * cos2y * sinx), dydy = f * (sin2y * cosx_2 + e * sin2x_2 * cosy), z = dxdy * dydx - dydy * dxdx;
    if (!z) break;
    var dx = (fy * dxdy - fx * dydy) / z, dy = (fx * dydx - fy * dxdx) / z;
    x122 -= dx, y122 -= dy;
  } while ((abs2(dx) > epsilon3 || abs2(dy) > epsilon3) && --i > 0);
  return [x122, y122];
};
function mollweideBromleyTheta(cp, phi) {
  var cpsinPhi = cp * sin2(phi), i = 30, delta;
  do
    phi -= delta = (phi + sin2(phi) - cpsinPhi) / (1 + cos2(phi));
  while (abs2(delta) > epsilon3 && --i > 0);
  return phi / 2;
}
function mollweideBromleyRaw(cx, cy, cp) {
  function forward(lambda, phi) {
    return [cx * lambda * cos2(phi = mollweideBromleyTheta(cp, phi)), cy * sin2(phi)];
  }
  forward.invert = function(x, y) {
    return y = asin2(y / cy), [x / (cx * cos2(y)), asin2((2 * y + sin2(2 * y)) / cp)];
  };
  return forward;
}
var mollweideRaw = mollweideBromleyRaw(sqrt2 / halfPi2, sqrt2, pi2);
function mollweide_default() {
  return projection(mollweideRaw).scale(169.529);
}
function parallel1_default(projectAt) {
  var phi0 = 0, m = projectionMutator(projectAt), p = m(phi0);
  p.parallel = function(_) {
    return arguments.length ? m(phi0 = _ * radians2) : phi0 * degrees2;
  };
  return p;
}
function cylindricalEqualAreaRaw2(phi0) {
  var cosPhi0 = cos2(phi0);
  function forward(lambda, phi) {
    return [lambda * cosPhi0, sin2(phi) / cosPhi0];
  }
  forward.invert = function(x, y) {
    return [x / cosPhi0, asin2(y * cosPhi0)];
  };
  return forward;
}
function cylindricalEqualArea_default() {
  return parallel1_default(cylindricalEqualAreaRaw2).parallel(38.58).scale(195.044);
}
var K = [
  [0.9986, -0.062],
  [1, 0],
  [0.9986, 0.062],
  [0.9954, 0.124],
  [0.99, 0.186],
  [0.9822, 0.248],
  [0.973, 0.31],
  [0.96, 0.372],
  [0.9427, 0.434],
  [0.9216, 0.4958],
  [0.8962, 0.5571],
  [0.8679, 0.6176],
  [0.835, 0.6769],
  [0.7986, 0.7346],
  [0.7597, 0.7903],
  [0.7186, 0.8435],
  [0.6732, 0.8936],
  [0.6213, 0.9394],
  [0.5722, 0.9761],
  [0.5322, 1]
];
K.forEach(function(d) {
  d[1] *= 1.593415793900743;
});
function robinsonRaw(lambda, phi) {
  var i = min(18, abs2(phi) * 36 / pi2), i0 = floor(i), di = i - i0, ax = (k = K[i0])[0], ay = k[1], bx = (k = K[++i0])[0], by = k[1], cx = (k = K[min(19, ++i0)])[0], cy = k[1], k;
  return [
    lambda * (bx + di * (cx - ax) / 2 + di * di * (cx - 2 * bx + ax) / 2),
    sign2(phi) * (by + di * (cy - ay) / 2 + di * di * (cy - 2 * by + ay) / 2)
  ];
}
robinsonRaw.invert = function(x, y) {
  var phi = y * 90, i = min(18, abs2(phi / 5)), i0 = max(0, floor(i));
  do {
    var ay = K[i0][1], by = K[i0 + 1][1], cy = K[min(19, i0 + 2)][1], u = cy - ay, v = cy - 2 * by + ay, t = 2 * (abs2(y) - by) / u, c = v / u, di = t * (1 - c * t * (1 - 2 * c * t));
    if (di >= 0 || i0 === 1) {
      phi = (y >= 0 ? 5 : -5) * (di + i);
      var j = 50, delta;
      do {
        i = min(18, abs2(phi) / 5);
        i0 = floor(i);
        di = i - i0;
        ay = K[i0][1];
        by = K[i0 + 1][1];
        cy = K[min(19, i0 + 2)][1];
        phi -= (delta = sign2(y) * (by + di * (cy - ay) / 2 + di * di * (cy - 2 * by + ay) / 2) - y) * degrees2;
      } while (abs2(delta) > epsilon22 && --j > 0);
      break;
    }
  } while (--i0 >= 0);
  var ax = K[i0][0], bx = K[i0 + 1][0], cx = K[min(19, i0 + 2)][0];
  return [
    x / (bx + di * (cx - ax) / 2 + di * di * (cx - 2 * bx + ax) / 2),
    phi * radians2
  ];
};
function robinson_default() {
  return projection(robinsonRaw).scale(152.63);
}
function winkel3Raw(lambda, phi) {
  var coordinates = aitoffRaw(lambda, phi);
  return [
    (coordinates[0] + lambda / halfPi2) / 2,
    (coordinates[1] + phi) / 2
  ];
}
winkel3Raw.invert = function(x, y) {
  var lambda = x, phi = y, i = 25;
  do {
    var cosphi = cos2(phi), sinphi = sin2(phi), sin_2phi = sin2(2 * phi), sin2phi = sinphi * sinphi, cos2phi = cosphi * cosphi, sinlambda = sin2(lambda), coslambda_2 = cos2(lambda / 2), sinlambda_2 = sin2(lambda / 2), sin2lambda_2 = sinlambda_2 * sinlambda_2, C = 1 - cos2phi * coslambda_2 * coslambda_2, E = C ? acos2(cosphi * coslambda_2) * sqrt3(F = 1 / C) : F = 0, F, fx = 0.5 * (2 * E * cosphi * sinlambda_2 + lambda / halfPi2) - x, fy = 0.5 * (E * sinphi + phi) - y, dxdlambda = 0.5 * F * (cos2phi * sin2lambda_2 + E * cosphi * coslambda_2 * sin2phi) + 0.5 / halfPi2, dxdphi = F * (sinlambda * sin_2phi / 4 - E * sinphi * sinlambda_2), dydlambda = 0.125 * F * (sin_2phi * sinlambda_2 - E * sinphi * cos2phi * sinlambda), dydphi = 0.5 * F * (sin2phi * coslambda_2 + E * sin2lambda_2 * cosphi) + 0.5, denominator = dxdphi * dydlambda - dydphi * dxdlambda, dlambda = (fy * dxdphi - fx * dydphi) / denominator, dphi = (fx * dydlambda - fy * dxdlambda) / denominator;
    lambda -= dlambda, phi -= dphi;
  } while ((abs2(dlambda) > epsilon3 || abs2(dphi) > epsilon3) && --i > 0);
  return [lambda, phi];
};
function winkel3_default() {
  return projection(winkel3Raw).scale(158.837);
}
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
function extentPolygon(e) {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [e.minLon, e.minLat],
          [e.minLon, e.maxLat],
          [e.maxLon, e.maxLat],
          [e.maxLon, e.minLat],
          [e.minLon, e.minLat]
        ]
      ]
    }
  };
}
function isWorldExtent(e) {
  return e.maxLon - e.minLon >= 330 && e.maxLat - e.minLat >= 100;
}
function createProjection(info, extent, width, height) {
  const p = effectiveParams(info, extent);
  let proj;
  switch (info.id) {
    case "mercator":
      proj = mercator_default();
      break;
    case "transverse-mercator":
      proj = transverseMercator_default();
      break;
    case "lambert-conformal-conic":
      proj = conicConformal_default().parallels(p.standardParallels ?? [30, 60]);
      break;
    case "albers-equal-area-conic":
      proj = conicEqualArea_default().parallels(p.standardParallels ?? [25, 47]);
      break;
    case "azimuthal-equidistant":
      proj = azimuthalEquidistant_default();
      break;
    case "polar-stereographic":
      proj = stereographic_default();
      break;
    case "lambert-azimuthal-equal-area":
      proj = azimuthalEqualArea_default();
      break;
    case "gall-peters":
      proj = cylindricalEqualArea_default().parallel(45);
      break;
    case "robinson":
      proj = robinson_default();
      break;
    case "winkel-tripel":
      proj = winkel3_default();
      break;
    case "mollweide":
      proj = mollweide_default();
      break;
    case "equidistant-cylindrical":
    default:
      proj = equirectangular_default();
      break;
  }
  if (info.category === "azimuthal") {
    proj.rotate([-p.centralMeridian, -p.originLat]);
  } else {
    proj.rotate([-p.centralMeridian, 0]).center([0, p.originLat]);
  }
  const target = isWorldExtent(extent) ? info.category === "conic" ? extentPolygon({ minLon: -180, minLat: -60, maxLon: 180, maxLat: 80 }) : { type: "Sphere" } : extentPolygon(extent);
  proj.fitExtent(
    [
      [6, 6],
      [width - 6, height - 6]
    ],
    target
  );
  return proj;
}

// test-fixtures/presets.bundle.mjs
var REGION_PRESETS = [
  { id: "world", label: "\u4E16\u754C\u5168\u56FE", group: "\u5168\u7403", extent: { minLon: -180, minLat: -90, maxLon: 180, maxLat: 90 } },
  // 中国全图四至：帕米尔高原—黑乌汇合处、曾母暗沙—漠河（含南海诸岛）
  { id: "china", label: "\u4E2D\u56FD\u5168\u56FE\uFF08\u542B\u5357\u6D77\u8BF8\u5C9B\uFF09", group: "\u4E2D\u56FD", extent: { minLon: 73.5, minLat: 3.8, maxLon: 135.1, maxLat: 53.6 } },
  { id: "beijing", label: "\u5317\u4EAC\u5E02", group: "\u4E2D\u56FD", extent: { minLon: 115.4, minLat: 39.5, maxLon: 117.5, maxLat: 41.1 } },
  { id: "qinghai-tibet", label: "\u9752\u85CF\u9AD8\u539F", group: "\u4E2D\u56FD", extent: { minLon: 73.3, minLat: 26, maxLon: 104.8, maxLat: 39.8 } },
  { id: "europe", label: "\u6B27\u6D32", group: "\u5927\u6D32\u4E0E\u5178\u578B\u533A\u57DF", extent: { minLon: -9.5, minLat: 36, maxLon: 66, maxLat: 71 } },
  { id: "chile", label: "\u667A\u5229", group: "\u5927\u6D32\u4E0E\u5178\u578B\u533A\u57DF", extent: { minLon: -75.6, minLat: -56, maxLon: -66, maxLat: -17.5 } },
  { id: "arctic", label: "\u5317\u6781\u5730\u533A", group: "\u6781\u5730", extent: { minLon: -180, minLat: 66.5, maxLon: 180, maxLat: 90 } },
  { id: "antarctic", label: "\u5357\u6781\u5730\u533A", group: "\u6781\u5730", extent: { minLon: -180, minLat: -90, maxLon: 180, maxLat: -66.5 } }
];
function resolveExtent(presetId) {
  return REGION_PRESETS.find((p) => p.id === presetId)?.extent;
}
var PROJECTION_KB = [
  {
    id: "mercator",
    name: "Mercator",
    zhName: "\u58A8\u5361\u6258\u6295\u5F71",
    category: "cylindrical",
    property: "conformal",
    typicalParams: { standardParallels: [0] },
    suitableFor: "\u822A\u6D77\u56FE\u3001\u4F4E\u7EAC\u5EA6\u5730\u533A\u5BFC\u822A\u56FE\uFF1B\u7B49\u89D2\u822A\u7EBF\uFF08\u6052\u5411\u7EBF\uFF09\u5728\u56FE\u4E0A\u4E3A\u76F4\u7EBF",
    pros: ["\u7B49\u89D2\uFF0C\u5C40\u90E8\u5F62\u72B6\u4E0E\u65B9\u5411\u4FDD\u771F\uFF0C\u6052\u5411\u7EBF\u4E3A\u76F4\u7EBF\uFF0C\u6D77\u56FE\u6807\u51C6\u6295\u5F71"],
    cons: ["\u9AD8\u7EAC\u9762\u79EF\u4E25\u91CD\u5938\u5927\uFF08\u683C\u9675\u5170\u5931\u771F\uFF09\uFF0C\u4E0D\u9002\u5408\u5168\u7403\u9762\u79EF\u5BF9\u6BD4"],
    epsgHint: "EPSG:3395\uFF08World Mercator\uFF09\uFF1BWeb \u58A8\u5361\u6258\u53E6\u6709 EPSG:3857"
  },
  {
    id: "transverse-mercator",
    name: "Transverse Mercator / Gauss-Kr\xFCger",
    zhName: "\u6A2A\u8F74\u58A8\u5361\u6258 / \u9AD8\u65AF-\u514B\u5415\u683C\u6295\u5F71",
    category: "cylindrical",
    property: "conformal",
    suitableFor: "\u5927\u6BD4\u4F8B\u5C3A\u5730\u5F62\u56FE\uFF08\u6211\u56FD 1:1\u4E07~1:50\u4E07 \u91C7\u7528\uFF0C\u6309 6\xB0/3\xB0 \u5206\u5E26\uFF09\u3001\u5357\u5317\u72ED\u957F\u533A\u57DF",
    pros: ["\u5206\u5E26\u5185\u53D8\u5F62\u6781\u5C0F\uFF0C\u7B49\u89D2\u4FDD\u5F62\uFF0C\u662F\u6211\u56FD\u5927\u6BD4\u4F8B\u5C3A\u5730\u5F62\u56FE\u7684\u56FD\u5BB6\u6807\u51C6\u6295\u5F71"],
    cons: ["\u4E0D\u9002\u5408\u5927\u8303\u56F4\u6210\u56FE\uFF08\u9700\u5206\u5E26\uFF09\uFF0C\u4E1C\u897F\u8DE8\u5EA6\u5927\u65F6\u5E26\u8FB9\u7F18\u53D8\u5F62\u8FC5\u901F\u589E\u5927"],
    epsgHint: "\u6309\u5206\u5E26\u6CE8\u518C\uFF1ACGCS2000 \u9AD8\u65AF-\u514B\u5415\u683C 6\xB0\u5E26 EPSG:4491\u20134501\u30013\xB0\u5E26 EPSG:4513\u20134533\uFF08\u4EE5 EPSG \u6CE8\u518C\u8868\u4E3A\u51C6\uFF09"
  },
  {
    id: "lambert-conformal-conic",
    name: "Lambert Conformal Conic",
    zhName: "\u5170\u4F2F\u7279\u7B49\u89D2\u5706\u9525\u6295\u5F71",
    category: "conic",
    property: "conformal",
    suitableFor: "\u4E2D\u7EAC\u5EA6\u4E1C\u897F\u5EF6\u5C55\u533A\u57DF\u7684\u6C14\u8C61\u56FE\u3001\u822A\u7A7A\u56FE\uFF0C\u4FDD\u6301\u89D2\u5EA6\u4E0E\u5C40\u90E8\u5F62\u72B6",
    pros: ["\u7B49\u89D2\u4FDD\u5F62\u6001\uFF0C\u4E2D\u7EAC\u5EA6\u4E1C\u897F\u5411\u533A\u57DF\u53D8\u5F62\u5C0F\uFF0C\u6C14\u8C61/\u822A\u7A7A\u56FE\u6807\u51C6"],
    cons: ["\u9762\u79EF\u53D8\u5F62\u660E\u663E\uFF0C\u4E0D\u9002\u5408\u9762\u79EF\u654F\u611F\u7684\u7EDF\u8BA1\u4E13\u9898\u56FE"]
  },
  {
    id: "albers-equal-area-conic",
    name: "Albers Equal-Area Conic",
    zhName: "\u963F\u5C14\u4F2F\u65AF\u7B49\u79EF\u5706\u9525\u6295\u5F71",
    category: "conic",
    property: "equal-area",
    typicalParams: { centralMeridian: 105, standardParallels: [25, 47] },
    suitableFor: "\u4E2D\u7EAC\u5EA6\u7EDF\u8BA1\u4E13\u9898\u56FE\uFF1B\u4E2D\u56FD\u5168\u56FE\u60EF\u4F8B\u53C2\u6570\uFF1A\u53CC\u6807\u51C6\u7EAC\u7EBF 25\xB0N/47\xB0N\uFF0C\u4E2D\u592E\u7ECF\u7EBF 105\xB0E",
    pros: ["\u9762\u79EF\u4E25\u683C\u76F8\u7B49\uFF0C\u7EDF\u8BA1\u4E13\u9898\u56FE\u9996\u9009\uFF1B\u4E2D\u7EAC\u4E1C\u897F\u5411\u533A\u57DF\u6574\u4F53\u53D8\u5F62\u5C0F"],
    cons: ["\u89D2\u5EA6\u4E0E\u5F62\u72B6\u6709\u53D8\u5F62\uFF0C\u8FDC\u79BB\u6807\u51C6\u7EAC\u7EBF\u5904\u5F62\u72B6\u5931\u771F"]
  },
  {
    id: "azimuthal-equidistant",
    name: "Azimuthal Equidistant",
    zhName: "\u65B9\u4F4D\u7B49\u8DDD\u6295\u5F71",
    category: "azimuthal",
    property: "equidistant",
    suitableFor: "\u6781\u5730\u5730\u533A\u3001\u81EA\u4E2D\u5FC3\u70B9\u5411\u5916\u7684\u8DDD\u79BB\u4E0E\u65B9\u4F4D\u91CF\u7B97",
    pros: ["\u81EA\u6295\u5F71\u4E2D\u5FC3\u7684\u8DDD\u79BB\u4E0E\u65B9\u4F4D\u4E25\u683C\u6B63\u786E\uFF0C\u6781\u5730\u4E0E\u822A\u7EBF\u89C4\u5212\u76F4\u89C2"],
    cons: ["\u4EC5\u4E2D\u5FC3\u70B9\u6027\u8D28\u53EF\u9760\uFF0C\u8D8A\u9760\u8FB9\u7F18\u5F62\u72B6\u4E0E\u9762\u79EF\u53D8\u5F62\u8D8A\u5927"]
  },
  {
    id: "polar-stereographic",
    name: "Polar Stereographic",
    zhName: "\u6781\u5730\u7ACB\u4F53\u6295\u5F71",
    category: "azimuthal",
    property: "conformal",
    suitableFor: "\u6781\u5730\u822A\u6D77\u3001\u822A\u7A7A\u4E0E\u79D1\u8003\u7528\u56FE\uFF08\u7B49\u89D2\uFF09",
    pros: ["\u6781\u533A\u7B49\u89D2\u4FDD\u5F62\uFF0C\u662F\u6781\u5730\u79D1\u8003\u4E0E\u5BFC\u822A\u7684\u6807\u51C6\u6295\u5F71"],
    cons: ["\u53EA\u9002\u5408\u6781\u533A\uFF0C\u4E2D\u4F4E\u7EAC\u5EA6\u65E0\u6CD5\u4F7F\u7528"]
  },
  {
    id: "lambert-azimuthal-equal-area",
    name: "Lambert Azimuthal Equal-Area",
    zhName: "\u5170\u4F2F\u7279\u65B9\u4F4D\u7B49\u79EF\u6295\u5F71",
    category: "azimuthal",
    property: "equal-area",
    suitableFor: "\u5927\u6D32\u5C3A\u5EA6\u3001\u6781\u5730\u5730\u533A\u7684\u7B49\u79EF\u4E13\u9898\u5236\u56FE",
    pros: ["\u5927\u6D32/\u6781\u533A\u9762\u79EF\u4FDD\u771F\uFF0C\u517C\u987E\u4E00\u5B9A\u7684\u5F62\u72B6\u4FDD\u6301"],
    cons: ["\u89D2\u5EA6\u53D8\u5F62\u968F\u8FDC\u79BB\u6295\u5F71\u4E2D\u5FC3\u800C\u589E\u5927"]
  },
  {
    id: "equidistant-cylindrical",
    name: "Equidistant Cylindrical",
    zhName: "\u7B49\u8DDD\u5706\u67F1\u6295\u5F71",
    category: "cylindrical",
    property: "equidistant",
    suitableFor: "\u4F4E\u7EAC\u5EA6\u7B80\u6613\u5236\u56FE\u4E0E\u6559\u5B66\u6F14\u793A\uFF08\u7ECF\u7EAC\u7F51\u4E3A\u65B9\u683C\uFF0C\u76F4\u89C2\u6613\u61C2\uFF09",
    pros: ["\u7ECF\u7EAC\u7F51\u4E3A\u89C4\u5219\u65B9\u683C\uFF0C\u8BA1\u7B97\u4E0E\u7ED8\u5236\u6700\u7B80\u5355\uFF0C\u6559\u5B66\u6F14\u793A\u53CB\u597D"],
    cons: ["\u7B49\u89D2\u3001\u7B49\u79EF\u6027\u8D28\u90FD\u4E0D\u5177\u5907\uFF0C\u5404\u7C7B\u53D8\u5F62\u5168\u9762\u5B58\u5728"]
  },
  {
    id: "gall-peters",
    name: "Gall-Peters",
    zhName: "\u9AD8\u5C14-\u5F7C\u5F97\u65AF\u6295\u5F71",
    category: "cylindrical",
    property: "equal-area",
    suitableFor: "\u4F4E\u7EAC\u5EA6\u53CA\u4E16\u754C\u7684\u9762\u79EF\u5BF9\u6BD4\u4E13\u9898\u56FE",
    pros: ["\u9762\u79EF\u4E25\u683C\u76F8\u7B49\uFF0C\u5168\u7403\u9762\u79EF\u5BF9\u6BD4\u516C\u5E73\uFF08\u6807\u51C6\u7EAC\u7EBF 45\xB0\uFF09"],
    cons: ["\u4F4E\u7EAC\u5F62\u72B6\u62C9\u4F38\u660E\u663E\uFF0C\u89C2\u611F\u5DEE\uFF0C\u4E0D\u9002\u5408\u6302\u56FE"]
  },
  {
    id: "robinson",
    name: "Robinson",
    zhName: "\u7F57\u5BBE\u900A\u6295\u5F71",
    category: "compromise",
    property: "compromise",
    suitableFor: "\u4E16\u754C\u6302\u56FE\u3001\u6559\u5B66\u6F14\u793A\uFF1A\u5404\u7C7B\u53D8\u5F62\u5747\u8861\uFF0C\u89C6\u89C9\u6548\u679C\u597D",
    pros: ["\u5404\u7C7B\u53D8\u5F62\u6298\u4E2D\u5747\u8861\uFF0C\u89C6\u89C9\u8212\u9002\uFF0C\u4E16\u754C\u6302\u56FE\u5E38\u7528"],
    cons: ["\u7B49\u89D2\u7B49\u79EF\u90FD\u4E0D\u4E25\u683C\uFF0C\u4E0D\u53EF\u7528\u4E8E\u7CBE\u786E\u91CF\u7B97"]
  },
  {
    id: "winkel-tripel",
    name: "Winkel Tripel",
    zhName: "\u6E29\u514B\u5C14\u4E09\u91CD\u6295\u5F71",
    category: "compromise",
    property: "compromise",
    suitableFor: "\u4E16\u754C\u5168\u56FE\uFF08\u300A\u56FD\u5BB6\u5730\u7406\u300B\u66FE\u91C7\u7528\uFF09\uFF0C\u6298\u4E2D\u53D8\u5F62",
    pros: ["\u6298\u4E2D\u65B9\u6848\u4E2D\u89C2\u611F\u81EA\u7136\uFF0C\u7ECF\u7EBF\u5F2F\u66F2\u5E73\u6ED1\uFF0C\u4E16\u754C\u5168\u56FE\u5E38\u7528"],
    cons: ["\u65E0\u4E25\u683C\u51E0\u4F55\u6027\u8D28\uFF0C\u9762\u79EF\u4E0E\u89D2\u5EA6\u5747\u4E0D\u53EF\u76F4\u63A5\u91CF\u7B97"]
  },
  {
    id: "mollweide",
    name: "Mollweide",
    zhName: "\u6469\u5C14\u9B4F\u7279\u6295\u5F71",
    category: "pseudocylindrical",
    property: "equal-area",
    suitableFor: "\u4E16\u754C\u8303\u56F4\u7684\u7EDF\u8BA1\u5206\u5E03\u56FE\uFF08\u5982\u4EBA\u53E3\u3001\u6C14\u5019\u5E26\u5206\u5E03\uFF09",
    pros: ["\u5168\u7403\u7B49\u79EF\uFF0C\u5206\u5E03\u7C7B\u4E13\u9898\u56FE\u9762\u79EF\u53EF\u6BD4"],
    cons: ["\u8FB9\u7F18\uFF08\u5C24\u5176\u9AD8\u7EAC\u4E24\u4FA7\uFF09\u89D2\u5EA6\u53D8\u5F62\u5927\uFF0C\u5F62\u72B6\u5931\u771F\u660E\u663E"]
  }
];
function findProjection(id) {
  return PROJECTION_KB.find((p) => p.id === id);
}

// node_modules/d3-array/src/fsum.js
var Adder2 = class {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }
  add(x) {
    const p = this._partials;
    let i = 0;
    for (let j = 0; j < this._n && j < 32; j++) {
      const y = p[j], hi = x + y, lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
      if (lo) p[i++] = lo;
      x = hi;
    }
    p[i] = x;
    this._n = i + 1;
    return this;
  }
  valueOf() {
    const p = this._partials;
    let n = this._n, x, y, lo, hi = 0;
    if (n > 0) {
      hi = p[--n];
      while (n > 0) {
        x = hi;
        y = p[--n];
        hi = x + y;
        lo = y - (hi - x);
        if (lo) break;
      }
      if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
        y = lo * 2;
        x = hi + y;
        if (y == x - hi) hi = x;
      }
    }
    return hi;
  }
};

// node_modules/d3-geo/src/math.js
var epsilon4 = 1e-6;
var pi3 = Math.PI;
var halfPi3 = pi3 / 2;
var quarterPi3 = pi3 / 4;
var tau3 = pi3 * 2;
var degrees3 = 180 / pi3;
var radians3 = pi3 / 180;
var abs3 = Math.abs;
var atan22 = Math.atan2;
var cos3 = Math.cos;
var sin3 = Math.sin;
var sqrt4 = Math.sqrt;
function acos3(x) {
  return x > 1 ? 0 : x < -1 ? pi3 : Math.acos(x);
}
function asin3(x) {
  return x > 1 ? halfPi3 : x < -1 ? -halfPi3 : Math.asin(x);
}

// node_modules/d3-geo/src/noop.js
function noop2() {
}

// node_modules/d3-geo/src/stream.js
function streamGeometry2(geometry, stream) {
  if (geometry && streamGeometryType2.hasOwnProperty(geometry.type)) {
    streamGeometryType2[geometry.type](geometry, stream);
  }
}
var streamObjectType2 = {
  Feature: function(object, stream) {
    streamGeometry2(object.geometry, stream);
  },
  FeatureCollection: function(object, stream) {
    var features = object.features, i = -1, n = features.length;
    while (++i < n) streamGeometry2(features[i].geometry, stream);
  }
};
var streamGeometryType2 = {
  Sphere: function(object, stream) {
    stream.sphere();
  },
  Point: function(object, stream) {
    object = object.coordinates;
    stream.point(object[0], object[1], object[2]);
  },
  MultiPoint: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
  },
  LineString: function(object, stream) {
    streamLine2(object.coordinates, stream, 0);
  },
  MultiLineString: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamLine2(coordinates[i], stream, 0);
  },
  Polygon: function(object, stream) {
    streamPolygon2(object.coordinates, stream);
  },
  MultiPolygon: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamPolygon2(coordinates[i], stream);
  },
  GeometryCollection: function(object, stream) {
    var geometries = object.geometries, i = -1, n = geometries.length;
    while (++i < n) streamGeometry2(geometries[i], stream);
  }
};
function streamLine2(coordinates, stream, closed) {
  var i = -1, n = coordinates.length - closed, coordinate;
  stream.lineStart();
  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}
function streamPolygon2(coordinates, stream) {
  var i = -1, n = coordinates.length;
  stream.polygonStart();
  while (++i < n) streamLine2(coordinates[i], stream, 1);
  stream.polygonEnd();
}
function stream_default2(object, stream) {
  if (object && streamObjectType2.hasOwnProperty(object.type)) {
    streamObjectType2[object.type](object, stream);
  } else {
    streamGeometry2(object, stream);
  }
}

// node_modules/d3-geo/src/cartesian.js
function spherical2(cartesian3) {
  return [atan22(cartesian3[1], cartesian3[0]), asin3(cartesian3[2])];
}
function cartesian2(spherical3) {
  var lambda = spherical3[0], phi = spherical3[1], cosPhi = cos3(phi);
  return [cosPhi * cos3(lambda), cosPhi * sin3(lambda), sin3(phi)];
}
function cartesianNormalizeInPlace2(d) {
  var l = sqrt4(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}

// node_modules/d3-geo/src/constant.js
function constant_default(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-geo/src/compose.js
function compose_default2(a, b) {
  function compose(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }
  if (a.invert && b.invert) compose.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  };
  return compose;
}

// node_modules/d3-geo/src/rotation.js
function rotationIdentity2(lambda, phi) {
  if (abs3(lambda) > pi3) lambda -= Math.round(lambda / tau3) * tau3;
  return [lambda, phi];
}
rotationIdentity2.invert = rotationIdentity2;
function rotateRadians2(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau3) ? deltaPhi || deltaGamma ? compose_default2(rotationLambda2(deltaLambda), rotationPhiGamma2(deltaPhi, deltaGamma)) : rotationLambda2(deltaLambda) : deltaPhi || deltaGamma ? rotationPhiGamma2(deltaPhi, deltaGamma) : rotationIdentity2;
}
function forwardRotationLambda2(deltaLambda) {
  return function(lambda, phi) {
    lambda += deltaLambda;
    if (abs3(lambda) > pi3) lambda -= Math.round(lambda / tau3) * tau3;
    return [lambda, phi];
  };
}
function rotationLambda2(deltaLambda) {
  var rotation = forwardRotationLambda2(deltaLambda);
  rotation.invert = forwardRotationLambda2(-deltaLambda);
  return rotation;
}
function rotationPhiGamma2(deltaPhi, deltaGamma) {
  var cosDeltaPhi = cos3(deltaPhi), sinDeltaPhi = sin3(deltaPhi), cosDeltaGamma = cos3(deltaGamma), sinDeltaGamma = sin3(deltaGamma);
  function rotation(lambda, phi) {
    var cosPhi = cos3(phi), x = cos3(lambda) * cosPhi, y = sin3(lambda) * cosPhi, z = sin3(phi), k = z * cosDeltaPhi + x * sinDeltaPhi;
    return [
      atan22(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin3(k * cosDeltaGamma + y * sinDeltaGamma)
    ];
  }
  rotation.invert = function(lambda, phi) {
    var cosPhi = cos3(phi), x = cos3(lambda) * cosPhi, y = sin3(lambda) * cosPhi, z = sin3(phi), k = z * cosDeltaGamma - y * sinDeltaGamma;
    return [
      atan22(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
      asin3(k * cosDeltaPhi - x * sinDeltaPhi)
    ];
  };
  return rotation;
}

// node_modules/d3-geo/src/circle.js
function circleStream2(stream, radius, delta, direction, t0, t1) {
  if (!delta) return;
  var cosRadius = cos3(radius), sinRadius = sin3(radius), step = direction * delta;
  if (t0 == null) {
    t0 = radius + direction * tau3;
    t1 = radius - step / 2;
  } else {
    t0 = circleRadius2(cosRadius, t0);
    t1 = circleRadius2(cosRadius, t1);
    if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau3;
  }
  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
    point = spherical2([cosRadius, -sinRadius * cos3(t), -sinRadius * sin3(t)]);
    stream.point(point[0], point[1]);
  }
}
function circleRadius2(cosRadius, point) {
  point = cartesian2(point), point[0] -= cosRadius;
  cartesianNormalizeInPlace2(point);
  var radius = acos3(-point[1]);
  return ((-point[2] < 0 ? -radius : radius) + tau3 - epsilon4) % tau3;
}
function circle_default() {
  var center = constant_default([0, 0]), radius = constant_default(90), precision = constant_default(2), ring, rotate, stream = { point };
  function point(x, y) {
    ring.push(x = rotate(x, y));
    x[0] *= degrees3, x[1] *= degrees3;
  }
  function circle2() {
    var c = center.apply(this, arguments), r = radius.apply(this, arguments) * radians3, p = precision.apply(this, arguments) * radians3;
    ring = [];
    rotate = rotateRadians2(-c[0] * radians3, -c[1] * radians3, 0).invert;
    circleStream2(stream, r, p, 1);
    c = { type: "Polygon", coordinates: [ring] };
    ring = rotate = null;
    return c;
  }
  circle2.center = function(_) {
    return arguments.length ? (center = typeof _ === "function" ? _ : constant_default([+_[0], +_[1]]), circle2) : center;
  };
  circle2.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant_default(+_), circle2) : radius;
  };
  circle2.precision = function(_) {
    return arguments.length ? (precision = typeof _ === "function" ? _ : constant_default(+_), circle2) : precision;
  };
  return circle2;
}

// node_modules/d3-geo/src/identity.js
var identity_default2 = (x) => x;

// node_modules/d3-geo/src/path/area.js
var areaSum2 = new Adder2();
var areaRingSum2 = new Adder2();
var x00;
var y00;
var x0;
var y0;
var areaStream = {
  point: noop2,
  lineStart: noop2,
  lineEnd: noop2,
  polygonStart: function() {
    areaStream.lineStart = areaRingStart;
    areaStream.lineEnd = areaRingEnd;
  },
  polygonEnd: function() {
    areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop2;
    areaSum2.add(abs3(areaRingSum2));
    areaRingSum2 = new Adder2();
  },
  result: function() {
    var area = areaSum2 / 2;
    areaSum2 = new Adder2();
    return area;
  }
};
function areaRingStart() {
  areaStream.point = areaPointFirst;
}
function areaPointFirst(x, y) {
  areaStream.point = areaPoint;
  x00 = x0 = x, y00 = y0 = y;
}
function areaPoint(x, y) {
  areaRingSum2.add(y0 * x - x0 * y);
  x0 = x, y0 = y;
}
function areaRingEnd() {
  areaPoint(x00, y00);
}
var area_default = areaStream;

// node_modules/d3-geo/src/path/bounds.js
var x03 = Infinity;
var y03 = x03;
var x12 = -x03;
var y12 = x12;
var boundsStream2 = {
  point: boundsPoint2,
  lineStart: noop2,
  lineEnd: noop2,
  polygonStart: noop2,
  polygonEnd: noop2,
  result: function() {
    var bounds = [[x03, y03], [x12, y12]];
    x12 = y12 = -(y03 = x03 = Infinity);
    return bounds;
  }
};
function boundsPoint2(x, y) {
  if (x < x03) x03 = x;
  if (x > x12) x12 = x;
  if (y < y03) y03 = y;
  if (y > y12) y12 = y;
}
var bounds_default2 = boundsStream2;

// node_modules/d3-geo/src/path/centroid.js
var X0 = 0;
var Y0 = 0;
var Z0 = 0;
var X1 = 0;
var Y1 = 0;
var Z1 = 0;
var X2 = 0;
var Y2 = 0;
var Z2 = 0;
var x002;
var y002;
var x04;
var y04;
var centroidStream = {
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function() {
    centroidStream.lineStart = centroidRingStart;
    centroidStream.lineEnd = centroidRingEnd;
  },
  polygonEnd: function() {
    centroidStream.point = centroidPoint;
    centroidStream.lineStart = centroidLineStart;
    centroidStream.lineEnd = centroidLineEnd;
  },
  result: function() {
    var centroid = Z2 ? [X2 / Z2, Y2 / Z2] : Z1 ? [X1 / Z1, Y1 / Z1] : Z0 ? [X0 / Z0, Y0 / Z0] : [NaN, NaN];
    X0 = Y0 = Z0 = X1 = Y1 = Z1 = X2 = Y2 = Z2 = 0;
    return centroid;
  }
};
function centroidPoint(x, y) {
  X0 += x;
  Y0 += y;
  ++Z0;
}
function centroidLineStart() {
  centroidStream.point = centroidPointFirstLine;
}
function centroidPointFirstLine(x, y) {
  centroidStream.point = centroidPointLine;
  centroidPoint(x04 = x, y04 = y);
}
function centroidPointLine(x, y) {
  var dx = x - x04, dy = y - y04, z = sqrt4(dx * dx + dy * dy);
  X1 += z * (x04 + x) / 2;
  Y1 += z * (y04 + y) / 2;
  Z1 += z;
  centroidPoint(x04 = x, y04 = y);
}
function centroidLineEnd() {
  centroidStream.point = centroidPoint;
}
function centroidRingStart() {
  centroidStream.point = centroidPointFirstRing;
}
function centroidRingEnd() {
  centroidPointRing(x002, y002);
}
function centroidPointFirstRing(x, y) {
  centroidStream.point = centroidPointRing;
  centroidPoint(x002 = x04 = x, y002 = y04 = y);
}
function centroidPointRing(x, y) {
  var dx = x - x04, dy = y - y04, z = sqrt4(dx * dx + dy * dy);
  X1 += z * (x04 + x) / 2;
  Y1 += z * (y04 + y) / 2;
  Z1 += z;
  z = y04 * x - x04 * y;
  X2 += z * (x04 + x);
  Y2 += z * (y04 + y);
  Z2 += z * 3;
  centroidPoint(x04 = x, y04 = y);
}
var centroid_default = centroidStream;

// node_modules/d3-geo/src/path/context.js
function PathContext2(context) {
  this._context = context;
}
PathContext2.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._context.closePath();
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau3);
        break;
      }
    }
  },
  result: noop2
};

// node_modules/d3-geo/src/path/measure.js
var lengthSum2 = new Adder2();
var lengthRing;
var x003;
var y003;
var x05;
var y05;
var lengthStream = {
  point: noop2,
  lineStart: function() {
    lengthStream.point = lengthPointFirst;
  },
  lineEnd: function() {
    if (lengthRing) lengthPoint(x003, y003);
    lengthStream.point = noop2;
  },
  polygonStart: function() {
    lengthRing = true;
  },
  polygonEnd: function() {
    lengthRing = null;
  },
  result: function() {
    var length = +lengthSum2;
    lengthSum2 = new Adder2();
    return length;
  }
};
function lengthPointFirst(x, y) {
  lengthStream.point = lengthPoint;
  x003 = x05 = x, y003 = y05 = y;
}
function lengthPoint(x, y) {
  x05 -= x, y05 -= y;
  lengthSum2.add(sqrt4(x05 * x05 + y05 * y05));
  x05 = x, y05 = y;
}
var measure_default = lengthStream;

// node_modules/d3-geo/src/path/string.js
var cacheDigits;
var cacheAppend;
var cacheRadius;
var cacheCircle;
var PathString = class {
  constructor(digits) {
    this._append = digits == null ? append : appendRound(digits);
    this._radius = 4.5;
    this._ = "";
  }
  pointRadius(_) {
    this._radius = +_;
    return this;
  }
  polygonStart() {
    this._line = 0;
  }
  polygonEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    if (this._line === 0) this._ += "Z";
    this._point = NaN;
  }
  point(x, y) {
    switch (this._point) {
      case 0: {
        this._append`M${x},${y}`;
        this._point = 1;
        break;
      }
      case 1: {
        this._append`L${x},${y}`;
        break;
      }
      default: {
        this._append`M${x},${y}`;
        if (this._radius !== cacheRadius || this._append !== cacheAppend) {
          const r = this._radius;
          const s = this._;
          this._ = "";
          this._append`m0,${r}a${r},${r} 0 1,1 0,${-2 * r}a${r},${r} 0 1,1 0,${2 * r}z`;
          cacheRadius = r;
          cacheAppend = this._append;
          cacheCircle = this._;
          this._ = s;
        }
        this._ += cacheCircle;
        break;
      }
    }
  }
  result() {
    const result = this._;
    this._ = "";
    return result.length ? result : null;
  }
};
function append(strings) {
  let i = 1;
  this._ += strings[0];
  for (const j = strings.length; i < j; ++i) {
    this._ += arguments[i] + strings[i];
  }
}
function appendRound(digits) {
  const d = Math.floor(digits);
  if (!(d >= 0)) throw new RangeError(`invalid digits: ${digits}`);
  if (d > 15) return append;
  if (d !== cacheDigits) {
    const k = 10 ** d;
    cacheDigits = d;
    cacheAppend = function append2(strings) {
      let i = 1;
      this._ += strings[0];
      for (const j = strings.length; i < j; ++i) {
        this._ += Math.round(arguments[i] * k) / k + strings[i];
      }
    };
  }
  return cacheAppend;
}

// node_modules/d3-geo/src/path/index.js
function path_default(projection2, context) {
  let digits = 3, pointRadius = 4.5, projectionStream, contextStream;
  function path(object) {
    if (object) {
      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
      stream_default2(object, projectionStream(contextStream));
    }
    return contextStream.result();
  }
  path.area = function(object) {
    stream_default2(object, projectionStream(area_default));
    return area_default.result();
  };
  path.measure = function(object) {
    stream_default2(object, projectionStream(measure_default));
    return measure_default.result();
  };
  path.bounds = function(object) {
    stream_default2(object, projectionStream(bounds_default2));
    return bounds_default2.result();
  };
  path.centroid = function(object) {
    stream_default2(object, projectionStream(centroid_default));
    return centroid_default.result();
  };
  path.projection = function(_) {
    if (!arguments.length) return projection2;
    projectionStream = _ == null ? (projection2 = null, identity_default2) : (projection2 = _).stream;
    return path;
  };
  path.context = function(_) {
    if (!arguments.length) return context;
    contextStream = _ == null ? (context = null, new PathString(digits)) : new PathContext2(context = _);
    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
    return path;
  };
  path.pointRadius = function(_) {
    if (!arguments.length) return pointRadius;
    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
    return path;
  };
  path.digits = function(_) {
    if (!arguments.length) return digits;
    if (_ == null) digits = null;
    else {
      const d = Math.floor(_);
      if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
      digits = d;
    }
    if (context === null) contextStream = new PathString(digits);
    return path;
  };
  return path.projection(projection2).digits(digits).context(context);
}

// test-fixtures/diag-tissot.mjs
var china = resolveExtent("china");
var circle = circle_default().radius(4);
function circleArea(infoId, lat) {
  const proj = createProjection(findProjection(infoId), china, 420, 260);
  const path = path_default(proj);
  const b = path.bounds(circle_default().radius(4).center([105, lat])());
  const w = b[1][0] - b[0][0];
  const h = b[1][1] - b[0][1];
  return Math.round(w * h);
}
for (const id of ["mercator", "albers-equal-area-conic"]) {
  const south = circleArea(id, 10);
  const north = circleArea(id, 47);
  console.log(`${id}: \u5357\u90E8(10\xB0N)\u5706\u9762\u79EF\u2248${south}px\xB2, \u5317\u90E8(47\xB0N)\u2248${north}px\xB2, \u5317/\u5357\u6BD4=${(north / south).toFixed(2)}`);
}
console.log("\u9884\u671F\uFF1Amercator \u5317/\u5357\u6BD4\u660E\u663E >1\uFF08\u9762\u79EF\u5938\u5927\uFF09\uFF1Balbers \u63A5\u8FD1 1\uFF08\u7B49\u79EF\uFF09");
