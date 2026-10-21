// node_modules/d3-array/src/fsum.js
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

// node_modules/d3-array/src/merge.js
function* flatten(arrays) {
  for (const array of arrays) {
    yield* array;
  }
}
function merge(arrays) {
  return Array.from(flatten(arrays));
}

// node_modules/d3-array/src/range.js
function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
  var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0, range2 = new Array(n);
  while (++i < n) {
    range2[i] = start + i * step;
  }
  return range2;
}

// node_modules/d3-geo/src/math.js
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
var ceil = Math.ceil;
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

// node_modules/d3-geo/src/noop.js
function noop() {
}

// node_modules/d3-geo/src/stream.js
function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}
var streamObjectType = {
  Feature: function(object2, stream) {
    streamGeometry(object2.geometry, stream);
  },
  FeatureCollection: function(object2, stream) {
    var features = object2.features, i = -1, n = features.length;
    while (++i < n) streamGeometry(features[i].geometry, stream);
  }
};
var streamGeometryType = {
  Sphere: function(object2, stream) {
    stream.sphere();
  },
  Point: function(object2, stream) {
    object2 = object2.coordinates;
    stream.point(object2[0], object2[1], object2[2]);
  },
  MultiPoint: function(object2, stream) {
    var coordinates = object2.coordinates, i = -1, n = coordinates.length;
    while (++i < n) object2 = coordinates[i], stream.point(object2[0], object2[1], object2[2]);
  },
  LineString: function(object2, stream) {
    streamLine(object2.coordinates, stream, 0);
  },
  MultiLineString: function(object2, stream) {
    var coordinates = object2.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamLine(coordinates[i], stream, 0);
  },
  Polygon: function(object2, stream) {
    streamPolygon(object2.coordinates, stream);
  },
  MultiPolygon: function(object2, stream) {
    var coordinates = object2.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamPolygon(coordinates[i], stream);
  },
  GeometryCollection: function(object2, stream) {
    var geometries = object2.geometries, i = -1, n = geometries.length;
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
function stream_default(object2, stream) {
  if (object2 && streamObjectType.hasOwnProperty(object2.type)) {
    streamObjectType[object2.type](object2, stream);
  } else {
    streamGeometry(object2, stream);
  }
}

// node_modules/d3-geo/src/cartesian.js
function spherical(cartesian2) {
  return [atan2(cartesian2[1], cartesian2[0]), asin(cartesian2[2])];
}
function cartesian(spherical2) {
  var lambda = spherical2[0], phi = spherical2[1], cosPhi = cos(phi);
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

// node_modules/d3-geo/src/constant.js
function constant_default(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-geo/src/compose.js
function compose_default(a, b) {
  function compose(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }
  if (a.invert && b.invert) compose.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  };
  return compose;
}

// node_modules/d3-geo/src/rotation.js
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

// node_modules/d3-geo/src/circle.js
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
function circle_default() {
  var center = constant_default([0, 0]), radius = constant_default(90), precision = constant_default(2), ring, rotate, stream = { point };
  function point(x, y) {
    ring.push(x = rotate(x, y));
    x[0] *= degrees, x[1] *= degrees;
  }
  function circle() {
    var c = center.apply(this, arguments), r = radius.apply(this, arguments) * radians, p = precision.apply(this, arguments) * radians;
    ring = [];
    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
    circleStream(stream, r, p, 1);
    c = { type: "Polygon", coordinates: [ring] };
    ring = rotate = null;
    return c;
  }
  circle.center = function(_) {
    return arguments.length ? (center = typeof _ === "function" ? _ : constant_default([+_[0], +_[1]]), circle) : center;
  };
  circle.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant_default(+_), circle) : radius;
  };
  circle.precision = function(_) {
    return arguments.length ? (precision = typeof _ === "function" ? _ : constant_default(+_), circle) : precision;
  };
  return circle;
}

// node_modules/d3-geo/src/clip/buffer.js
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

// node_modules/d3-geo/src/pointEqual.js
function pointEqual_default(a, b) {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
}

// node_modules/d3-geo/src/clip/rejoin.js
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

// node_modules/d3-geo/src/polygonContains.js
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

// node_modules/d3-geo/src/clip/index.js
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

// node_modules/d3-geo/src/clip/antimeridian.js
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

// node_modules/d3-geo/src/clip/circle.js
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

// node_modules/d3-geo/src/clip/line.js
function line_default(a, b, x05, y05, x12, y12) {
  var ax = a[0], ay = a[1], bx = b[0], by = b[1], t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
  r = x05 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }
  r = x12 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }
  r = y05 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }
  r = y12 - ay;
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

// node_modules/d3-geo/src/clip/rectangle.js
var clipMax = 1e9;
var clipMin = -clipMax;
function clipRectangle(x05, y05, x12, y12) {
  function visible(x, y) {
    return x05 <= x && x <= x12 && y05 <= y && y <= y12;
  }
  function interpolate(from, to, direction, stream) {
    var a = 0, a1 = 0;
    if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
      do
        stream.point(a === 0 || a === 3 ? x05 : x12, a > 1 ? y12 : y05);
      while ((a = (a + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }
  function corner(p, direction) {
    return abs(p[0] - x05) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x12) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y05) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
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
          if (a1 <= y12) {
            if (b1 > y12 && (b0 - a0) * (y12 - a1) > (b1 - a1) * (x05 - a0)) ++winding;
          } else {
            if (b1 <= y12 && (b0 - a0) * (y12 - a1) < (b1 - a1) * (x05 - a0)) --winding;
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
          if (line_default(a, b, x05, y05, x12, y12)) {
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

// node_modules/d3-geo/src/graticule.js
function graticuleX(y05, y12, dy) {
  var y = range(y05, y12 - epsilon, dy).concat(y12);
  return function(x) {
    return y.map(function(y2) {
      return [x, y2];
    });
  };
}
function graticuleY(x05, x12, dx) {
  var x = range(x05, x12 - epsilon, dx).concat(x12);
  return function(y) {
    return x.map(function(x2) {
      return [x2, y];
    });
  };
}
function graticule() {
  var x12, x05, X12, X02, y12, y05, Y12, Y02, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
  function graticule2() {
    return { type: "MultiLineString", coordinates: lines() };
  }
  function lines() {
    return range(ceil(X02 / DX) * DX, X12, DX).map(X).concat(range(ceil(Y02 / DY) * DY, Y12, DY).map(Y)).concat(range(ceil(x05 / dx) * dx, x12, dx).filter(function(x2) {
      return abs(x2 % DX) > epsilon;
    }).map(x)).concat(range(ceil(y05 / dy) * dy, y12, dy).filter(function(y2) {
      return abs(y2 % DY) > epsilon;
    }).map(y));
  }
  graticule2.lines = function() {
    return lines().map(function(coordinates) {
      return { type: "LineString", coordinates };
    });
  };
  graticule2.outline = function() {
    return {
      type: "Polygon",
      coordinates: [
        X(X02).concat(
          Y(Y12).slice(1),
          X(X12).reverse().slice(1),
          Y(Y02).reverse().slice(1)
        )
      ]
    };
  };
  graticule2.extent = function(_) {
    if (!arguments.length) return graticule2.extentMinor();
    return graticule2.extentMajor(_).extentMinor(_);
  };
  graticule2.extentMajor = function(_) {
    if (!arguments.length) return [[X02, Y02], [X12, Y12]];
    X02 = +_[0][0], X12 = +_[1][0];
    Y02 = +_[0][1], Y12 = +_[1][1];
    if (X02 > X12) _ = X02, X02 = X12, X12 = _;
    if (Y02 > Y12) _ = Y02, Y02 = Y12, Y12 = _;
    return graticule2.precision(precision);
  };
  graticule2.extentMinor = function(_) {
    if (!arguments.length) return [[x05, y05], [x12, y12]];
    x05 = +_[0][0], x12 = +_[1][0];
    y05 = +_[0][1], y12 = +_[1][1];
    if (x05 > x12) _ = x05, x05 = x12, x12 = _;
    if (y05 > y12) _ = y05, y05 = y12, y12 = _;
    return graticule2.precision(precision);
  };
  graticule2.step = function(_) {
    if (!arguments.length) return graticule2.stepMinor();
    return graticule2.stepMajor(_).stepMinor(_);
  };
  graticule2.stepMajor = function(_) {
    if (!arguments.length) return [DX, DY];
    DX = +_[0], DY = +_[1];
    return graticule2;
  };
  graticule2.stepMinor = function(_) {
    if (!arguments.length) return [dx, dy];
    dx = +_[0], dy = +_[1];
    return graticule2;
  };
  graticule2.precision = function(_) {
    if (!arguments.length) return precision;
    precision = +_;
    x = graticuleX(y05, y12, 90);
    y = graticuleY(x05, x12, precision);
    X = graticuleX(Y02, Y12, 90);
    Y = graticuleY(X02, X12, precision);
    return graticule2;
  };
  return graticule2.extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]]).extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
}

// node_modules/d3-geo/src/identity.js
var identity_default = (x) => x;

// node_modules/d3-geo/src/path/area.js
var areaSum = new Adder();
var areaRingSum = new Adder();
var x00;
var y00;
var x0;
var y0;
var areaStream = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function() {
    areaStream.lineStart = areaRingStart;
    areaStream.lineEnd = areaRingEnd;
  },
  polygonEnd: function() {
    areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop;
    areaSum.add(abs(areaRingSum));
    areaRingSum = new Adder();
  },
  result: function() {
    var area = areaSum / 2;
    areaSum = new Adder();
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
  areaRingSum.add(y0 * x - x0 * y);
  x0 = x, y0 = y;
}
function areaRingEnd() {
  areaPoint(x00, y00);
}
var area_default = areaStream;

// node_modules/d3-geo/src/path/bounds.js
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
var x03;
var y03;
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
  centroidPoint(x03 = x, y03 = y);
}
function centroidPointLine(x, y) {
  var dx = x - x03, dy = y - y03, z = sqrt(dx * dx + dy * dy);
  X1 += z * (x03 + x) / 2;
  Y1 += z * (y03 + y) / 2;
  Z1 += z;
  centroidPoint(x03 = x, y03 = y);
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
  centroidPoint(x002 = x03 = x, y002 = y03 = y);
}
function centroidPointRing(x, y) {
  var dx = x - x03, dy = y - y03, z = sqrt(dx * dx + dy * dy);
  X1 += z * (x03 + x) / 2;
  Y1 += z * (y03 + y) / 2;
  Z1 += z;
  z = y03 * x - x03 * y;
  X2 += z * (x03 + x);
  Y2 += z * (y03 + y);
  Z2 += z * 3;
  centroidPoint(x03 = x, y03 = y);
}
var centroid_default = centroidStream;

// node_modules/d3-geo/src/path/context.js
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

// node_modules/d3-geo/src/path/measure.js
var lengthSum = new Adder();
var lengthRing;
var x003;
var y003;
var x04;
var y04;
var lengthStream = {
  point: noop,
  lineStart: function() {
    lengthStream.point = lengthPointFirst;
  },
  lineEnd: function() {
    if (lengthRing) lengthPoint(x003, y003);
    lengthStream.point = noop;
  },
  polygonStart: function() {
    lengthRing = true;
  },
  polygonEnd: function() {
    lengthRing = null;
  },
  result: function() {
    var length = +lengthSum;
    lengthSum = new Adder();
    return length;
  }
};
function lengthPointFirst(x, y) {
  lengthStream.point = lengthPoint;
  x003 = x04 = x, y003 = y04 = y;
}
function lengthPoint(x, y) {
  x04 -= x, y04 -= y;
  lengthSum.add(sqrt(x04 * x04 + y04 * y04));
  x04 = x, y04 = y;
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
  function path(object2) {
    if (object2) {
      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
      stream_default(object2, projectionStream(contextStream));
    }
    return contextStream.result();
  }
  path.area = function(object2) {
    stream_default(object2, projectionStream(area_default));
    return area_default.result();
  };
  path.measure = function(object2) {
    stream_default(object2, projectionStream(measure_default));
    return measure_default.result();
  };
  path.bounds = function(object2) {
    stream_default(object2, projectionStream(bounds_default));
    return bounds_default.result();
  };
  path.centroid = function(object2) {
    stream_default(object2, projectionStream(centroid_default));
    return centroid_default.result();
  };
  path.projection = function(_) {
    if (!arguments.length) return projection2;
    projectionStream = _ == null ? (projection2 = null, identity_default) : (projection2 = _).stream;
    return path;
  };
  path.context = function(_) {
    if (!arguments.length) return context;
    contextStream = _ == null ? (context = null, new PathString(digits)) : new PathContext(context = _);
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

// node_modules/d3-geo/src/transform.js
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

// node_modules/d3-geo/src/projection/fit.js
function fit(projection2, fitBounds, object2) {
  var clip = projection2.clipExtent && projection2.clipExtent();
  projection2.scale(150).translate([0, 0]);
  if (clip != null) projection2.clipExtent(null);
  stream_default(object2, projection2.stream(bounds_default));
  fitBounds(bounds_default.result());
  if (clip != null) projection2.clipExtent(clip);
  return projection2;
}
function fitExtent(projection2, extent, object2) {
  return fit(projection2, function(b) {
    var w = extent[1][0] - extent[0][0], h = extent[1][1] - extent[0][1], k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2, y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k).translate([x, y]);
  }, object2);
}
function fitSize(projection2, size, object2) {
  return fitExtent(projection2, [[0, 0], size], object2);
}
function fitWidth(projection2, width, object2) {
  return fit(projection2, function(b) {
    var w = +width, k = w / (b[1][0] - b[0][0]), x = (w - k * (b[1][0] + b[0][0])) / 2, y = -k * b[0][1];
    projection2.scale(150 * k).translate([x, y]);
  }, object2);
}
function fitHeight(projection2, height, object2) {
  return fit(projection2, function(b) {
    var h = +height, k = h / (b[1][1] - b[0][1]), x = -k * b[0][0], y = (h - k * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k).translate([x, y]);
  }, object2);
}

// node_modules/d3-geo/src/projection/resample.js
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
  function resampleLineTo(x05, y05, lambda0, a0, b0, c0, x12, y12, lambda1, a1, b1, c1, depth, stream) {
    var dx = x12 - x05, dy = y12 - y05, d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = sqrt(a * a + b * b + c * c), phi2 = asin(c /= m), lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a), p = project(lambda2, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x05, dy2 = y2 - y05, dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
        resampleLineTo(x05, y05, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda2, a, b, c, x12, y12, lambda1, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda00, x004, y004, a00, b00, c00, lambda0, x05, y05, a0, b0, c0;
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
      x05 = NaN;
      resampleStream.point = linePoint;
      stream.lineStart();
    }
    function linePoint(lambda, phi) {
      var c = cartesian([lambda, phi]), p = project(lambda, phi);
      resampleLineTo(x05, y05, lambda0, a0, b0, c0, x05 = p[0], y05 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
      stream.point(x05, y05);
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
      linePoint(lambda00 = lambda, phi), x004 = x05, y004 = y05, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint;
    }
    function ringEnd() {
      resampleLineTo(x05, y05, lambda0, a0, b0, c0, x004, y004, lambda00, a00, b00, c00, maxDepth, stream);
      resampleStream.lineEnd = lineEnd;
      lineEnd();
    }
    return resampleStream;
  };
}

// node_modules/d3-geo/src/projection/index.js
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
  var project, k = 150, x = 480, y = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = antimeridian_default, x05 = null, y05, x12, y12, postclip = identity_default, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache, cacheStream;
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
    return arguments.length ? (postclip = _, x05 = y05 = x12 = y12 = null, reset()) : postclip;
  };
  projection2.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? circle_default2(theta = _ * radians) : (theta = null, antimeridian_default), reset()) : theta * degrees;
  };
  projection2.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x05 = y05 = x12 = y12 = null, identity_default) : clipRectangle(x05 = +_[0][0], y05 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x05 == null ? null : [[x05, y05], [x12, y12]];
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
  projection2.fitExtent = function(extent, object2) {
    return fitExtent(projection2, extent, object2);
  };
  projection2.fitSize = function(size, object2) {
    return fitSize(projection2, size, object2);
  };
  projection2.fitWidth = function(width, object2) {
    return fitWidth(projection2, width, object2);
  };
  projection2.fitHeight = function(height, object2) {
    return fitHeight(projection2, height, object2);
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

// node_modules/d3-geo/src/projection/conic.js
function conicProjection(projectAt) {
  var phi0 = 0, phi1 = pi / 3, m = projectionMutator(projectAt), p = m(phi0, phi1);
  p.parallels = function(_) {
    return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
  };
  return p;
}

// node_modules/d3-geo/src/projection/cylindricalEqualArea.js
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

// node_modules/d3-geo/src/projection/conicEqualArea.js
function conicEqualAreaRaw(y05, y12) {
  var sy0 = sin(y05), n = (sy0 + sin(y12)) / 2;
  if (abs(n) < epsilon) return cylindricalEqualAreaRaw(y05);
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

// node_modules/d3-geo/src/projection/azimuthal.js
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

// node_modules/d3-geo/src/projection/azimuthalEqualArea.js
var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
  return sqrt(2 / (1 + cxcy));
});
azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
  return 2 * asin(z / 2);
});
function azimuthalEqualArea_default() {
  return projection(azimuthalEqualAreaRaw).scale(124.75).clipAngle(180 - 1e-3);
}

// node_modules/d3-geo/src/projection/azimuthalEquidistant.js
var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
  return (c = acos(c)) && c / sin(c);
});
azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
  return z;
});
function azimuthalEquidistant_default() {
  return projection(azimuthalEquidistantRaw).scale(79.4188).clipAngle(180 - 1e-3);
}

// node_modules/d3-geo/src/projection/mercator.js
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
  var m = projection(project), center = m.center, scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, x05 = null, y05, x12, y12;
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
    return arguments.length ? (_ == null ? x05 = y05 = x12 = y12 = null : (x05 = +_[0][0], y05 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reclip()) : x05 == null ? null : [[x05, y05], [x12, y12]];
  };
  function reclip() {
    var k = pi * scale(), t = m(rotation_default(m.rotate()).invert([0, 0]));
    return clipExtent(x05 == null ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw ? [[Math.max(t[0] - k, x05), y05], [Math.min(t[0] + k, x12), y12]] : [[x05, Math.max(t[1] - k, y05)], [x12, Math.min(t[1] + k, y12)]]);
  }
  return reclip();
}

// node_modules/d3-geo/src/projection/conicConformal.js
function tany(y) {
  return tan((halfPi + y) / 2);
}
function conicConformalRaw(y05, y12) {
  var cy0 = cos(y05), n = y05 === y12 ? sin(y05) : log(cy0 / cos(y12)) / log(tany(y12) / tany(y05)), f = cy0 * pow(tany(y05), n) / n;
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

// node_modules/d3-geo/src/projection/equirectangular.js
function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}
equirectangularRaw.invert = equirectangularRaw;
function equirectangular_default() {
  return projection(equirectangularRaw).scale(152.63);
}

// node_modules/d3-geo/src/projection/equalEarth.js
var A1 = 1.340264;
var A2 = -0.081106;
var A3 = 893e-6;
var A4 = 3796e-6;
var M = sqrt(3) / 2;
var iterations = 12;
function equalEarthRaw(lambda, phi) {
  var l = asin(M * sin(phi)), l2 = l * l, l6 = l2 * l2 * l2;
  return [
    lambda * cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
    l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
  ];
}
equalEarthRaw.invert = function(x, y) {
  var l = y, l2 = l * l, l6 = l2 * l2 * l2;
  for (var i = 0, delta, fy, fpy; i < iterations; ++i) {
    fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
    fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
    l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2;
    if (abs(delta) < epsilon2) break;
  }
  return [
    M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / cos(l),
    asin(sin(l) / M)
  ];
};
function equalEarth_default() {
  return projection(equalEarthRaw).scale(177.158);
}

// node_modules/d3-geo/src/projection/gnomonic.js
function gnomonicRaw(x, y) {
  var cy = cos(y), k = cos(x) * cy;
  return [cy * sin(x) / k, sin(y) / k];
}
gnomonicRaw.invert = azimuthalInvert(atan);
function gnomonic_default() {
  return projection(gnomonicRaw).scale(144.049).clipAngle(60);
}

// node_modules/d3-geo/src/projection/naturalEarth1.js
function naturalEarth1Raw(lambda, phi) {
  var phi2 = phi * phi, phi4 = phi2 * phi2;
  return [
    lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (3971e-6 * phi2 - 1529e-6 * phi4))),
    phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4)))
  ];
}
naturalEarth1Raw.invert = function(x, y) {
  var phi = y, i = 25, delta;
  do {
    var phi2 = phi * phi, phi4 = phi2 * phi2;
    phi -= delta = (phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4))) - y) / (1.007226 + phi2 * (0.015085 * 3 + phi4 * (-0.044475 * 7 + 0.028874 * 9 * phi2 - 5916e-6 * 11 * phi4)));
  } while (abs(delta) > epsilon && --i > 0);
  return [
    x / (0.8707 + (phi2 = phi * phi) * (-0.131979 + phi2 * (-0.013791 + phi2 * phi2 * phi2 * (3971e-6 - 1529e-6 * phi2)))),
    phi
  ];
};
function naturalEarth1_default() {
  return projection(naturalEarth1Raw).scale(175.295);
}

// node_modules/d3-geo/src/projection/orthographic.js
function orthographicRaw(x, y) {
  return [cos(y) * sin(x), sin(y)];
}
orthographicRaw.invert = azimuthalInvert(asin);
function orthographic_default() {
  return projection(orthographicRaw).scale(249.5).clipAngle(90 + epsilon);
}

// node_modules/d3-geo/src/projection/stereographic.js
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

// node_modules/d3-geo/src/projection/transverseMercator.js
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

// node_modules/d3-geo-projection/src/math.js
var abs2 = Math.abs;
var cos2 = Math.cos;
var floor = Math.floor;
var max = Math.max;
var min = Math.min;
var sign2 = Math.sign || function(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};
var sin2 = Math.sin;
var tan2 = Math.tan;
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

// node_modules/d3-geo-projection/src/aitoff.js
function aitoffRaw(x, y) {
  var cosy = cos2(y), sincia = sinci(acos2(cosy * cos2(x /= 2)));
  return [2 * cosy * sin2(x) * sincia, sin2(y) * sincia];
}
aitoffRaw.invert = function(x, y) {
  if (x * x + 4 * y * y > pi2 * pi2 + epsilon3) return;
  var x12 = x, y12 = y, i = 25;
  do {
    var sinx = sin2(x12), sinx_2 = sin2(x12 / 2), cosx_2 = cos2(x12 / 2), siny = sin2(y12), cosy = cos2(y12), sin_2y = sin2(2 * y12), sin2y = siny * siny, cos2y = cosy * cosy, sin2x_2 = sinx_2 * sinx_2, c = 1 - cos2y * cosx_2 * cosx_2, e = c ? acos2(cosy * cosx_2) * sqrt3(f = 1 / c) : f = 0, f, fx = 2 * e * cosy * sinx_2 - x, fy = e * siny - y, dxdx = f * (cos2y * sin2x_2 + e * cosy * cosx_2 * sin2y), dxdy = f * (0.5 * sinx * sin_2y - e * 2 * siny * sinx_2), dydx = f * 0.25 * (sin_2y * sinx_2 - e * siny * cos2y * sinx), dydy = f * (sin2y * cosx_2 + e * sin2x_2 * cosy), z = dxdy * dydx - dydy * dxdx;
    if (!z) break;
    var dx = (fy * dxdy - fx * dydy) / z, dy = (fx * dydx - fy * dxdx) / z;
    x12 -= dx, y12 -= dy;
  } while ((abs2(dx) > epsilon3 || abs2(dy) > epsilon3) && --i > 0);
  return [x12, y12];
};

// node_modules/d3-geo-projection/src/mollweide.js
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

// node_modules/d3-geo-projection/src/parallel1.js
function parallel1_default(projectAt) {
  var phi0 = 0, m = projectionMutator(projectAt), p = m(phi0);
  p.parallel = function(_) {
    return arguments.length ? m(phi0 = _ * radians2) : phi0 * degrees2;
  };
  return p;
}

// node_modules/d3-geo-projection/src/sinusoidal.js
function sinusoidalRaw(lambda, phi) {
  return [lambda * cos2(phi), phi];
}
sinusoidalRaw.invert = function(x, y) {
  return [x / cos2(y), y];
};
function sinusoidal_default() {
  return projection(sinusoidalRaw).scale(152.63);
}

// node_modules/d3-geo-projection/src/cylindricalEqualArea.js
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

// node_modules/d3-geo-projection/src/polyconic.js
function polyconicRaw(lambda, phi) {
  if (abs2(phi) < epsilon3) return [lambda, 0];
  var tanPhi = tan2(phi), k = lambda * sin2(phi);
  return [
    sin2(k) / tanPhi,
    phi + (1 - cos2(k)) / tanPhi
  ];
}
polyconicRaw.invert = function(x, y) {
  if (abs2(y) < epsilon3) return [x, 0];
  var k = x * x + y * y, phi = y * 0.5, i = 10, delta;
  do {
    var tanPhi = tan2(phi), secPhi = 1 / cos2(phi), j = k - 2 * y * phi + phi * phi;
    phi -= delta = (tanPhi * j + 2 * (phi - y)) / (2 + j * secPhi * secPhi + 2 * (phi - y) * tanPhi);
  } while (abs2(delta) > epsilon3 && --i > 0);
  tanPhi = tan2(phi);
  return [
    (abs2(y) < abs2(phi + 1 / tanPhi) ? asin2(x * tanPhi) : sign2(y) * sign2(x) * (acos2(abs2(x * tanPhi)) + halfPi2)) / sin2(phi),
    phi
  ];
};
function polyconic_default() {
  return projection(polyconicRaw).scale(103.74);
}

// node_modules/d3-geo-projection/src/robinson.js
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

// node_modules/d3-geo-projection/src/winkel3.js
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

// node_modules/topojson-client/src/identity.js
function identity_default2(x) {
  return x;
}

// node_modules/topojson-client/src/transform.js
function transform_default(transform) {
  if (transform == null) return identity_default2;
  var x05, y05, kx = transform.scale[0], ky = transform.scale[1], dx = transform.translate[0], dy = transform.translate[1];
  return function(input, i) {
    if (!i) x05 = y05 = 0;
    var j = 2, n = input.length, output = new Array(n);
    output[0] = (x05 += input[0]) * kx + dx;
    output[1] = (y05 += input[1]) * ky + dy;
    while (j < n) output[j] = input[j], ++j;
    return output;
  };
}

// node_modules/topojson-client/src/reverse.js
function reverse_default(array, n) {
  var t, j = array.length, i = j - n;
  while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
}

// node_modules/topojson-client/src/feature.js
function feature_default(topology, o) {
  if (typeof o === "string") o = topology.objects[o];
  return o.type === "GeometryCollection" ? { type: "FeatureCollection", features: o.geometries.map(function(o2) {
    return feature(topology, o2);
  }) } : feature(topology, o);
}
function feature(topology, o) {
  var id = o.id, bbox = o.bbox, properties = o.properties == null ? {} : o.properties, geometry = object(topology, o);
  return id == null && bbox == null ? { type: "Feature", properties, geometry } : bbox == null ? { type: "Feature", id, properties, geometry } : { type: "Feature", id, bbox, properties, geometry };
}
function object(topology, o) {
  var transformPoint = transform_default(topology.transform), arcs = topology.arcs;
  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
      points.push(transformPoint(a[k], k));
    }
    if (i < 0) reverse_default(points, n);
  }
  function point(p) {
    return transformPoint(p);
  }
  function line(arcs2) {
    var points = [];
    for (var i = 0, n = arcs2.length; i < n; ++i) arc(arcs2[i], points);
    if (points.length < 2) points.push(points[0]);
    return points;
  }
  function ring(arcs2) {
    var points = line(arcs2);
    while (points.length < 4) points.push(points[0]);
    return points;
  }
  function polygon(arcs2) {
    return arcs2.map(ring);
  }
  function geometry(o2) {
    var type = o2.type, coordinates;
    switch (type) {
      case "GeometryCollection":
        return { type, geometries: o2.geometries.map(geometry) };
      case "Point":
        coordinates = point(o2.coordinates);
        break;
      case "MultiPoint":
        coordinates = o2.coordinates.map(point);
        break;
      case "LineString":
        coordinates = line(o2.arcs);
        break;
      case "MultiLineString":
        coordinates = o2.arcs.map(line);
        break;
      case "Polygon":
        coordinates = polygon(o2.arcs);
        break;
      case "MultiPolygon":
        coordinates = o2.arcs.map(polygon);
        break;
      default:
        return null;
    }
    return { type, coordinates };
  }
  return geometry(o);
}

// src/assets/land-110m.json
var land_110m_default = { type: "Topology", objects: { land: { type: "GeometryCollection", geometries: [{ type: "MultiPolygon", arcs: [[[0]], [[1]], [[2]], [[3]], [[4]], [[5]], [[6]], [[7]], [[8]], [[9]], [[10]], [[11]], [[12]], [[13]], [[14]], [[15]], [[16, 18]], [[19]], [[20]], [[21]], [[22]], [[23]], [[24]], [[25]], [[26]], [[27]], [[28]], [[29]], [[30]], [[31]], [[32]], [[33]], [[34]], [[35]], [[36]], [[37]], [[38]], [[39]], [[40]], [[41]], [[42]], [[43]], [[44]], [[45]], [[46]], [[47]], [[48]], [[49]], [[50]], [[51]], [[52]], [[53]], [[54]], [[55]], [[56]], [[57]], [[58]], [[59]], [[60]], [[61]], [[62]], [[63]], [[64]], [[65]], [[66]], [[67]], [[68]], [[69]], [[70]], [[71]], [[72]], [[73]], [[74]], [[75]], [[76]], [[77]], [[78]], [[79]], [[80]], [[81]], [[82]], [[83]], [[84]], [[85]], [[86]], [[87]], [[88]], [[89]], [[90]], [[91]], [[92, 115], [114]], [[94]], [[95]], [[96]], [[97]], [[98]], [[99]], [[100]], [[101]], [[102]], [[103]], [[104]], [[105]], [[106]], [[107]], [[108]], [[109]], [[110]], [[111]], [[112]], [[113]], [[116]], [[117]], [[118]], [[119]], [[120]], [[121]], [[122]], [[123]], [[124]], [[125]], [[126]], [[127]], [[128]], [[129]]] }] } }, arcs: [[[33452, 3290], [-82, -301], [-81, -266], [-582, 81], [-621, -35], [-348, 197], [0, 23], [-152, 174], [625, -23], [599, -58], [207, 243], [147, 208], [288, -243]], [[5775, 3611], [-533, -81], [-364, 208], [-163, 209], [-11, 35], [-180, 162], [169, 220], [517, -93], [277, -185], [212, -209], [76, -266]], [[37457, 4468], [342, -255], [120, -359], [33, -254], [11, -301], [-430, -186], [-452, -150], [-522, -139], [-582, -116], [-658, 35], [-365, 197], [49, 243], [593, 162], [239, 197], [174, 254], [126, 220], [168, 209], [180, 243], [141, 0], [414, 127], [419, -127]], [[16330, 7154], [359, -93], [332, 104], [-158, -208], [-261, -151], [-386, 47], [-278, 208], [60, 197], [332, -104]], [[15122, 7165], [425, -231], [-164, 23], [-359, 58], [-381, 162], [202, 127], [277, -139]], [[22505, 8080], [305, -81], [304, 69], [163, -335], [-217, 46], [-337, -23], [-343, 23], [-376, -35], [-283, 116], [-146, 243], [174, 104], [353, -81], [403, -46]], [[30985, 8657], [33, -266], [-49, -231], [-76, -220], [-326, -81], [-311, -116], [-364, 11], [136, 232], [-327, -81], [-310, -81], [-212, 174], [-16, 243], [305, 231], [190, 70], [321, -23], [82, 301], [16, 219], [-6, 475], [158, 278], [256, 93], [147, -220], [65, -220], [120, -267], [92, -254], [76, -267]], [[0, 529], [16, -5], [245, 344], [501, -185], [32, 21], [78, 49], [94, 61], [81, 52], [41, 26], [41, -1], [29, -10], [402, -246], [352, 246], [63, 34], [816, 104], [265, -138], [130, -71], [419, -196], [789, -151], [625, -185], [1072, -139], [800, 162], [1181, -116], [669, -185], [734, 174], [773, 162], [60, 278], [-1094, 23], [-898, 139], [-234, 231], [-745, 128], [49, 266], [103, 243], [104, 220], [-55, 243], [-462, 162], [-212, 209], [-430, 185], [675, -35], [642, 93], [402, -197], [495, 173], [457, 220], [223, 197], [-98, 243], [-359, 162], [-408, 174], [-571, 35], [-500, 81], [-539, 58], [-180, 220], [-359, 185], [-217, 208], [-87, 672], [136, -58], [250, -185], [457, 58], [441, 81], [228, -255], [441, 58], [370, 127], [348, 162], [315, 197], [419, 58], [-11, 220], [-97, 220], [81, 208], [359, 104], [163, -196], [425, 115], [321, 151], [397, 12], [375, 57], [376, 139], [299, 128], [337, 127], [218, -35], [190, -46], [414, 81], [370, -104], [381, 11], [364, 81], [375, -57], [414, -58], [386, 23], [403, -12], [413, -11], [381, 23], [283, 174], [337, 92], [349, -127], [331, 104], [300, 208], [179, -185], [98, -208], [180, -197], [288, 174], [332, -220], [375, -70], [321, -162], [392, 35], [354, 104], [418, -23], [376, -81], [381, -104], [147, 254], [-180, 197], [-136, 209], [-359, 46], [-158, 220], [-60, 220], [-98, 440], [213, -81], [364, -35], [359, 35], [327, -93], [283, -174], [119, -208], [376, -35], [359, 81], [381, 116], [342, 70], [283, -139], [370, 46], [239, 451], [224, -266], [321, -104], [348, 58], [228, -232], [365, -23], [337, -69], [332, -128], [218, 220], [108, 209], [278, -232], [381, 58], [283, -127], [190, -197], [370, 58], [288, 127], [283, 151], [337, 81], [392, 69], [354, 81], [272, 127], [163, 186], [65, 254], [-32, 244], [-87, 231], [-98, 232], [-87, 231], [-71, 209], [-16, 231], [27, 232], [130, 220], [109, 243], [44, 231], [-55, 255], [-32, 232], [136, 266], [152, 173], [180, 220], [190, 186], [223, 173], [109, 255], [152, 162], [174, 151], [267, 34], [174, 186], [196, 115], [228, 70], [202, 150], [157, 186], [218, 69], [163, -151], [-103, -196], [-283, -174], [-120, -127], [-206, 92], [-229, -58], [-190, -139], [-202, -150], [-136, -174], [-38, -231], [17, -220], [130, -197], [-190, -139], [-261, -46], [-153, -197], [-163, -185], [-174, -255], [-44, -220], [98, -243], [147, -185], [229, -139], [212, -185], [114, -232], [60, -220], [82, -232], [130, -196], [82, -220], [38, -544], [81, -220], [22, -232], [87, -231], [-38, -313], [-152, -243], [-163, -197], [-370, -81], [-125, -208], [-169, -197], [-419, -220], [-370, -93], [-348, -127], [-376, -128], [-223, -243], [-446, -23], [-489, 23], [-441, -46], [-468, 0], [87, -232], [424, -104], [311, -162], [174, -208], [-310, -185], [-479, 58], [-397, -151], [-17, -243], [-11, -232], [327, -196], [60, -220], [353, -220], [588, -93], [500, -162], [398, -185], [506, -186], [690, -92], [681, -162], [473, -174], [517, -197], [272, -278], [136, -220], [337, 209], [457, 173], [484, 186], [577, 150], [495, 162], [691, 12], [680, -81], [560, -139], [180, 255], [386, 173], [702, 12], [550, 127], [522, 128], [577, 81], [614, 104], [430, 150], [-196, 209], [-119, 208], [0, 220], [-539, -23], [-571, -93], [-544, 0], [-77, 220], [39, 440], [125, 128], [397, 138], [468, 139], [337, 174], [337, 174], [251, 231], [380, 104], [376, 81], [190, 47], [430, 23], [408, 81], [343, 116], [337, 139], [305, 139], [386, 185], [245, 197], [261, 173], [82, 232], [-294, 139], [98, 243], [185, 185], [288, 116], [305, 139], [283, 185], [217, 232], [136, 277], [202, 163], [331, -35], [136, -197], [332, -23], [11, 220], [142, 231], [299, -58], [71, -220], [331, -34], [360, 104], [348, 69], [315, -34], [120, -243], [305, 196], [283, 105], [315, 81], [310, 81], [283, 139], [310, 92], [240, 128], [168, 208], [207, -151], [288, 81], [202, -277], [157, -209], [316, 116], [125, 232], [283, 162], [365, -35], [108, -220], [229, 220], [299, 69], [326, 23], [294, -11], [310, -70], [300, -34], [130, -197], [180, -174], [304, 104], [327, 24], [315, 0], [310, 11], [278, 81], [294, 70], [245, 162], [261, 104], [283, 58], [212, 162], [152, 324], [158, 197], [288, -93], [109, -208], [239, -139], [289, 46], [196, -208], [206, -151], [283, 139], [98, 255], [250, 104], [289, 197], [272, 81], [326, 116], [218, 127], [228, 139], [218, 127], [261, -69], [250, 208], [180, 162], [261, -11], [229, 139], [54, 208], [234, 162], [228, 116], [278, 93], [256, 46], [244, -35], [262, -58], [223, -162], [27, -254], [245, -197], [168, -162], [332, -70], [185, -162], [229, -162], [266, -35], [223, 116], [240, 243], [261, -127], [272, -70], [261, -69], [272, -46], [277, 0], [229, -614], [-11, -150], [-33, -267], [-266, -150], [-218, -220], [38, -232], [310, 12], [-38, -232], [-141, -220], [-131, -243], [212, -185], [321, -58], [321, 104], [153, 232], [92, 220], [153, 185], [174, 174], [70, 208], [147, 289], [174, 58], [316, 24], [277, 69], [283, 93], [136, 231], [82, 220], [190, 220], [272, 151], [234, 115], [153, 197], [157, 104], [202, 93], [277, -58], [250, 58], [272, 69], [305, -34], [201, 162], [142, 393], [103, -162], [131, -278], [234, -115], [266, -47], [267, 70], [283, -46], [261, -12], [174, 58], [234, -35], [212, -127], [250, 81], [300, 0], [255, 81], [289, -81], [185, 197], [141, 196], [191, 163], [348, 439], [179, -81], [212, -162], [185, -208], [354, -359], [272, -12], [256, 0], [299, 70], [299, 81], [229, 162], [190, 174], [310, 23], [207, 127], [218, -116], [141, -185], [196, -185], [305, 23], [190, -150], [332, -151], [348, -58], [288, 47], [218, 185], [185, 185], [250, 46], [251, -81], [288, -58], [261, 93], [250, 0], [245, -58], [256, -58], [250, 104], [299, 93], [283, 23], [316, 0], [255, 58], [251, 46], [76, 290], [11, 243], [174, -162], [49, -266], [92, -244], [115, -196], [234, -105], [315, 35], [365, 12], [250, 35], [364, 0], [262, 11], [364, -23], [310, -46], [196, -186], [-54, -220], [179, -173], [299, -139], [310, -151], [360, -104], [375, -92], [283, -93], [315, -12], [180, 197], [245, -162], [212, -185], [245, -139], [337, -58], [321, -69], [136, -232], [316, -139], [212, -208], [310, -93], [321, 12], [299, -35], [332, 12], [332, -47], [310, -81], [288, -139], [289, -116], [195, -173], [-32, -232], [-147, -208], [-125, -266], [-98, -209], [-131, -243], [-364, -93], [-163, -208], [-360, -127], [-125, -232], [-190, -220], [-201, -185], [-115, -243], [-70, -220], [-28, -266], [6, -220], [158, -232], [60, -220], [130, -208], [517, -81], [109, -255], [-501, -93], [-424, -127], [-528, -23], [-234, -336], [-49, -278], [-119, -220], [-147, -220], [370, -196], [141, -244], [239, -219], [338, -197], [386, -186], [419, -185], [636, -185], [142, -289], [800, -128], [53, -45], [208, -175], [767, 151], [636, -186], [-99520, -142]], [[31180, 18764], [361, -355], [389, -147], [-125, -296], [-264, -29], [-141, 208], [-92, -239], [-238, -183], [-301, 67], [-202, 177], [-291, 86], [-350, 330], [-283, 317], [-383, 662], [229, -124], [390, -395], [369, -212], [143, 271], [90, 405], [256, 244], [198, -70], [106, -274], [139, -443]], [[33736, 20389], [222, -266], [-83, -207], [-375, -177], [-125, 207], [-236, -266], [-139, 266], [333, 354], [236, -148], [167, 237]], [[69522, 21210], [-427, -38], [-7, 314], [41, 244], [19, 121], [179, -186], [263, -74], [9, -112], [-77, -269]], [[90387, 26479], [269, -204], [151, 81], [217, 113], [166, -39], [20, -702], [-95, -203], [-29, -476], [-97, 162], [-193, -412], [-57, 32], [-171, 19], [-171, 505], [-38, 390], [-160, 515], [7, 271], [181, -52]], [[98060, 26404], [63, -244], [198, 239], [80, -249], [0, -249], [-103, -274], [-182, -435], [-142, -238], [103, -284], [-214, -7], [-238, -223], [-75, -387], [-157, -597], [-219, -264], [-138, -169], [-256, 13], [-180, 194], [-302, 42], [-46, 217], [149, 438], [349, 583], [179, 111], [200, 225], [238, 310], [167, 306], [123, 441], [106, 149], [41, 330], [195, 273], [61, -251]], [[98502, 29218], [202, -622], [5, 403], [126, -161], [41, -447], [224, -192], [188, -48], [158, 226], [141, -69], [-67, -524], [-85, -345], [-212, 12], [-74, -179], [26, -254], [-41, -110], [-105, -319], [-138, -404], [-214, -236], [-48, 155], [-116, 85], [160, 486], [-91, 326], [-299, 236], [8, 214], [201, 206], [47, 455], [-13, 382], [-113, 396], [8, 104], [-133, 244], [-218, 523], [-117, 418], [104, 46], [151, -328], [216, -153], [78, -526]], [[96421, 37487], [-105, -142], [-153, 160], [-199, 266], [-179, 313], [-184, 416], [-38, 201], [119, -9], [156, -201], [122, -200], [89, -166], [228, -366], [144, -272]], [[99547, 40335], [96, -171], [-46, -308], [-172, -81], [-153, 73], [-27, 260], [107, 203], [126, -74], [69, 98]], [[0, 40798], [99822, -145], [-177, -124], [-36, 220], [139, 121], [88, 33], [-99836, 184]], [[0, 41087], [0, -289]], [[0, 41087], [57, 27], [-34, -284], [-23, -32]], [[96623, 40851], [-92, -78], [-93, 259], [10, 158], [175, -339]], [[96418, 41756], [45, -476], [-75, 74], [-58, -32], [-39, 163], [-6, 453], [133, -182]], [[63904, 42571], [45, -711], [72, -276], [-28, -284], [-49, -174], [-94, 347], [-53, -175], [53, -438], [-24, -250], [-77, -137], [-18, -500], [-109, -689], [-137, -814], [-172, -1120], [-106, -821], [-125, -685], [-226, -140], [-243, -250], [-160, 151], [-220, 211], [-77, 312], [-18, 524], [-98, 471], [-26, 425], [50, 426], [128, 102], [1, 197], [133, 447], [25, 377], [-65, 280], [-52, 372], [-23, 544], [97, 331], [38, 375], [138, 22], [155, 121], [103, 107], [122, 7], [158, 337], [229, 364], [83, 297], [-38, 253], [118, -71], [153, 410], [6, 356], [92, 264], [96, -254], [74, -251], [69, -390]], [[89877, 42448], [100, -464], [179, 223], [92, -250], [133, -231], [-29, -262], [60, -506], [42, -295], [70, -72], [75, -505], [-27, -307], [90, -400], [301, -309], [197, -281], [186, -257], [-37, -143], [159, -371], [108, -639], [111, 130], [113, -256], [68, 91], [48, -626], [197, -363], [129, -226], [217, -478], [78, -475], [7, -337], [-19, -365], [132, -502], [-16, -523], [-48, -274], [-75, -527], [6, -339], [-55, -423], [-123, -538], [-205, -290], [-102, -458], [-93, -292], [-82, -510], [-107, -294], [-70, -442], [-36, -407], [14, -187], [-159, -205], [-311, -22], [-257, -242], [-127, -229], [-168, -254], [-230, 262], [-170, 104], [43, 308], [-152, -112], [-243, -428], [-240, 160], [-158, 94], [-159, 42], [-269, 171], [-179, 364], [-52, 449], [-64, 298], [-137, 240], [-267, 71], [91, 287], [-67, 438], [-136, -408], [-247, -109], [146, 327], [42, 341], [107, 289], [-22, 438], [-226, -504], [-174, -202], [-106, -470], [-217, 243], [9, 313], [-174, 429], [-147, 221], [52, 137], [-356, 358], [-195, 17], [-267, 287], [-498, -56], [-359, -211], [-317, -197], [-265, 39], [-294, -303], [-241, -137], [-53, -309], [-103, -240], [-236, -15], [-174, -52], [-246, 107], [-199, -64], [-191, -27], [-165, -315], [-81, 26], [-140, -167], [-133, -187], [-203, 23], [-186, 0], [-295, 377], [-149, 113], [6, 338], [138, 81], [47, 134], [-10, 212], [34, 411], [-31, 350], [-147, 598], [-45, 337], [12, 336], [-111, 385], [-7, 174], [-123, 235], [-35, 463], [-158, 467], [-39, 252], [122, -255], [-93, 548], [137, -171], [83, -229], [-5, 303], [-138, 465], [-26, 186], [-65, 177], [31, 341], [56, 146], [38, 295], [-29, 346], [114, 425], [21, -450], [118, 406], [225, 198], [136, 252], [212, 217], [126, 46], [77, -73], [219, 220], [168, 66], [42, 129], [74, 54], [153, -14], [292, 173], [151, 262], [71, 316], [163, 300], [13, 236], [7, 321], [194, 502], [117, -510], [119, 118], [-99, 279], [87, 287], [122, -128], [34, 449], [152, 291], [67, 233], [140, 101], [4, 165], [122, -69], [5, 148], [122, 85], [134, 80], [205, -271], [155, -350], [173, -4], [177, -56], [-59, 325], [133, 473], [126, 155], [-44, 147], [121, 338], [168, 208], [142, -70], [234, 111], [-5, 302], [-204, 195], [148, 86], [184, -147], [148, -242], [234, -151], [79, 60], [172, -182], [162, 169], [105, -51], [65, 113], [127, -292], [-74, -316], [-105, -239], [-96, -20], [32, -236], [-81, -295], [-99, -291], [20, -166], [221, -327], [214, -189], [143, -204], [201, -350], [78, 1], [145, -151], [43, -183], [265, -200], [183, 202], [55, 317], [56, 262], [34, 324], [85, 470], [-39, 286], [20, 171], [-32, 339], [37, 445], [53, 120], [-43, 197], [67, 313], [52, 325], [7, 168], [104, 222], [78, -289], [19, -371], [70, -71], [11, -249], [101, -300], [21, -335], [-10, -214]], [[95032, 44386], [78, -203], [-194, 4], [-106, 363], [166, -142], [56, -22]], [[83531, 44530], [-117, -11], [-368, 414], [259, 116], [146, -180], [97, -180], [-17, -159]], [[94680, 44747], [-108, -14], [-170, 60], [-58, 91], [17, 235], [183, -93], [91, -124], [45, -155]], [[94910, 44908], [-42, -109], [-206, 512], [-57, 353], [94, 0], [100, -473], [111, -283]], [[84565, 44589], [-238, -130], [-33, 71], [25, 201], [119, 360], [275, 235], [32, 139], [239, 133], [194, 20], [87, 74], [105, -74], [-102, -160], [-289, -258], [-233, -170], [-181, -441]], [[82749, 45797], [100, -158], [172, 48], [69, -251], [-321, -119], [-193, -79], [-149, 5], [95, 340], [153, 5], [74, 209]], [[84139, 45797], [-41, -328], [-417, -168], [-370, 73], [0, 216], [220, 123], [174, -177], [185, 45], [249, 216]], [[94409, 45654], [12, -119], [-218, 251], [-152, 212], [-104, 197], [41, 60], [128, -142], [228, -272], [65, -187]], [[93760, 46238], [-56, -33], [-121, 134], [-114, 243], [14, 99], [166, -250], [111, -193]], [[80172, 46575], [533, -59], [61, 244], [515, -284], [101, -383], [417, -108], [341, -351], [-317, -225], [-306, 238], [-251, -16], [-288, 44], [-260, 106], [-322, 225], [-204, 59], [-116, -74], [-506, 243], [-48, 254], [-255, 44], [191, 564], [337, -35], [224, -231], [115, -45], [38, -210]], [[87423, 46908], [-143, -402], [-27, 445], [49, 212], [58, 200], [63, -173], [0, -282]], [[93299, 46550], [-78, -59], [-120, 227], [-122, 375], [-59, 450], [38, 57], [30, -175], [84, -134], [135, -375], [131, -200], [-39, -166]], [[92217, 47343], [-146, -48], [-44, -166], [-152, -144], [-142, -138], [-148, 1], [-228, 171], [-158, 165], [23, 183], [249, -86], [152, 46], [42, 283], [40, 15], [27, -314], [158, 45], [78, 202], [155, 211], [-30, 348], [166, 11], [56, -97], [-5, -327], [-93, -361]], [[85346, 48536], [-104, -196], [-192, 108], [-54, 254], [281, 29], [69, -195]], [[86241, 48752], [101, -452], [-234, 244], [-232, 49], [-157, -39], [-192, 21], [65, 325], [344, 24], [305, -172]], [[92538, 47921], [-87, -157], [-52, 348], [-65, 229], [-126, 193], [-158, 252], [-200, 174], [77, 143], [150, -166], [94, -130], [117, -142], [111, -248], [106, -189], [33, -307]], [[87261, 49899], [78, -955], [287, -354], [232, 627], [319, 356], [247, 1], [238, -206], [206, -212], [298, -113], [482, -407], [513, -338], [192, -302], [154, -297], [43, -349], [462, -365], [68, -313], [-256, -64], [62, -393], [248, -388], [180, -627], [159, 20], [-11, -262], [215, -100], [-84, -111], [295, -249], [-30, -171], [-184, -41], [-69, 153], [-238, 66], [-281, 89], [-216, 377], [-158, 325], [-144, 517], [-362, 259], [-235, -169], [-170, -195], [35, -436], [-218, -203], [-155, 99], [-288, 25], [-247, 485], [-282, 118], [-69, -168], [-352, -18], [118, 481], [175, 164], [-72, 642], [-134, 496], [-538, 500], [-229, 50], [-417, 546], [-82, -287], [-107, -52], [-63, 216], [-1, 257], [-212, 290], [299, 213], [198, -11], [-23, 156], [-407, 1], [-110, 352], [-248, 109], [-117, 293], [374, 143], [142, 192], [446, -242], [44, -220]], [[84788, 51419], [-223, -587], [-209, -113], [-267, 115], [-463, -29], [-243, -85], [-39, -447], [248, -526], [150, 268], [518, 201], [-22, -272], [-121, 86], [-121, -347], [-245, -229], [263, -757], [-50, -203], [249, -682], [-2, -388], [-148, -173], [-109, 207], [134, 484], [-273, -229], [-69, 164], [36, 228], [-200, 346], [21, 576], [-186, -179], [24, -689], [11, -846], [-176, -85], [-119, 173], [79, 544], [-43, 570], [-117, 4], [-86, 405], [115, 387], [40, 469], [139, 891], [58, 243], [237, 439], [217, -174], [350, -82], [319, 25], [275, 429], [48, -132]], [[85746, 51249], [-15, -517], [-143, 58], [-42, -359], [114, -312], [-78, -71], [-112, 374], [-82, 755], [56, 472], [92, 215], [20, -322], [164, -52], [26, -241]], [[79393, 47122], [-308, -12], [-234, 494], [-356, 482], [-119, 358], [-210, 481], [-138, 443], [-212, 827], [-244, 493], [-81, 508], [-103, 461], [-250, 372], [-145, 506], [-209, 330], [-290, 652], [-24, 300], [178, -24], [430, -114], [246, -577], [215, -401], [153, -246], [263, -635], [283, -9], [233, -405], [161, -495], [211, -270], [-111, -482], [159, -205], [100, -15], [47, -412], [97, -330], [204, -52], [135, -374], [-70, -735], [-11, -914]], [[82742, 51659], [312, -546], [-329, -70], [-93, -403], [12, -535], [-267, -404], [-7, -589], [-107, -903], [-41, 210], [-316, -266], [-110, 361], [-198, 34], [-139, 189], [-330, -212], [-101, 285], [-182, -32], [-229, 68], [-43, 793], [-138, 164], [-134, 505], [-38, 517], [32, 548], [165, 392], [204, -202], [214, 110], [56, 500], [119, 112], [333, 128], [199, 467], [137, 374], [110, 221], [236, 323], [214, 411], [140, 462], [112, 2], [143, -299], [13, -257], [183, -165], [231, -177], [-20, -232], [-186, -29], [50, -289], [-205, -201], [-158, -533], [204, -560], [-48, -272]], [[85104, 55551], [28, -392], [16, -332], [-94, -540], [-102, 602], [-130, -300], [89, -435], [-79, -277], [-327, 343], [-78, 428], [84, 280], [-176, 280], [-87, -245], [-131, 23], [-205, -330], [-46, 173], [109, 498], [175, 166], [151, 223], [98, -268], [212, 162], [45, 264], [196, 15], [-16, 457], [225, -280], [23, -297], [20, -218]], [[72560, 54241], [-242, -135], [-132, 470], [-49, 849], [126, 959], [192, -328], [129, -416], [134, -616], [-42, -615], [-116, -168]], [[33073, 56553], [-232, -65], [-50, 53], [81, 163], [-6, 233], [160, 77], [58, -21], [-11, -440]], [[84439, 56653], [-100, -195], [-87, -373], [-87, -175], [-171, 409], [57, 158], [70, 165], [30, 367], [153, 35], [-44, -398], [205, 570], [-26, -563]], [[82917, 56084], [-369, -561], [136, 414], [200, 364], [167, 409], [146, 587], [49, -482], [-183, -325], [-146, -406]], [[83856, 57606], [166, -183], [177, 1], [-5, -247], [-129, -251], [-176, -178], [-10, 275], [20, 301], [-43, 282]], [[84861, 57766], [78, -660], [-214, 157], [5, -199], [68, -364], [-132, -133], [-11, 416], [-84, 31], [-43, 357], [163, -47], [-4, 224], [-169, 451], [266, -13], [77, -220]], [[83757, 58301], [-74, -510], [-119, 295], [-142, 450], [238, -22], [97, -213]], [[83700, 61512], [171, -168], [85, 153], [26, -150], [-46, -245], [95, -423], [-73, -491], [-164, -196], [-43, -476], [62, -471], [147, -65], [123, 70], [347, -328], [-27, -321], [91, -142], [-29, -272], [-216, 290], [-103, 310], [-71, -217], [-177, 354], [-253, -87], [-138, 130], [14, 244], [87, 151], [-83, 136], [-36, -213], [-137, 340], [-41, 257], [-11, 566], [112, -195], [29, 925], [90, 535], [169, -1]], [[31780, 61349], [-71, -149], [-209, 4], [-163, -21], [-16, 253], [40, 86], [227, -3], [142, -52], [50, -118]], [[28638, 61137], [-84, -99], [-156, 95], [-159, 215], [34, 135], [116, 41], [64, -20], [187, -53], [147, -142], [46, -161], [-195, -11]], [[29839, 62320], [241, -93], [34, 101], [217, -3], [165, -152], [73, 15], [50, -209], [152, 11], [-9, -176], [124, -21], [136, -217], [-103, -240], [-132, 128], [-127, -25], [-92, 28], [-50, -107], [-106, -37], [-43, 144], [-92, -85], [-111, -405], [-71, 94], [-14, 170], [-185, 100], [-131, -41], [-169, 43], [-130, -110], [-149, 184], [24, 190], [256, -82], [210, -47], [100, 131], [-127, 256], [2, 226], [-175, 92], [62, 163], [170, -26]], [[80649, 61615], [-240, -284], [-228, 183], [-8, 509], [137, 267], [304, 166], [159, -14], [62, -226], [-122, -260], [-64, -341]], [[6794, 61855], [-41, -99], [-69, 84], [8, 165], [-46, 216], [14, 65], [48, 97], [-19, 116], [16, 55], [21, -11], [107, -100], [49, -51], [45, -79], [71, -207], [-7, -33], [-108, -126], [-89, -92]], [[6645, 62777], [-94, -43], [-47, 125], [-32, 48], [-3, 37], [27, 50], [99, -56], [73, -90], [-23, -71]], [[6456, 63091], [-9, -63], [-149, 17], [21, 72], [137, -26]], [[6207, 63177], [-15, -34], [-19, 8], [-97, 21], [-35, 133], [-11, 24], [74, 82], [23, -38], [80, -196]], [[5737, 63567], [-33, -58], [-93, 107], [14, 43], [43, 58], [64, -12], [5, -138]], [[27867, 64030], [110, -216], [260, 66], [98, -138], [235, -366], [173, -267], [92, 8], [165, -120], [-20, -167], [205, -24], [210, -242], [-33, -138], [-185, -75], [-187, -29], [-191, 46], [-398, -57], [186, 329], [-113, 154], [-179, 39], [-96, 171], [-66, 336], [-157, -23], [-259, 159], [-83, 124], [-362, 91], [-97, 115], [104, 148], [-273, 30], [-199, -307], [-115, -8], [-40, -144], [-138, -65], [-118, 56], [146, 183], [60, 213], [126, 131], [142, 116], [210, 56], [67, 65], [240, -42], [219, -7], [261, -201]], [[28462, 64617], [-68, -29], [-70, 340], [-104, 171], [60, 375], [84, -23], [97, -491], [1, -343]], [[83659, 64045], [-119, -485], [-146, 499], [-32, 438], [163, 581], [223, 447], [127, -176], [-49, -357], [-167, -947]], [[28383, 66284], [-303, -95], [-19, 219], [130, 47], [184, -18], [8, -153]], [[28611, 66290], [-48, -420], [-51, 75], [4, 309], [-124, 234], [-1, 67], [220, -265]], [[87399, 70756], [35, -203], [-156, -357], [-114, 189], [-143, -137], [-73, -346], [-181, 168], [2, 281], [154, 352], [158, -68], [114, 248], [204, -127]], [[59604, 71655], [-188, -251], [21, -111], [8, -48], [-285, -240], [-136, 77], [-64, 237], [132, 22], [19, 3], [40, 143], [200, -8], [253, 176]], [[56583, 71675], [152, -199], [216, 34], [207, -42], [-7, -103], [151, 71], [-35, -175], [-400, -50], [3, 98], [-339, 115], [52, 251]], [[54311, 73167], [-100, -465], [41, -183], [-58, -303], [-213, 222], [-141, 64], [-387, 300], [38, 304], [325, -54], [284, 64], [211, 51]], [[52558, 74927], [166, -419], [-39, -782], [-126, 38], [-113, -197], [-105, 156], [-11, 713], [-64, 338], [153, -30], [139, 183]], [[89159, 72524], [-104, -472], [48, -296], [-145, -416], [-355, -278], [-488, -36], [-396, -675], [-186, 227], [-12, 442], [-483, -130], [-329, -279], [-325, -11], [282, -435], [-186, -1004], [-179, -248], [-135, 229], [69, 533], [-176, 172], [-113, 405], [263, 182], [145, 371], [280, 306], [203, 403], [553, 177], [297, -121], [291, 1050], [185, -282], [408, 591], [158, 229], [174, 723], [-47, 664], [117, 374], [295, 108], [152, -819], [-9, -479], [-256, -595], [4, -610]], [[52655, 75484], [-92, -456], [-126, 120], [-64, 398], [56, 219], [179, 226], [47, -507]], [[89974, 76679], [195, -126], [197, 250], [62, -663], [-412, -162], [-244, -587], [-436, 404], [-152, -646], [-308, -9], [-39, 587], [138, 455], [296, 33], [81, 817], [83, 460], [326, -615], [213, -198]], [[32315, 78082], [202, -79], [257, 16], [-137, -242], [-102, -38], [-353, 250], [-69, 198], [105, 183], [97, -288]], [[32831, 79592], [-135, -11], [-360, 186], [-258, 279], [96, 49], [365, -148], [284, -247], [8, -108]], [[15692, 79240], [-140, -82], [-456, 269], [-84, 209], [-248, 207], [-50, 168], [-286, 107], [-107, 321], [24, 137], [291, -129], [171, -89], [261, -63], [94, -204], [138, -280], [277, -244], [115, -327]], [[34407, 80527], [-184, -517], [181, 199], [187, -126], [-98, -206], [247, -162], [128, 144], [277, -182], [-86, -433], [194, 101], [36, -313], [86, -367], [-117, -520], [-125, -22], [-183, 111], [60, 484], [-77, 75], [-322, -513], [-166, 21], [196, 277], [-267, 144], [-298, -35], [-539, 18], [-43, 175], [173, 208], [-121, 160], [234, 356], [287, 941], [172, 336], [241, 204], [129, -26], [-54, -160], [-148, -372]], [[13136, 82508], [267, 47], [-84, -671], [242, -475], [-111, 1], [-167, 270], [-103, 272], [-140, 184], [-51, 260], [16, 188], [131, -76]], [[89901, 80562], [280, -1046], [-411, 195], [-171, -854], [271, -605], [-8, -413], [-211, 356], [-182, -457], [-51, 496], [31, 575], [-32, 638], [64, 446], [13, 790], [-163, 581], [24, 808], [257, 271], [-110, 274], [123, 83], [73, -391], [96, -569], [-7, -581], [114, -597]], [[48114, 81456], [-493, -349], [-393, 89], [225, 617], [-145, 601], [378, 463], [210, 276], [233, 24], [298, -365], [-149, -406], [46, -422], [-210, -528]], [[53524, 83435], [-166, -478], [-291, 333], [-39, 246], [408, 195], [88, -296]], [[7498, 84325], [-277, -225], [-142, 152], [-43, 277], [252, 210], [148, 90], [185, -40], [117, -183], [-240, -281]], [[49165, 85222], [-297, -639], [283, 81], [304, -3], [-72, -481], [-250, -530], [287, -38], [270, -759], [190, -95], [171, -673], [79, -233], [337, -113], [-34, -378], [-142, -173], [111, -305], [-250, -310], [-371, 6], [-473, -163], [-130, 116], [-183, -276], [-257, 67], [-195, -226], [-148, 118], [407, 621], [249, 127], [-436, 99], [-79, 235], [291, 183], [-152, 319], [52, 387], [414, -54], [40, 343], [-190, 372], [-337, 104], [-66, 160], [101, 264], [-92, 163], [-149, -279], [-17, 569], [-140, 301], [101, 611], [216, 480], [222, -47], [335, 49]], [[4006, 85976], [-171, -92], [-182, 110], [-168, 161], [274, 101], [220, -54], [27, -226]], [[27981, 87304], [-108, -310], [-123, 50], [-73, 176], [13, 41], [107, 177], [114, -13], [70, -121]], [[27250, 87631], [-325, -326], [-196, 13], [-61, 160], [207, 273], [381, -6], [-6, -114]], [[2297, 88264], [171, -113], [173, 61], [225, -156], [276, -79], [-23, -64], [-211, -125], [-211, 128], [-106, 107], [-245, -34], [-66, 52], [17, 223]], [[26344, 89371], [51, -259], [143, 91], [161, -155], [304, -203], [318, -184], [25, -281], [204, 46], [199, -196], [-247, -186], [-432, 142], [-156, 266], [-275, -314], [-396, -306], [-95, 346], [-377, -57], [242, 292], [35, 465], [95, 542], [201, -49]], [[45969, 89843], [-64, -382], [314, -403], [-361, -451], [-801, -405], [-240, -107], [-365, 87], [-775, 187], [273, 261], [-605, 289], [492, 114], [-12, 174], [-583, 137], [188, 385], [421, 87], [433, -400], [422, 321], [349, -167], [453, 315], [461, -42]], [[28926, 90253], [-312, -30], [-69, 289], [118, 331], [255, 82], [217, -163], [3, -253], [-32, -82], [-180, -174]], [[0, 91325], [681, -451], [728, -588], [-24, -367], [187, -147], [-64, 429], [754, -88], [544, -553], [-276, -257], [-455, -61], [-7, -578], [-111, -122], [-260, 17], [-212, 206], [-369, 172], [-62, 257], [-283, 96], [-315, -76], [-151, 207], [60, 219], [-333, -140], [126, -278], [-158, -251]], [[0, 88971], [0, 2354]], [[23431, 91410], [-173, -207], [-374, 179], [-226, -65], [-380, 266], [245, 183], [194, 256], [295, -168], [166, -106], [84, -112], [169, -226]], [[0, 92833], [99999, -404], [-305, -30], [-49, 187], [-99645, 247]], [[0, 92833], [36, 24], [235, -1], [402, -169], [-24, -81], [-286, -141], [-363, -36], [0, 404]], [[24848, 91640], [-1, -604], [371, 463], [332, -380], [-83, -438], [269, -399], [290, 427], [202, 510], [16, 648], [394, -45], [411, -87], [373, -293], [17, -293], [-207, -315], [196, -316], [-36, -288], [-544, -413], [-386, -91], [-287, 178], [-83, -297], [-268, -498], [-81, -258], [-322, -400], [-397, -39], [-220, -250], [-18, -384], [-323, -74], [-340, -479], [-301, -665], [-108, -466], [-15, -686], [408, -99], [125, -553], [130, -448], [388, 117], [517, -256], [277, -225], [199, -279], [348, -162], [294, -249], [459, -34], [302, -58], [-45, -511], [86, -594], [201, -661], [414, -561], [214, 192], [150, 607], [-145, 934], [-196, 311], [445, 276], [314, 415], [154, 411], [-22, 395], [-189, 502], [-338, 445], [328, 619], [-121, 535], [-93, 922], [194, 137], [476, -161], [286, -57], [230, 155], [258, -200], [342, -343], [85, -229], [495, -45], [-8, -496], [92, -747], [254, -92], [201, -348], [402, 328], [266, 652], [184, 274], [216, -527], [362, -754], [307, -709], [-112, -371], [370, -333], [250, -338], [442, -152], [179, -189], [110, -500], [216, -78], [112, -223], [20, -664], [-202, -222], [-199, -207], [-458, -210], [-349, -486], [-470, -96], [-594, 125], [-417, 4], [-287, -41], [-233, -424], [-354, -262], [-401, -782], [-320, -545], [236, 97], [446, 776], [583, 493], [416, 59], [245, -290], [-262, -397], [88, -637], [91, -446], [361, -295], [459, 86], [278, 664], [19, -429], [180, -214], [-344, -387], [-615, -351], [-276, -239], [-310, -426], [-211, 44], [-11, 500], [483, 488], [-445, -19], [-309, -72], [48, -194], [-296, -286], [-286, -204], [-293, -175], [-159, -386], [-35, -98], [-3, -313], [92, -313], [115, -15], [-29, 216], [83, -131], [-22, -169], [-188, -96], [-133, 12], [-205, -104], [-121, -29], [-162, -29], [-231, -171], [408, 111], [82, -112], [-389, -177], [-177, -1], [8, 72], [-84, -164], [82, -27], [-60, -424], [-203, -455], [-20, 152], [-61, 31], [-91, 147], [57, -318], [66, -106], [8, -222], [-89, -230], [-157, -472], [-25, 24], [86, 402], [-142, 226], [-33, 490], [-53, -255], [59, -375], [-175, 88], [183, -186], [12, -562], [79, -41], [29, -204], [39, -591], [-176, -439], [-288, -175], [-182, -346], [-139, -38], [-141, -217], [-39, -199], [-305, -383], [-157, -281], [-131, -351], [-43, -419], [50, -411], [92, -505], [124, -418], [1, -256], [132, -685], [-9, -398], [-12, -230], [-69, -361], [-83, -74], [-137, 71], [-44, 259], [-106, 136], [-147, 508], [-129, 452], [-42, 231], [57, 393], [-77, 325], [-217, 494], [-108, 91], [-281, -269], [-49, 30], [-135, 276], [-174, 146], [-314, -75], [-247, 66], [-212, -41], [-118, -83], [54, -166], [-5, -240], [59, -117], [-53, -77], [-103, 87], [-104, -112], [-202, 18], [-207, 313], [-242, -74], [-202, 137], [-173, -42], [-234, -138], [-253, -438], [-276, -255], [-152, -282], [-63, -266], [-3, -407], [14, -284], [52, -201], [1, -1], [-1, -1], [-107, -516], [-49, -426], [-20, -791], [-27, -289], [48, -322], [86, -288], [56, -458], [184, -440], [65, -337], [109, -291], [295, -157], [114, -247], [244, 165], [212, 60], [208, 106], [175, 101], [176, 241], [67, 345], [22, 496], [48, 173], [188, 155], [294, 137], [246, -21], [169, 50], [66, -125], [-9, -285], [-149, -351], [-66, -360], [51, -103], [-42, -255], [-69, -461], [-71, 152], [-58, -10], [1, -87], [53, -3], [-5, -160], [-45, -256], [24, -91], [-29, -212], [18, -56], [-32, -299], [-55, -156], [-50, -19], [-55, -205], [90, -107], [24, 88], [82, -75], [29, -23], [61, 104], [79, 8], [26, -48], [43, 29], [129, -53], [128, 16], [90, 65], [32, 66], [89, -31], [66, -40], [73, 14], [55, 51], [127, -82], [44, -13], [85, -110], [80, -132], [101, -91], [73, -162], [-24, -57], [-14, -132], [29, -216], [-64, -202], [-30, -237], [-9, -261], [15, -152], [7, -266], [-43, -58], [-26, -253], [19, -156], [-56, -151], [12, -159], [43, -97], [70, -321], [108, -238], [130, -252], [100, -212], [-6, -125], [111, -27], [26, 48], [77, -145], [136, 42], [119, 150], [168, 119], [95, 176], [153, -34], [-10, -58], [155, -21], [124, -102], [90, -177], [105, -164], [143, -18], [209, 412], [114, 63], [3, 195], [51, 500], [159, 274], [175, 11], [22, 123], [218, -49], [218, 298], [109, 132], [134, 285], [98, -36], [73, -156], [-54, -199], [-8, -139], [-163, -69], [91, -268], [-3, -309], [-123, -343], [105, -469], [120, 38], [62, 427], [-86, 208], [-14, 447], [346, 241], [-38, 278], [97, 186], [100, -415], [195, -9], [180, -330], [11, -195], [249, -6], [297, 61], [159, -264], [213, -73], [155, 184], [4, 149], [344, 35], [333, 9], [-236, -175], [95, -279], [222, -44], [210, -291], [45, -473], [144, 13], [109, -139], [183, -217], [171, -385], [8, -304], [105, -14], [149, -289], [109, -205], [333, -119], [30, 107], [225, 43], [298, -159], [95, -65], [204, -140], [294, -499], [46, -242], [95, 28], [69, -327], [155, -1033], [149, -97], [7, -408], [-208, -487], [86, -178], [491, -92], [10, -593], [211, 388], [349, -212], [462, -361], [135, -346], [-45, -327], [323, 182], [540, -313], [415, 23], [411, -489], [355, -662], [214, -170], [237, -24], [101, -186], [94, -752], [46, -358], [-110, -977], [-142, -385], [-391, -822], [-177, -668], [-206, -513], [-69, -11], [-78, -435], [20, -1107], [-77, -910], [-30, -390], [-88, -233], [-49, -790], [-282, -771], [-47, -610], [-225, -256], [-65, -355], [-302, 2], [-437, -227], [-195, -263], [-311, -173], [-327, -470], [-235, -586], [-41, -441], [46, -326], [-51, -597], [-63, -289], [-195, -325], [-308, -1040], [-244, -468], [-189, -277], [-127, -562], [-183, -337], [-121, -372], [-313, -328], [-205, 118], [-151, -63], [-256, 253], [-189, -19], [-169, 327], [-19, -308], [353, -506], [-38, -408], [173, -257], [-14, -289], [-267, -757], [-412, -317], [-557, -123], [-305, 59], [59, -352], [-57, -442], [51, -298], [-167, -208], [-284, -82], [-267, 216], [-108, -155], [39, -587], [188, -178], [152, 186], [82, -307], [-255, -183], [-223, -367], [-41, -595], [-66, -316], [-262, -2], [-218, -302], [-80, -443], [274, -433], [265, -119], [-96, -531], [-328, -333], [-180, -692], [-254, -234], [-113, -276], [89, -614], [185, -342], [-117, 30], [-247, 4], [-134, -145], [-250, -213], [-45, -552], [-118, -14], [-313, 192], [-318, 412], [-346, 338], [-87, 374], [79, 346], [-140, 393], [-36, 1007], [119, 568], [293, 457], [-422, 172], [265, 522], [94, 982], [309, -208], [145, 1224], [-186, 157], [-87, -738], [-175, 83], [87, 845], [95, 1095], [127, 404], [-79, 576], [-23, 666], [117, 19], [170, 954], [192, 945], [118, 881], [-64, 885], [83, 487], [-34, 730], [163, 721], [50, 1143], [89, 1227], [87, 1321], [-20, 967], [-58, 832], [-279, 340], [-24, 242], [-551, 593], [-498, 646], [-214, 365], [-115, 488], [46, 170], [-236, 775], [-274, 1090], [-262, 1177], [-114, 269], [-87, 435], [-216, 386], [-198, 239], [90, 264], [-134, 563], [86, 414], [221, 373], [148, 442], [-60, 258], [-106, -275], [-166, 259], [56, 167], [-47, 536], [97, 89], [52, 368], [105, 381], [-20, 241], [153, 126], [190, 236], [-37, 183], [103, 44], [-12, 296], [65, 214], [138, 40], [117, 371], [106, 310], [-102, 141], [52, 343], [-62, 540], [59, 155], [-44, 500], [-112, 315], [-93, 170], [-59, 319], [68, 158], [-70, 40], [-52, 195], [-138, 165], [-122, -38], [-56, -205], [-112, -149], [-61, -20], [-27, -123], [132, -321], [-75, -76], [-40, -87], [-130, -30], [-48, 353], [-36, -101], [-92, 35], [-56, 238], [-114, 39], [-72, 69], [-119, -1], [-8, -128], [-32, 89], [-151, 131], [-56, 124], [32, 103], [-11, 130], [-77, 142], [-109, 116], [-95, 76], [-19, 173], [-73, 105], [18, -172], [-55, -141], [-64, 164], [-89, 58], [-38, 120], [2, 179], [36, 187], [-78, 83], [64, 114], [-96, 186], [-130, 238], [-61, 200], [-117, 185], [-140, 267], [31, 92], [46, -89], [21, 41], [-48, 185], [-84, 52], [-31, -140], [-161, 9], [-100, 57], [-115, 117], [-154, 37], [-79, 127], [-142, 103], [-174, 11], [-127, 117], [-149, 244], [-314, 636], [-144, 192], [-226, 154], [-156, -43], [-223, -223], [-140, -58], [-196, 156], [-208, 112], [-260, 271], [-208, 83], [-314, 275], [-233, 282], [-70, 158], [-155, 35], [-284, 187], [-116, 270], [-299, 335], [-139, 373], [-66, 288], [93, 57], [-29, 169], [64, 153], [1, 204], [-93, 266], [-25, 235], [-94, 298], [-244, 587], [-280, 462], [-135, 368], [-238, 241], [-51, 145], [42, 365], [-142, 137], [-164, 288], [-69, 412], [-149, 48], [-162, 311], [-130, 288], [-12, 184], [-149, 446], [-99, 452], [5, 227], [-201, 235], [-93, -26], [-159, 163], [-44, -240], [46, -284], [27, -444], [95, -243], [206, -407], [46, -139], [42, -42], [37, -203], [49, 8], [56, -381], [85, -150], [59, -210], [174, -300], [92, -550], [83, -259], [77, -277], [15, -311], [134, -20], [112, -268], [100, -264], [-6, -106], [-117, -217], [-49, 3], [-74, 359], [-182, 337], [-200, 286], [-142, 150], [9, 432], [-42, 320], [-132, 183], [-191, 264], [-37, -76], [-70, 154], [-171, 143], [-164, 343], [20, 44], [115, -33], [103, 221], [10, 266], [-214, 422], [-163, 163], [-102, 369], [-103, 388], [-129, 472], [-113, 531], [-46, 302], [-180, 340], [-130, 71], [-30, 169], [-156, 30], [-100, 159], [-258, 59], [-70, 95], [-34, 324], [-270, 594], [-231, 821], [10, 137], [-123, 195], [-215, 495], [-38, 482], [-148, 323], [61, 489], [-10, 507], [-89, 453], [109, 557], [67, 1072], [-50, 792], [-88, 506], [-80, 274], [33, 115], [402, -200], [148, -558], [68, 156], [-44, 485], [-94, 484], [-38, 1], [-537, 581], [-199, 255], [-503, 245], [-155, 523], [40, 362], [-356, 252], [-48, 476], [-336, 429], [-6, 304], [-153, 223], [-245, 188], [-78, 515], [-358, 478], [-150, 558], [-267, 38], [-441, 15], [-326, 170], [-574, 613], [-266, 112], [-486, 211], [-385, -50], [-546, 271], [-330, 252], [-309, -125], [58, -411], [-154, -38], [-321, -123], [-245, -199], [-307, -126], [-40, 348], [125, 580], [295, 182], [-76, 148], [-354, -329], [-190, -394], [-400, -420], [203, -287], [-262, -424], [-299, -247], [-278, -181], [-69, -261], [-434, -305], [-87, -278], [-325, -252], [-191, 45], [-259, -165], [-282, -201], [-231, -197], [-477, -169], [-43, 99], [304, 276], [271, 182], [296, 324], [345, 66], [137, 243], [385, 353], [62, 119], [205, 208], [48, 448], [141, 349], [-320, -179], [-90, 102], [-150, -215], [-181, 300], [-75, -212], [-104, 294], [-278, -236], [-170, 0], [-24, 352], [50, 217], [-179, 210], [-361, -113], [-235, 277], [-190, 142], [-1, 334], [-214, 252], [108, 340], [226, 330], [99, 303], [225, 43], [191, -94], [224, 285], [201, -51], [212, 183], [-52, 270], [-155, 106], [205, 228], [-170, -7], [-295, -128], [-85, -131], [-219, 131], [-392, -67], [-407, 142], [-117, 238], [-351, 343], [390, 247], [620, 289], [228, 0], [-38, -295], [586, 22], [-225, 366], [-342, 226], [-197, 295], [-267, 252], [-381, 187], [155, 309], [493, 19], [350, 270], [66, 287], [284, 281], [271, 68], [526, 262], [256, -40], [427, 315], [421, -124], [201, -266], [123, 114], [469, -35], [-16, -136], [425, -101], [283, 59], [585, -186], [534, -56], [214, -77], [370, 96], [421, -177], [302, -83], [518, -142], [438, -284], [289, -55], [244, 247], [336, 184], [413, -72], [416, 259], [455, 148], [191, -245], [207, 138], [62, 278], [192, -63], [470, -530], [369, 401], [38, -448], [341, 96], [105, 173], [337, -34], [424, -248], [650, -217], [383, -100], [272, 38], [375, -300], [-391, -293], [502, -127], [750, 70], [236, 103], [296, -354], [302, 299], [-283, 251], [179, 202], [338, 27], [223, 59], [224, -141], [279, -321], [310, 47], [491, -266], [431, 94], [405, -14], [-32, 367], [247, 103], [431, -200], [-2, -559], [177, 471], [223, -16], [126, 594], [-298, 364], [-324, 239], [22, 653], [329, 429], [366, -95], [281, -261], [378, -666], [-247, -290], [517, -120]], [[18287, 93781], [-139, -277], [618, 179], [386, -298], [314, 302], [254, -194], [227, -580], [140, 244], [-197, 606], [244, 86], [276, -94], [311, -239], [175, -575], [86, -417], [466, -293], [502, -279], [-31, -260], [-456, -48], [178, -227], [-94, -217], [-503, 93], [-478, 160], [-322, -36], [-522, -201], [-824, -103], [-374, -41], [-151, 279], [-379, 161], [-246, -66], [-343, 468], [185, 62], [429, 101], [392, -26], [362, 103], [-537, 138], [-594, -47], [-394, 12], [-146, 217], [644, 237], [-428, -9], [-485, 156], [233, 443], [193, 235], [744, 359], [284, -114]], [[20972, 93958], [-244, -390], [-434, 413], [95, 83], [372, 24], [211, -130]], [[28794, 93770], [25, -163], [-296, 17], [-299, 13], [-304, -80], [-80, 36], [-306, 313], [12, 213], [133, 39], [636, -63], [479, -325]], [[25955, 93803], [219, -369], [256, 477], [704, 242], [477, -611], [-42, -387], [550, 172], [263, 235], [616, -299], [383, -282], [36, -258], [515, 134], [290, -376], [670, -234], [242, -238], [263, -553], [-510, -275], [654, -386], [441, -130], [400, -543], [437, -39], [-87, -414], [-487, -687], [-342, 253], [-437, 568], [-359, -74], [-35, -338], [292, -344], [377, -272], [114, -157], [181, -584], [-96, -425], [-350, 160], [-697, 473], [393, -509], [289, -357], [45, -206], [-753, 236], [-596, 343], [-337, 287], [97, 167], [-414, 304], [-405, 286], [5, -171], [-803, -94], [-235, 203], [183, 435], [522, 10], [571, 76], [-92, 211], [96, 294], [360, 576], [-77, 261], [-107, 203], [-425, 286], [-563, 201], [178, 150], [-294, 367], [-245, 34], [-219, 201], [-149, -175], [-503, -76], [-1011, 132], [-588, 174], [-450, 89], [-231, 207], [290, 270], [-394, 2], [-88, 599], [213, 528], [286, 241], [717, 158], [-204, -382]], [[22123, 94208], [331, -124], [496, 75], [72, -172], [-259, -283], [420, -254], [-50, -532], [-455, -229], [-268, 50], [-192, 225], [-690, 456], [5, 189], [567, -73], [-306, 386], [329, 286]], [[89889, 93835], [-421, -4], [-569, 66], [-49, 31], [263, 234], [348, 54], [394, -226], [34, -155]], [[24112, 93575], [-298, -442], [-317, 22], [-173, 519], [4, 294], [145, 251], [276, 161], [579, -20], [530, -144], [-415, -526], [-331, -115]], [[16539, 92764], [-731, -294], [-147, 259], [-641, 312], [93, 193], [218, 489], [241, 388], [-272, 362], [939, 93], [397, -123], [709, -33], [270, -171], [298, -249], [-349, -149], [-681, -415], [-344, -414], [0, -248]], [[91869, 94941], [-321, -234], [-444, 53], [-516, 233], [66, 192], [518, -89], [697, -155]], [[23996, 94879], [-151, -229], [-403, 44], [-337, 155], [148, 266], [399, 159], [243, -208], [101, -187]], [[90301, 95224], [-219, -439], [-1023, 16], [-461, -139], [-550, 384], [149, 406], [366, 111], [734, -26], [1004, -313]], [[22639, 95907], [212, -273], [9, -303], [-127, -440], [-458, -60], [-298, 94], [5, 345], [-455, -46], [-18, 457], [299, -18], [419, 201], [390, -34], [22, 77]], [[19941, 95601], [109, -210], [247, 99], [291, -26], [49, -289], [-169, -281], [-940, -91], [-701, -256], [-423, -14], [-35, 193], [577, 261], [-1255, -70], [-389, 106], [379, 577], [262, 165], [782, -199], [493, -350], [485, -45], [-397, 565], [255, 215], [286, -68], [94, -282]], [[65981, 92363], [-164, -52], [-907, 77], [-74, 262], [-503, 158], [-40, 320], [284, 126], [-10, 323], [551, 503], [-255, 73], [665, 518], [-75, 268], [621, 312], [917, 380], [925, 110], [475, 220], [541, 76], [193, -233], [-187, -184], [-984, -293], [-848, -282], [-863, -562], [-414, -577], [-435, -568], [56, -491], [531, -484]], [[23699, 96131], [308, -190], [547, 1], [240, -194], [-64, -222], [319, -134], [177, -140], [374, -26], [406, -50], [441, 128], [566, 51], [451, -42], [298, -223], [62, -244], [-174, -157], [-414, -127], [-355, 72], [-797, -91], [-570, -11], [-449, 73], [-738, 190], [-96, 325], [-34, 293], [-279, 258], [-574, 72], [-322, 183], [104, 242], [573, -37]], [[17722, 96454], [-38, -454], [-214, -205], [-259, -29], [-517, -252], [-444, -91], [-377, 128], [472, 442], [570, 383], [426, -9], [381, 87]], [[63641, 74970], [141, -419], [130, -28], [85, -159], [-228, -47], [-49, -459], [-47, -207], [-102, -138], [7, -293], [88, -436], [263, -123], [193, -296], [395, -102], [434, 156], [27, 139], [-52, 417], [40, 618], [-216, 200], [71, 405], [-184, 34], [61, 498], [262, -145], [244, 189], [-202, 355], [-80, 338], [-224, -151], [-28, -433], [-87, 383], [-15, 144], [68, 246], [-53, 206], [-322, 202], [-125, 530], [-154, 150], [-9, 192], [270, -56], [11, 432], [236, 96], [243, -88], [50, 576], [-50, 365], [-278, -28], [-236, 144], [-321, -260], [-259, -124], [-127, -350], [-269, -97], [-276, -610], [252, -561], [-27, -398], [303, -696], [146, -311]], [[0, 88971], [99997, -3], [-357, -260], [-360, 44], [250, -315], [166, -487], [128, -159], [32, -244], [-71, -157], [-518, 129], [-777, -445], [-247, -69], [-425, -415], [-403, -362], [-102, -269], [-397, 409], [-724, -464], [-126, 220], [-268, -254], [-371, 81], [-90, -388], [-333, -572], [10, -239], [316, -132], [-37, -860], [-258, -22], [-119, -494], [116, -255], [-486, -301], [-96, -675], [-415, -144], [-83, -600], [-400, -551], [-103, 407], [-119, 862], [-155, 1313], [134, 819], [234, 353], [15, 276], [431, 132], [496, 744], [479, 608], [499, 471], [223, 833], [-337, -50], [-167, -487], [-705, -648], [-227, 726], [-717, -201], [-696, -990], [230, -362], [-620, -154], [-430, -61], [20, 427], [-431, 90], [-344, -291], [-850, 102], [-913, -175], [-900, -1153], [-1065, -1394], [438, -74], [136, -370], [270, -132], [178, 296], [305, -39], [401, -650], [9, -502], [-217, -591], [-23, -705], [-126, -945], [-418, -855], [-94, -409], [-377, -688], [-374, -682], [-179, -349], [-370, -346], [-175, -8], [-175, 287], [-373, -432], [-43, -197], [-106, 36], [-120, -201], [-83, -201], [10, -424], [-143, -130], [-50, -105], [-104, -174], [-185, -97], [-121, -159], [-9, -256], [-32, -65], [111, -96], [157, -259], [240, -697], [68, -383], [3, -681], [-105, -325], [-252, -113], [-222, -245], [-250, -51], [-31, 322], [52, 443], [-123, 615], [206, 99], [-190, 506], [-135, 113], [-34, -112], [-81, -49], [-10, 112], [-72, 54], [-75, 94], [77, 260], [65, 69], [-25, 108], [71, 319], [-18, 97], [-163, 64], [-131, 158], [-388, -171], [-204, -277], [-300, -161], [148, 274], [-58, 230], [220, 397], [-147, 310], [-242, -209], [-314, -411], [-171, -381], [-272, -29], [-142, -275], [147, -400], [227, -97], [9, -265], [220, -172], [311, 421], [247, -230], [179, -15], [46, -310], [-394, -165], [-130, -319], [-270, -296], [-142, -414], [299, -324], [109, -582], [169, -541], [189, -454], [-5, -439], [-174, -161], [66, -315], [164, -184], [-43, -481], [-71, -468], [-155, -53], [-203, -640], [-225, -775], [-258, -705], [-382, -545], [-386, -498], [-313, -68], [-170, -262], [-96, 192], [-157, -294], [-388, -296], [-294, -90], [-95, -624], [-154, -35], [-73, 429], [66, 228], [-373, 190], [-131, -97], [-371, -505], [-231, -558], [-61, -410], [212, -623], [260, -772], [252, -365], [169, -475], [127, -1093], [-37, -1039], [-232, -389], [-318, -381], [-227, -492], [-346, -550], [-101, 378], [78, 401], [-206, 335], [-233, 87], [-112, 307], [-141, 611], [-249, 271], [-238, -11], [41, 464], [-245, -3], [-22, -650], [-150, -863], [-90, -522], [19, -428], [181, -18], [113, -539], [50, -512], [155, -338], [168, -69], [144, -306], [64, -56], [164, -356], [116, -396], [16, -398], [-29, -269], [27, -203], [20, -349], [98, -163], [109, -523], [-5, -199], [-197, -40], [-263, 438], [-329, 469], [-32, 301], [-161, 395], [-38, 489], [-100, 322], [30, 431], [-61, 250], [-110, 227], [-47, 292], [-148, 334], [-135, 280], [-45, -347], [-53, 328], [30, 369], [82, 566], [-27, 439], [86, 452], [-94, 350], [23, 644], [-113, 306], [-90, 707], [-50, 746], [-121, 490], [-183, -297], [-315, -421], [-156, 53], [-172, 138], [96, 732], [-58, 554], [-218, 681], [34, 213], [-163, 76], [-197, 481], [-79, 309], [-16, 301], [-53, 284], [-116, 344], [-256, 23], [25, -243], [-87, -329], [-118, 120], [-41, -108], [-78, 65], [-108, 53], [-39, -216], [-189, 7], [-343, -122], [16, -445], [-148, -349], [-400, -398], [-311, -695], [-209, -373], [-276, -386], [-1, -272], [-138, -146], [-250, -212], [-130, -31], [-84, -450], [58, -769], [15, -490], [-118, -561], [-1, -1004], [-144, -29], [-126, -450], [84, -195], [-253, -167], [-93, -402], [-112, -170], [-263, 552], [-128, 827], [-107, 596], [-97, 279], [-148, 568], [-69, 739], [-48, 369], [-253, 811], [-115, 1145], [-83, 756], [1, 716], [-54, 553], [-404, -353], [-196, 70], [-362, 716], [133, 214], [-82, 232], [-326, 501], [-203, 150], [-83, 425], [-215, 449], [-512, -111], [-451, -11], [-391, -83], [-523, 179], [-302, 136], [-314, 76], [-118, 725], [-133, 105], [-214, -106], [-280, -286], [-339, 196], [-281, 454], [-267, 168], [-186, 561], [-205, 788], [-149, -96], [-177, 196], [-103, -231], [-165, 29], [58, -261], [-25, -135], [89, -445], [109, -510], [137, -135], [47, -207], [190, -248], [16, -244], [-27, -197], [35, -199], [80, -165], [37, -194], [41, -145], [-18, 430], [75, 310], [76, 64], [84, -186], [5, -345], [-61, -348], [53, -226], [49, 29], [11, -162], [217, 93], [230, -15], [168, -18], [190, 400], [207, 379], [176, 364], [80, 201], [35, -51], [-26, -244], [-37, -108], [38, -466], [125, -404], [155, -214], [204, -78], [164, -107], [125, -339], [75, -196], [100, -75], [-1, -132], [-101, -352], [-44, -166], [-117, -189], [-104, -404], [-126, 31], [-58, -141], [-44, -300], [34, -395], [-26, -72], [-128, 2], [-174, -221], [-27, -288], [-63, -125], [-173, 5], [-109, -149], [1, -239], [-134, -164], [-153, 56], [-186, -199], [-128, -33], [-201, -159], [-54, -263], [-6, -201], [-277, -249], [-444, -276], [-249, -417], [-122, -32], [-83, 34], [-163, -245], [-177, -113], [-233, -31], [-70, -34], [-61, -156], [-73, -43], [-42, -150], [-138, 13], [-89, -80], [-192, 30], [-72, 345], [8, 323], [-46, 174], [-54, 437], [-80, 243], [56, 29], [-29, 270], [34, 114], [-12, 257], [-36, 253], [-84, 177], [-22, 236], [-143, 212], [-148, 495], [-79, 482], [-192, 406], [-124, 97], [-184, 563], [-32, 411], [12, 350], [-159, 655], [-130, 231], [-150, 122], [-92, 339], [15, 133], [-77, 307], [-81, 131], [-108, 440], [-170, 476], [-141, 406], [-139, -3], [44, 325], [12, 206], [34, 236], [-9, 86], [-78, -238], [-60, -446], [-75, -308], [-65, -103], [-93, 191], [-125, 263], [-198, 847], [-29, -53], [115, -624], [171, -594], [210, -920], [102, -321], [90, -334], [249, -654], [-55, -103], [9, -384], [323, -530], [49, -121], [90, -580], [-61, -107], [40, -608], [102, -706], [106, -145], [152, -219], [161, -683], [77, -543], [152, -288], [379, -558], [154, -336], [151, -341], [87, -203], [136, -178], [66, -183], [-9, -245], [-158, -142], [119, -161], [91, -109], [54, -244], [125, -248], [138, -2], [262, 151], [302, 70], [245, 184], [138, 39], [99, 108], [158, 20], [89, 12], [128, 88], [147, 59], [132, 202], [105, 2], [6, -163], [-25, -344], [1, -310], [-59, -214], [-78, -639], [-134, -659], [-172, -755], [-238, -866], [-237, -661], [-327, -806], [-278, -479], [-415, -586], [-259, -450], [-304, -715], [-64, -312], [-63, -140], [-195, -236], [-68, -246], [-104, -44], [-40, -416], [-89, -238], [-54, -393], [-112, -195], [-128, -728], [16, -335], [178, -216], [8, -153], [-76, -357], [16, -180], [-18, -282], [97, -370], [115, -583], [101, -129], [45, -265], [-11, -588], [34, -519], [11, -923], [49, -290], [-83, -422], [-108, -410], [-177, -366], [-254, -225], [-313, -287], [-313, -634], [-107, -108], [-194, -420], [-115, -136], [-23, -421], [132, -448], [54, -346], [4, -177], [49, 29], [-8, -579], [-45, -274], [65, -102], [-41, -246], [-116, -210], [-229, -199], [-334, -320], [-122, -219], [24, -248], [71, -40], [-24, -311], [-70, -430], [-32, -491], [-72, -267], [-190, -298], [-54, -86], [-118, -300], [-77, -303], [-158, -424], [-314, -609], [-196, -355], [-209, -269], [-291, -229], [-141, -31], [-36, -164], [-169, 88], [-138, -113], [-301, 114], [-168, -72], [-115, 31], [-286, -233], [-238, -94], [-171, -223], [-127, -14], [-117, 210], [-94, 11], [-120, 264], [-13, -82], [-37, 159], [2, 346], [-90, 396], [89, 108], [-7, 453], [-182, 553], [-139, 501], [-1, 1], [-199, 768], [-207, 446], [-108, 432], [-62, 575], [-68, 428], [-93, 910], [-7, 707], [-35, 322], [-108, 243], [-144, 489], [-146, 708], [-60, 371], [-226, 577], [-17, 453], [-26, 372], [38, 519], [96, 541], [15, 254], [90, 532], [66, 243], [159, 386], [90, 263], [29, 438], [-15, 335], [-83, 211], [-74, 358], [-68, 355], [15, 122], [85, 235], [-84, 570], [-57, 396], [-139, 374], [26, 115], [-39, 183], [-74, 444], [-228, 626], [-285, 596], [-184, 488], [-169, 610], [9, 196], [61, 189], [67, 430], [56, 438], [-52, 90], [96, 663], [40, 467], [-108, 390], [-127, 100], [-56, 265], [-71, 85], [3, 163], [-289, -213], [-105, 32], [-107, -133], [-222, 13], [-149, 370], [-91, 427], [-197, 390], [-209, -8], [-245, 1], [-229, -69], [-224, -126], [-436, -346], [-154, -203], [-250, -171], [-248, 168], [-126, -7], [-194, 116], [-178, -7], [-329, -103], [-193, -170], [-275, -217], [-54, 15], [-73, -5], [-286, 282], [-252, 450], [-237, 323], [-187, 381], [-75, 44], [-200, 238], [-144, 316], [-49, 216], [-34, 437], [-122, 349], [-108, 232], [-71, 76], [-69, 118], [-32, 261], [-41, 130], [-80, 97], [-149, 247], [-117, 39], [-63, 166], [1, 90], [-84, 125], [-18, 127], [-46, 453], [36, 262], [-115, 460], [-138, 210], [122, 112], [134, 415], [66, 304], [-24, 318], [78, 291], [34, 557], [-30, 583], [-34, 294], [28, 295], [-72, 281], [-146, 255], [12, 249], [13, 274], [106, 161], [91, 308], [-18, 200], [96, 417], [155, 376], [93, 95], [74, 344], [6, 315], [100, 365], [185, 216], [177, 603], [144, 235], [259, 66], [219, 403], [139, 158], [232, 493], [-70, 735], [106, 508], [37, 312], [179, 399], [278, 270], [206, 244], [186, 612], [87, 362], [205, -2], [167, -251], [264, 41], [288, -131], [121, -6], [267, 323], [300, 102], [175, 244], [268, 180], [471, 105], [459, 48], [140, -87], [262, 232], [297, 5], [113, -137], [190, 35], [302, 239], [195, -71], [-9, -299], [236, 217], [20, -113], [-139, -289], [-2, -274], [96, -147], [-36, -511], [-183, -297], [53, -322], [143, -10], [70, -281], [106, -92], [326, -204], [117, 51], [232, -98], [368, -264], [130, -526], [250, -114], [391, -248], [296, -293], [136, 153], [133, 272], [-65, 452], [87, 288], [200, 277], [192, 80], [375, -121], [95, -264], [104, -2], [88, -101], [276, -69], [68, -196], [369, 10], [268, -156], [275, -175], [129, -92], [214, 188], [114, 169], [245, 49], [198, -75], [75, -293], [65, 193], [222, -140], [217, -33], [137, 149], [80, 194], [-19, 34], [74, 276], [56, 446], [40, 149], [8, 6], [99, 482], [138, 416], [5, 21], [-26, 452], [68, 243], [-102, 268], [105, 222], [-169, -51], [-233, 136], [-191, -340], [-421, -66], [-225, 317], [-300, 20], [-64, -245], [-192, -71], [-268, 315], [-303, -10], [-165, 587], [-203, 328], [135, 459], [-176, 283], [308, 565], [428, 23], [117, 449], [529, -78], [334, 383], [324, 167], [459, 13], [485, -416], [399, -229], [323, 91], [239, -53], [328, 309], [42, 252], [-70, 403], [-160, 218], [-154, 68], [-102, 181], [-354, 499], [-317, 223], [-240, 347], [202, 95], [231, 494], [-156, 234], [410, 241], [-8, 129], [-249, -95], [-222, -48], [-185, -191], [-260, -31], [-239, -220], [16, -368], [136, -142], [284, 35], [-55, -210], [-304, -103], [-377, -342], [-154, 121], [61, 277], [-304, 173], [50, 113], [265, 197], [-80, 135], [-432, 149], [-19, 221], [-257, -73], [-103, -325], [-215, -437], [6, -152], [-135, -128], [-84, 56], [-78, -713], [-144, -245], [-101, -422], [89, -337], [33, -228], [243, -190], [-51, -145], [-330, -33], [-118, -182], [-232, -319], [-87, 275], [3, 122], [-169, 17], [-145, 56], [-336, -154], [192, -332], [-141, -96], [-154, 0], [-147, 304], [-52, -130], [62, -353], [139, -277], [-105, -130], [155, -272], [137, -171], [4, -334], [-257, 157], [82, -302], [-176, -62], [105, -521], [-184, -7], [-228, 257], [-104, 472], [-49, 393], [-108, 272], [-143, 337], [-18, 168], [-48, 41], [-5, 130], [-154, 199], [-24, 281], [23, 403], [38, 184], [-46, 93], [-59, 46], [-78, 192], [-120, 118], [-261, 218], [-161, 213], [-254, 176], [-233, 435], [56, 44], [-127, 248], [-5, 200], [-179, 93], [-85, -255], [-82, 198], [6, 205], [10, 9], [62, 54], [-221, 86], [-226, -210], [15, -293], [-34, -168], [91, -301], [261, -298], [140, -488], [309, -476], [217, 3], [68, -130], [-78, -118], [249, -213], [204, -179], [238, -308], [29, -111], [-52, -211], [-154, 276], [-242, 97], [-116, -382], [200, -219], [-33, -309], [-116, -35], [-148, -506], [-116, -46], [1, 181], [57, 317], [60, 126], [-108, 342], [-85, 298], [-115, 74], [-82, 255], [-179, 107], [-120, 238], [-206, 38], [-217, 267], [-254, 384], [-189, 341], [-86, 584], [-138, 68], [-226, 195], [-128, -80], [-161, -274], [-115, -43], [-252, -334], [-548, 160], [-404, -192], [-32, -355], [15, -344], [-263, -393], [-356, -125], [-25, -199], [-171, -327], [-107, -481], [108, -338], [-160, -263], [-60, -384], [-210, -118], [-197, -455], [-352, -8], [-265, 11], [-174, -209], [-106, -223], [-136, 49], [-103, 199], [-79, 340], [-259, 92], [-112, -153], [-146, 83], [-143, -65], [42, 462], [-26, 363], [-124, 55], [-67, 224], [22, 386], [111, 215], [20, 239], [58, 355], [-6, 250], [-56, 212], [-12, 200], [14, 420], [-114, 257], [393, 426], [340, -107], [373, 4], [296, -101], [230, 31], [449, -19], [144, 354], [53, 1177], [-287, 620], [-205, 299], [-424, 228], [-28, 430], [360, 129], [466, -152], [-88, 669], [263, -254], [646, 461], [84, 484], [243, 119], [222, 117], [143, 162], [244, 870], [380, 247], [231, -17], [54, 125], [232, 32], [52, -130], [188, 291], [-63, 222], [-13, 335], [-113, 328], [-8, 604], [46, 159], [80, 178], [244, 36], [98, 163], [223, 167], [-9, -304], [-82, -192], [33, -166], [151, -89], [-68, -223], [-83, 64], [-200, -425], [76, -288], [4, -228], [281, -138], [-3, -210], [283, 111], [156, 162], [313, -233], [132, -189], [189, 174], [434, 273], [350, 200], [277, -100], [21, -144], [268, -7], [63, 260], [383, 191], [-59, 497], [10, 445], [136, 371], [262, 202], [221, -442], [223, 12], [53, 453], [32, 349], [-102, -75], [-176, 210], [-24, 340], [351, 164], [350, 86], [301, -97], [287, 17], [316, 327], [-291, 280], [-504, -47], [-489, -216], [-452, -125], [-161, 322], [-269, 195], [62, 581], [-135, 534], [133, 344], [252, 371], [635, 640], [185, 124], [-28, 250], [-387, 279], [-478, -167], [-269, -413], [43, -361], [-441, -475], [-537, -509], [-202, -832], [198, -416], [265, -328], [-255, -666], [-289, -138], [-106, -992], [-157, -554], [-337, 57], [-158, -468], [-321, -27], [-89, 558], [-232, 671], [-211, 835], [-187, 363], [-548, -684], [-370, -138], [-385, 301], [-99, 635], [-88, 1364], [256, 380], [733, 496], [549, 609], [508, 824], [668, 1141], [465, 444], [763, 741], [610, 259], [457, -31], [423, 489], [506, -26], [499, 118], [869, -433], [-358, -158], [305, -371], [286, 206], [456, -358], [761, -140], [1050, -668], [213, -281], [18, -393], [-308, -311], [-454, -157], [-1240, 449], [-204, -75], [453, -433], [36, -878], [358, -180], [217, -153], [36, 286], [-174, 263], [183, 215], [672, -368], [234, 144], [-187, 433], [647, 578], [256, -34], [260, -206], [161, 406], [-231, 352], [136, 353], [-204, 367], [777, -190], [158, -331], [-351, -73], [2, -328], [218, -203], [429, 128], [68, 377], [581, 282], [969, 507], [209, -29], [-273, -359], [344, -61], [199, 202], [521, 16], [412, 245], [317, -356], [315, 391], [-291, 343], [145, 195], [820, -179], [385, -185], [1006, -675], [186, 309], [-282, 313], [-8, 125], [-335, 58], [92, 280], [-149, 461], [-8, 189], [512, 535], [182, 537], [207, 116], [735, -156], [58, -328], [-263, -479], [173, -189], [89, -413], [-63, -809], [307, -362], [-120, -395], [-544, -839], [318, -87], [110, 213], [306, 151], [74, 293], [240, 281], [-162, 336], [130, 390], [-304, 49], [-67, 328], [222, 594], [-361, 481], [497, 398], [-64, 421], [139, 13], [145, -328], [-109, -570], [297, -108], [-127, 426], [465, 233], [577, 31], [513, -337], [-247, 492], [-28, 630], [484, 119], [668, -26], [602, 77], [-226, 309], [321, 388], [319, 16], [540, 293], [734, 79], [93, 162], [729, 55], [227, -133], [624, 314], [510, -10], [77, 255], [265, 252], [656, 242], [476, -191], [-378, -146], [629, -90], [75, -292], [254, 143], [812, -7], [626, -289], [223, -221], [-69, -307], [-307, -175], [-730, -328], [-209, -175], [345, -83], [410, -149], [250, 112], [142, -379], [122, 153], [444, 93], [892, -97], [67, -276], [1162, -88], [15, 451], [590, -103], [443, 3], [449, -312], [128, -378], [-165, -247], [349, -465], [437, -240], [268, 620], [446, -266], [473, 159], [538, -182], [204, 166], [455, -83], [-201, 549], [367, 256], [2509, -384], [236, -351], [727, -451], [1122, 112], [553, -98], [231, -244], [-33, -432], [342, -168], [372, 121], [492, 15], [525, -116], [526, 66], [484, -526], [344, 189], [-224, 378], [123, 263], [886, -166], [578, 36], [799, -282], [-99610, -258]], [[23933, 96380], [-126, -17], [-521, 38], [-74, 165], [559, -9], [195, -109], [-33, -68]], [[19392, 96485], [-518, -170], [-411, 191], [224, 188], [406, 60], [392, -92], [-93, -177]], [[56867, 96577], [-620, -241], [-490, 137], [191, 152], [-167, 189], [575, 119], [110, -222], [401, -134]], [[19538, 97019], [-339, -115], [-461, 1], [5, 84], [285, 177], [149, -27], [361, -120]], [[23380, 96697], [-411, -122], [-226, 138], [-119, 221], [-22, 245], [360, -24], [162, -39], [332, -205], [-76, -214]], [[22205, 96856], [108, -247], [-453, 66], [-457, 192], [-619, 21], [268, 176], [-335, 142], [-21, 227], [546, -81], [751, -215], [212, -281]], [[79187, 96845], [-1566, -228], [507, 776], [229, 66], [208, -38], [704, -336], [-82, -240]], [[55069, 97669], [915, -440], [-699, -233], [-155, -435], [-243, -111], [-132, -490], [-335, -23], [-598, 361], [252, 210], [-416, 170], [-541, 499], [-216, 463], [757, 212], [152, -207], [396, 8], [105, 202], [408, 20], [350, -206]], [[57068, 98086], [545, -207], [-412, -318], [-806, -70], [-819, 98], [-50, 163], [-398, 11], [-304, 271], [858, 165], [403, -142], [281, 177], [702, -148]], [[64204, 98169], [-373, -78], [-250, -45], [-39, -97], [-324, -98], [-301, 140], [158, 185], [-618, 18], [542, 107], [422, 8], [57, -160], [159, 142], [262, 97], [412, -129], [-107, -90]], [[77760, 97184], [-606, -73], [-773, 170], [-462, 226], [-213, 423], [-379, 117], [722, 404], [600, 133], [540, -297], [640, -572], [-69, -531]], [[25828, 97644], [334, -190], [-381, -176], [-513, -445], [-492, -42], [-575, 76], [-299, 240], [4, 215], [220, 157], [-508, -4], [-306, 196], [-176, 268], [193, 262], [192, 180], [285, 42], [-122, 135], [646, 30], [355, -315], [468, -127], [455, -112], [220, -390]], [[30972, 99681], [742, -47], [597, -75], [508, -161], [-12, -157], [-678, -257], [-672, -119], [-251, -133], [605, 3], [-656, -358], [-452, -167], [-476, -483], [-573, -98], [-177, -120], [-841, -64], [383, -74], [-192, -105], [230, -292], [-264, -202], [-429, -167], [-132, -232], [-388, -176], [39, -134], [475, 23], [6, -144], [-742, -355], [-726, 163], [-816, -91], [-414, 71], [-525, 31], [-35, 284], [514, 133], [-137, 427], [170, 41], [742, -255], [-379, 379], [-450, 113], [225, 229], [492, 141], [79, 206], [-392, 231], [-118, 304], [759, -26], [220, -64], [433, 216], [-625, 68], [-972, -38], [-491, 201], [-232, 239], [-324, 173], [-61, 202], [413, 112], [324, 19], [545, 96], [409, 220], [344, -30], [300, -166], [211, 319], [367, 95], [498, 65], [849, 24], [148, -63], [802, 100], [601, -38], [602, -37]], [[42472, 99925], [1737, -469], [-513, -227], [-1062, -26], [-1496, -58], [140, -105], [984, 65], [836, -204], [540, 181], [231, -212], [-305, -344], [707, 220], [1348, 229], [833, -114], [156, -253], [-1132, -420], [-157, -136], [-888, -102], [643, -28], [-324, -431], [-224, -383], [9, -658], [333, -386], [-434, -24], [-457, -187], [513, -313], [65, -502], [-297, -55], [360, -508], [-617, -42], [322, -241], [-91, -208], [-391, -91], [-388, -2], [348, -400], [4, -263], [-549, 244], [-143, -158], [375, -148], [364, -361], [105, -476], [-495, -114], [-214, 228], [-344, 340], [95, -401], [-322, -311], [732, -25], [383, -32], [-745, -515], [-755, -466], [-813, -204], [-306, -2], [-288, -228], [-386, -624], [-597, -414], [-192, -24], [-370, -145], [-399, -138], [-238, -365], [-4, -415], [-141, -388], [-453, -472], [112, -462], [-125, -488], [-142, -577], [-391, -36], [-410, 482], [-556, 3], [-269, 324], [-186, 577], [-481, 735], [-141, 385], [-38, 530], [-384, 546], [100, 435], [-186, 208], [275, 691], [418, 220], [110, 247], [58, 461], [-318, -209], [-151, -88], [-249, -84], [-341, 193], [-19, 401], [109, 314], [258, 9], [567, -157], [-478, 375], [-249, 202], [-276, -83], [-232, 147], [310, 550], [-169, 220], [-220, 409], [-335, 626], [-353, 230], [3, 247], [-745, 346], [-590, 43], [-743, -24], [-677, -44], [-323, 188], [-482, 372], [729, 186], [559, 31], [-1188, 154], [-627, 241], [39, 229], [1051, 285], [1018, 284], [107, 214], [-750, 213], [243, 235], [961, 413], [404, 63], [-115, 265], [658, 156], [854, 93], [853, 5], [303, -184], [737, 325], [663, -221], [390, -46], [577, -192], [-660, 318], [38, 253], [932, 353], [975, -27], [354, 218], [982, 57], [2219, -74]]], bbox: [-180, -85.60903777459777, 180, 83.64513000000002], transform: { scale: [0.0036000360003600037, 0.0016925586033320111], translate: [-180, -85.60903777459777] } };

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

// src/modules/projection/d3Factory.ts
var LAND = feature_default(
  land_110m_default,
  land_110m_default.objects.land
);
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
function worldDisplayConfig(info) {
  const midLat = { minLon: 40, minLat: 5, maxLon: 150, maxLat: 65 };
  if (info.category === "conic") {
    return {
      extent: midLat,
      centralMeridian: 95,
      standardParallels: info.id === "albers-equal-area-conic" ? [25, 47] : [30, 60]
    };
  }
  if (info.id === "mercator") {
    return { extent: { minLon: -180, minLat: -85, maxLon: 180, maxLat: 85 }, centralMeridian: 0 };
  }
  if (info.id === "transverse-mercator") {
    return { extent: midLat, centralMeridian: 95 };
  }
  return null;
}
function worldDisplayNote(info) {
  if (info.category === "conic" || info.id === "transverse-mercator") return "\u4E2D\u7EAC\u5E26\u793A\u610F";
  if (info.id === "mercator") return "\u4E16\u754C\u5168\u56FE\uFF08\xB185\xB0 \u5185\uFF09";
  return null;
}
function clipRingToRect(ringPts, e) {
  let pts = ringPts;
  const cut = (input, inside, intersect) => {
    const out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      const curIn = inside(cur);
      const prevIn = inside(prev);
      if (curIn) {
        if (!prevIn) out.push(intersect(prev, cur));
        out.push(cur);
      } else if (prevIn) {
        out.push(intersect(prev, cur));
      }
    }
    return out;
  };
  const ixLon = (a, b, lon) => [
    lon,
    a[1] + (b[1] - a[1]) * (lon - a[0]) / (b[0] - a[0])
  ];
  const ixLat = (a, b, lat) => [
    a[0] + (b[0] - a[0]) * (lat - a[1]) / (b[1] - a[1]),
    lat
  ];
  pts = cut(pts, (p) => p[0] >= e.minLon, (a, b) => ixLon(a, b, e.minLon));
  pts = cut(pts, (p) => p[0] <= e.maxLon, (a, b) => ixLon(a, b, e.maxLon));
  pts = cut(pts, (p) => p[1] >= e.minLat, (a, b) => ixLat(a, b, e.minLat));
  pts = cut(pts, (p) => p[1] <= e.maxLat, (a, b) => ixLat(a, b, e.maxLat));
  return pts;
}
function clipLandToExtent(land, e) {
  const input = land;
  const geometries = [];
  if (input.type === "FeatureCollection") {
    for (const f of input.features ?? []) geometries.push(f.geometry);
  } else if (input.type === "Feature") {
    if (input.geometry) geometries.push(input.geometry);
  } else {
    geometries.push(input);
  }
  const out = [];
  for (const g of geometries) {
    const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const polyRings of polys) {
      const rings = polyRings.map((r) => clipRingToRect(r, e)).filter((r) => r.length >= 4);
      if (rings.length) out.push(rings);
    }
  }
  return { type: "MultiPolygon", coordinates: out };
}
function createProjection(info, extent, width, height) {
  const p = effectiveParams(info, extent);
  const display = isWorldExtent(extent) ? worldDisplayConfig(info) : null;
  const cm = display ? display.centralMeridian : p.centralMeridian;
  const originLat = display ? 0 : p.originLat;
  const parallels = display?.standardParallels ?? p.standardParallels;
  let proj;
  switch (info.id) {
    case "mercator":
      proj = mercator_default();
      break;
    case "transverse-mercator":
      proj = transverseMercator_default();
      break;
    case "lambert-conformal-conic": {
      proj = conicConformal_default().parallels(parallels && parallels.length >= 2 ? [parallels[0], parallels[1]] : [30, 60]);
      break;
    }
    case "albers-equal-area-conic": {
      proj = conicEqualArea_default().parallels(parallels && parallels.length >= 2 ? [parallels[0], parallels[1]] : [25, 47]);
      break;
    }
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
    case "sinusoidal":
      proj = sinusoidal_default();
      break;
    case "polyconic":
      proj = polyconic_default();
      break;
    case "orthographic":
      proj = orthographic_default();
      break;
    case "gnomonic":
      proj = gnomonic_default();
      break;
    case "natural-earth":
      proj = naturalEarth1_default();
      break;
    case "equal-earth":
      proj = equalEarth_default();
      break;
    case "equidistant-cylindrical":
    default:
      proj = equirectangular_default();
      break;
  }
  if (info.category === "azimuthal") {
    proj.rotate([-cm, -originLat]);
  } else {
    proj.rotate([-cm, 0]).center([0, originLat]);
  }
  const target = display ? extentPolygon(display.extent) : isWorldExtent(extent) ? { type: "Sphere" } : extentPolygon(extent);
  proj.clipExtent(null);
  proj.fitExtent(
    [
      [6, 6],
      [width - 6, height - 6]
    ],
    target
  );
  if (display) {
    proj.clipExtent([
      [0, 0],
      [width, height]
    ]);
  }
  return proj;
}
function buildPreviewLayers(info, extent, width, height, marker, opts) {
  const proj = createProjection(info, extent, width, height);
  const display = isWorldExtent(extent) ? worldDisplayConfig(info) : null;
  const clip = !display && opts?.clipToExtent ? extent : null;
  if (display || clip) {
    proj.clipExtent([
      [0, 0],
      [width, height]
    ]);
  }
  const path = path_default(proj);
  const region = display?.extent ?? clip;
  const sphere = path(region ? extentPolygon(region) : { type: "Sphere" }) ?? "";
  const land = path(region ? clipLandToExtent(LAND, region) : LAND) ?? "";
  const grat = path(
    region ? graticule().extent([
      [region.minLon, region.minLat],
      [region.maxLon, region.maxLat]
    ])() : graticule()()
  ) ?? "";
  const extentD = isWorldExtent(extent) || clip ? "" : path(extentPolygon(extent)) ?? "";
  const markerPt = marker ? proj(marker) ?? null : null;
  const lonSpan = extent.maxLon - extent.minLon;
  const latSpan = extent.maxLat - extent.minLat;
  const radius = Math.min(6, Math.max(1.5, Math.min(lonSpan, latSpan) / 10));
  const circle = circle_default().radius(radius);
  const tissot = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const lon = extent.minLon + lonSpan * 0.15 + lonSpan * 0.7 * (i + 0.5) / 4;
      const lat = extent.minLat + latSpan * 0.15 + latSpan * 0.7 * (j + 0.5) / 3;
      const d = path(circle.center([lon, lat])());
      if (d) tissot.push(d);
    }
  }
  return { sphere, land, grat, extentD, tissot, markerPt };
}
var PREVIEW_STYLE = {
  sphere: { fill: "#fbfcfa", stroke: "#c9d9c9", "stroke-width": 1 },
  land: { fill: "#e9f2e3", stroke: "#b9cfb2", "stroke-width": 0.6 },
  grat: { fill: "none", stroke: "#a9c8b0", "stroke-width": 0.6, "stroke-dasharray": "2 3" },
  extent: { fill: "rgba(59, 162, 114, 0.12)", stroke: "#2e825b", "stroke-width": 1.2 },
  tissot: { fill: "rgba(230, 126, 34, 0.28)", stroke: "#e67e22", "stroke-width": 0.8 }
};
function buildStandaloneSvg(inner, width, height) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width * 2}" height="${height * 2}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fbfcfa"/>` + inner + `</svg>`;
}
function gratStep(span) {
  for (const s of [2, 5, 10, 15, 20, 30, 45, 60, 90]) if (span / s <= 7) return s;
  return 90;
}
var fmtLonLabel = (v) => v === 0 ? "0\xB0" : `${Math.abs(v)}\xB0${v > 0 ? "E" : "W"}`;
var fmtLatLabel = (v) => v === 0 ? "0\xB0" : `${Math.abs(v)}\xB0${v > 0 ? "N" : "S"}`;
function buildPreviewDecorations(info, extent, width, height, opts) {
  const proj = createProjection(info, extent, width, height);
  const display = isWorldExtent(extent) ? worldDisplayConfig(info) : null;
  const clip = !display && opts?.clipToExtent ? extent : null;
  const region = display?.extent ?? clip ?? null;
  const gratLabels = [];
  const blocked = (x, y) => x < 26 && y < 26 || // 左上：指北针
  x < 104 && y > height - 22 || // 左下：比例尺
  x > width - 74 && y > height - 44;
  if (region) {
    const lonStep = gratStep(region.maxLon - region.minLon);
    for (let lon = Math.ceil(region.minLon / lonStep) * lonStep; lon <= region.maxLon; lon += lonStep) {
      const pt = proj([lon, region.minLat]);
      if (!pt) continue;
      const x = pt[0];
      const y = Math.min(pt[1] - 2, height - 3);
      if (x < 11 || x > width - 11 || y < 9 || blocked(x, y)) continue;
      gratLabels.push({ x, y, text: fmtLonLabel(lon), anchor: "middle" });
    }
    const latStep = gratStep(region.maxLat - region.minLat);
    for (let lat = Math.ceil(region.minLat / latStep) * latStep; lat <= region.maxLat; lat += latStep) {
      const pt = proj([region.minLon, lat]);
      if (!pt) continue;
      const x = pt[0] + 2.5;
      const y = pt[1] + 1.8;
      if (y < 26 || y > height - 6 || x > width - 20 || blocked(x, y)) continue;
      gratLabels.push({ x, y, text: fmtLatLabel(lat), anchor: "start" });
    }
  } else {
    const cm = effectiveParams(info, extent).centralMeridian;
    for (let lon = -120; lon <= 120; lon += 60) {
      const pt = proj([lon, 0]);
      if (!pt) continue;
      const x = pt[0];
      const y = pt[1] + 7;
      if (x < 12 || x > width - 12 || y > height - 4 || blocked(x, y)) continue;
      gratLabels.push({ x, y, text: fmtLonLabel(lon), anchor: "middle" });
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      if (lat === 0) continue;
      const pt = proj([cm, lat]);
      if (!pt) continue;
      const x = pt[0] + 3;
      const y = pt[1] + 1.8;
      if (y < 8 || y > height - 6 || x > width - 20 || blocked(x, y)) continue;
      gratLabels.push({ x, y, text: fmtLatLabel(lat), anchor: "start" });
    }
  }
  return { gratLabels, metersPerPixel: 6371e3 / proj.scale() };
}
export {
  PREVIEW_STYLE,
  buildPreviewDecorations,
  buildPreviewLayers,
  buildStandaloneSvg,
  createProjection,
  extentPolygon,
  isWorldExtent,
  worldDisplayConfig,
  worldDisplayNote
};
