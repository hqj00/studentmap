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

// src/assets/china-boundary.json
var china_boundary_default = { type: "FeatureCollection", features: [{ type: "Feature", properties: { name: "\u4E2D\u534E\u4EBA\u6C11\u5171\u548C\u56FD\u56FD\u754C", adcode: 1e5 }, geometry: { type: "MultiPolygon", coordinates: [[[[124.515065, 40.22019], [124.513833, 40.218362], [124.490427, 40.18408], [124.457782, 40.177679], [124.428217, 40.144291], [124.346913, 40.079756], [124.336442, 40.049985], [124.372167, 40.021576], [124.349377, 39.989029], [124.288399, 39.962888], [124.286551, 39.931689], [124.241588, 39.928477], [124.219414, 39.899099], [124.218182, 39.895885], [124.21695, 39.894049], [124.215102, 39.883487], [124.214486, 39.865116], [124.173218, 39.841225], [124.151045, 39.74558], [124.099306, 39.777323], [124.103001, 39.823302], [124.002603, 39.800316], [123.95148, 39.817786], [123.812278, 39.831115], [123.795032, 39.822842], [123.687858, 39.808132], [123.674924, 39.826979], [123.645358, 39.823761], [123.642279, 39.796178], [123.612714, 39.775023], [123.579453, 39.781002], [123.546808, 39.756163], [123.534489, 39.788361], [123.521555, 39.772724], [123.477823, 39.74696], [123.392823, 39.723949], [123.388512, 39.74742], [123.389744, 39.763984], [123.350939, 39.750641], [123.274563, 39.753862], [123.270251, 39.714743], [123.286882, 39.704154], [123.253005, 39.689879], [123.215433, 39.696786], [123.212969, 39.665928], [123.166774, 39.674219], [123.146448, 39.647037], [123.103332, 39.676983], [123.010941, 39.655331], [123.021412, 39.64335], [122.978912, 39.616156], [122.972753, 39.594946], [122.941956, 39.604629], [122.860652, 39.604629], [122.847101, 39.581571], [122.808913, 39.559889], [122.682645, 39.514658], [122.649385, 39.516505], [122.637066, 39.488799], [122.581631, 39.464316], [122.532972, 39.419947], [122.51203, 39.413474], [122.467682, 39.403301], [122.455364, 39.408388], [122.412864, 39.411625], [122.366668, 39.390815], [122.366053, 39.370461], [122.30877, 39.346399], [122.274893, 39.322329], [122.242865, 39.267678], [122.160329, 39.238019], [122.117213, 39.213911], [122.123988, 39.172631], [122.167104, 39.158711], [122.127684, 39.144788], [122.088264, 39.112291], [122.048228, 39.101146], [122.071634, 39.074204], [122.061778, 39.060264], [122.013735, 39.073275], [121.963228, 39.030053], [121.923192, 39.053758], [121.907178, 39.055617], [121.929352, 39.024939], [121.8887, 39.027263], [121.852975, 39.035631], [121.905946, 38.997503], [121.920728, 38.969591], [121.863446, 38.942598], [121.804932, 38.970986], [121.790149, 39.022614], [121.756889, 39.025869], [121.73841, 38.998898], [121.671273, 39.010059], [121.66265, 38.966333], [121.618918, 38.950046], [121.655874, 38.946788], [121.719316, 38.920252], [121.708845, 38.872744], [121.675585, 38.86156], [121.618302, 38.862492], [121.564715, 38.874607], [121.509897, 38.817743], [121.399028, 38.812613], [121.359608, 38.822406], [121.315876, 38.793958], [121.288775, 38.78976], [121.280767, 38.786961], [121.259825, 38.786495], [121.198848, 38.721623], [121.13787, 38.723023], [121.112, 38.776231], [121.12863, 38.799089], [121.110768, 38.862026], [121.129862, 38.879266], [121.094138, 38.894173], [121.08921, 38.922115], [121.128014, 38.958888], [121.180369, 38.959819], [121.204391, 38.941202], [121.275224, 38.971917], [121.341129, 38.980757], [121.317108, 39.012384], [121.370695, 39.060264], [121.431057, 39.027263], [121.508049, 39.034237], [121.581962, 39.075598], [121.599208, 39.098824], [121.562252, 39.127149], [121.590585, 39.154999], [121.642324, 39.11972], [121.605983, 39.080708], [121.631853, 39.077921], [121.68236, 39.117863], [121.639244, 39.166136], [121.604136, 39.166136], [121.586889, 39.193506], [121.591201, 39.228748], [121.631237, 39.22643], [121.589353, 39.263044], [121.623846, 39.285745], [121.672505, 39.275554], [121.667577, 39.310754], [121.7187, 39.320477], [121.711925, 39.33992], [121.72486, 39.364447], [121.621382, 39.326033], [121.562252, 39.322792], [121.51544, 39.286672], [121.508665, 39.29223], [121.474788, 39.296398], [121.466781, 39.320014], [121.435984, 39.329736], [121.432904, 39.357506], [121.35468, 39.377863], [121.324499, 39.371386], [121.307869, 39.391277], [121.270296, 39.374162], [121.245659, 39.389427], [121.246891, 39.421334], [121.270296, 39.434277], [121.301709, 39.476327], [121.286927, 39.507271], [121.268449, 39.482794], [121.224717, 39.519275], [121.226565, 39.554814], [121.263521, 39.589873], [121.299246, 39.606013], [121.325731, 39.601402], [121.450151, 39.624914], [121.451999, 39.658095], [121.482796, 39.659478], [121.502506, 39.703233], [121.45939, 39.747881], [121.487107, 39.760303], [121.472325, 39.802155], [121.530223, 39.851334], [121.541926, 39.874302], [121.572107, 39.865116], [121.626925, 39.882569], [121.699606, 39.937196], [121.76428, 39.933525], [121.779062, 39.942702], [121.796309, 39.999116], [121.824642, 40.025701], [121.910257, 40.072887], [121.956453, 40.133311], [121.995257, 40.128277], [122.003264, 40.172191], [121.98109, 40.173106], [121.950293, 40.204194], [121.940438, 40.242121], [122.02667, 40.244862], [122.039605, 40.260391], [122.040221, 40.322017], [122.079641, 40.332967], [122.110438, 40.315629], [122.138155, 40.338897], [122.111054, 40.348932], [122.135691, 40.374925], [122.152322, 40.357597], [122.198517, 40.382219], [122.186814, 40.422779], [122.229314, 40.424146], [122.250872, 40.445555], [122.240401, 40.461039], [122.265038, 40.48016], [122.231162, 40.505192], [122.245944, 40.519752], [122.150474, 40.588413], [122.133843, 40.614313], [122.148626, 40.671983], [122.122141, 40.657457], [122.06609, 40.64883], [122.025438, 40.674253], [121.951525, 40.680607], [121.936127, 40.711462], [121.934279, 40.79805], [121.883772, 40.802127], [121.84312, 40.831567], [121.816019, 40.894931], [121.778446, 40.886787], [121.735331, 40.862351], [121.732251, 40.846961], [121.682976, 40.829755], [121.626309, 40.844244], [121.576418, 40.837906], [121.553013, 40.817528], [121.55486, 40.849677], [121.526527, 40.85194], [121.499426, 40.880001], [121.440296, 40.88181], [121.355296, 40.892217], [121.251202, 40.880453], [121.23642, 40.851035], [121.177906, 40.873665], [121.126167, 40.86914], [121.096602, 40.839717], [121.076892, 40.815716], [121.086747, 40.79805], [121.010986, 40.784457], [121.00729, 40.807563], [120.971566, 40.805751], [120.994356, 40.790801], [120.980189, 40.766329], [120.991276, 40.744115], [121.028848, 40.746382], [121.032544, 40.709193], [120.983269, 40.712822], [120.939537, 40.686507], [120.861313, 40.684692], [120.8299, 40.671076], [120.837291, 40.644289], [120.822509, 40.59432], [120.72827, 40.539311], [120.72211, 40.515657], [120.693777, 40.505647], [120.666676, 40.467413], [120.619249, 40.460128], [120.616169, 40.444645], [120.617401, 40.41959], [120.596459, 40.399084], [120.602618, 40.36079], [120.537329, 40.325211], [120.52193, 40.304676], [120.523778, 40.256737], [120.491749, 40.20008], [120.451097, 40.177679], [120.371641, 40.174478], [120.273091, 40.127362], [120.161606, 40.096239], [120.134504, 40.074719], [120.092005, 40.077466], [119.947259, 40.040364], [119.941715, 40.009659], [119.91831, 39.989946], [119.854252, 39.98857], [119.872114, 39.960594], [119.842549, 39.956007], [119.820375, 39.979399], [119.787115, 39.950502], [119.726137, 39.940867], [119.681789, 39.922511], [119.642369, 39.925264], [119.620195, 39.904609], [119.588166, 39.910576], [119.540739, 39.888079], [119.520413, 39.840306], [119.536427, 39.809052], [119.474217, 39.813189], [119.366428, 39.734996], [119.269726, 39.498497], [119.316537, 39.437051], [119.317153, 39.4107], [119.272805, 39.363521], [119.185342, 39.342234], [119.121284, 39.281576], [119.096031, 39.24219], [119.038132, 39.211593], [119.023966, 39.187012], [118.97777, 39.163352], [118.926031, 39.123435], [118.890307, 39.118792], [118.896466, 39.139683], [118.951285, 39.178662], [118.920488, 39.171703], [118.897082, 39.151286], [118.857662, 39.162888], [118.814546, 39.138754], [118.76096, 39.133648], [118.637156, 39.157319], [118.578642, 39.130863], [118.588497, 39.107648], [118.533062, 39.090928], [118.570634, 38.999363], [118.604511, 38.971452], [118.539837, 38.910008], [118.491178, 38.909077], [118.377845, 38.971917], [118.366143, 39.016104], [118.319331, 39.009594], [118.225092, 39.034701], [118.1906, 39.080708], [118.162883, 39.136433], [118.12531, 39.182838], [118.077883, 39.201854], [118.070492, 39.213911], [118.032919, 39.219939], [117.977485, 39.206028], [117.96455, 39.172631], [117.871543, 39.122506], [117.837667, 39.057011], [117.855529, 38.957492], [117.898029, 38.948649], [117.875855, 38.920252], [117.847522, 38.855502], [117.778536, 38.869016], [117.752051, 38.847579], [117.64611, 38.828933], [117.646725, 38.788827], [117.671363, 38.772032], [117.740964, 38.753833], [117.740964, 38.700141], [117.729261, 38.680055], [117.65658, 38.66043], [117.639334, 38.626776], [117.638102, 38.54491], [117.68553, 38.539293], [117.644878, 38.52759], [117.678754, 38.477008], [117.72495, 38.457328], [117.730493, 38.424985], [117.781, 38.373862], [117.84629, 38.368232], [117.937449, 38.387936], [117.957775, 38.376208], [117.948536, 38.346644], [117.895565, 38.301572], [117.896797, 38.279495], [118.018753, 38.202409], [118.045238, 38.214165], [118.112376, 38.210403], [118.177665, 38.186417], [118.217085, 38.146893], [118.331034, 38.12524], [118.404331, 38.121003], [118.431432, 38.106406], [118.44991, 38.124299], [118.504729, 38.11394], [118.517048, 38.088509], [118.534294, 38.063541], [118.552156, 38.05553], [118.597736, 38.079088], [118.607591, 38.129006], [118.626069, 38.138421], [118.703677, 38.151129], [118.811467, 38.157717], [118.908169, 38.139362], [118.974075, 38.094162], [119.001792, 37.99613], [119.110813, 37.921577], [119.12806, 37.847892], [119.12806, 37.814332], [119.154545, 37.806294], [119.217371, 37.810077], [119.225378, 37.752844], [119.275269, 37.739594], [119.275885, 37.717347], [119.246936, 37.698409], [119.133603, 37.705511], [119.080016, 37.696514], [119.02027, 37.6572], [118.988857, 37.620709], [118.939582, 37.527268], [118.942662, 37.497361], [119.001176, 37.31862], [119.03998, 37.30434], [119.054147, 37.254816], [119.084328, 37.239572], [119.091103, 37.257674], [119.12806, 37.254816], [119.136683, 37.230995], [119.204436, 37.280058], [119.190885, 37.25958], [119.2069, 37.223371], [119.298675, 37.197156], [119.301138, 37.139452], [119.327624, 37.115595], [119.361501, 37.125616], [119.428022, 37.125616], [119.489616, 37.134681], [119.576463, 37.127524], [119.678709, 37.158056], [119.687332, 37.143746], [119.698419, 37.127047], [119.740303, 37.133727], [119.808057, 37.196203], [119.83023, 37.225754], [119.865339, 37.233854], [119.89244, 37.263866], [119.883201, 37.311004], [119.837006, 37.346695], [119.843781, 37.376662], [119.926933, 37.386649], [119.949723, 37.419927], [120.010085, 37.442263], [120.064903, 37.448915], [120.086461, 37.465067], [120.144359, 37.481691], [120.222584, 37.532963], [120.246605, 37.556689], [120.208417, 37.588469], [120.215192, 37.621183], [120.272475, 37.636824], [120.269395, 37.658622], [120.22012, 37.671886], [120.227511, 37.693673], [120.367945, 37.697935], [120.454793, 37.757576], [120.517619, 37.750005], [120.590915, 37.7642], [120.634031, 37.796364], [120.656821, 37.793054], [120.733197, 37.833714], [120.839139, 37.82426], [120.845298, 37.826623], [120.874863, 37.833241], [120.940769, 37.819533], [120.943233, 37.785486], [120.994356, 37.759468], [121.037471, 37.718767], [121.136022, 37.723501], [121.160043, 37.698882], [121.142797, 37.661464], [121.161891, 37.646302], [121.148956, 37.626397], [121.17421, 37.597479], [121.217326, 37.582778], [121.304789, 37.582778], [121.358376, 37.597479], [121.349137, 37.635403], [121.391021, 37.625449], [121.435368, 37.592737], [121.395948, 37.589891], [121.400876, 37.557638], [121.460006, 37.522522], [121.477252, 37.475992], [121.571491, 37.441313], [121.575802, 37.460317], [121.635548, 37.494037], [121.66573, 37.473617], [121.772903, 37.466492], [121.923808, 37.473142], [121.997721, 37.494512], [122.017431, 37.531065], [122.075329, 37.540556], [122.08888, 37.554316], [122.150474, 37.557163], [122.163408, 37.519199], [122.131996, 37.49926], [122.166488, 37.438937], [122.194205, 37.456041], [122.25272, 37.467917], [122.287212, 37.445114], [122.281053, 37.430858], [122.337103, 37.414223], [122.41656, 37.414699], [122.487393, 37.43466], [122.4954, 37.413748], [122.553914, 37.407093], [122.641377, 37.428482], [122.67587, 37.413273], [122.701739, 37.418501], [122.714058, 37.392355], [122.6925, 37.373809], [122.650616, 37.388551], [122.607501, 37.364296], [122.611196, 37.339558], [122.573624, 37.296247], [122.567465, 37.25958], [122.592718, 37.261485], [122.624131, 37.190959], [122.573624, 37.176178], [122.581015, 37.147562], [122.533588, 37.153286], [122.484313, 37.128956], [122.478769, 37.058784], [122.467067, 37.037289], [122.494168, 37.033945], [122.575472, 37.054485], [122.583479, 37.037289], [122.544675, 37.004797], [122.55761, 36.968467], [122.532356, 36.901496], [122.48924, 36.886659], [122.483081, 36.913938], [122.434422, 36.914416], [122.452284, 36.88618], [122.454748, 36.879], [122.415944, 36.85937], [122.383915, 36.865595], [122.378371, 36.844525], [122.344495, 36.828239], [122.280437, 36.835904], [122.275509, 36.83734], [122.220691, 36.848835], [122.174495, 36.842609], [122.188662, 36.866073], [122.175727, 36.894317], [122.119677, 36.891924], [122.141235, 36.938337], [122.124604, 36.944077], [122.115981, 36.94025], [122.093191, 36.913938], [122.051923, 36.904846], [122.042684, 36.871819], [122.008808, 36.96225], [121.965076, 36.938337], [121.927504, 36.932597], [121.767975, 36.874691], [121.762432, 36.84644], [121.726092, 36.826323], [121.6762, 36.819137], [121.631853, 36.80093], [121.651563, 36.723739], [121.556092, 36.764502], [121.575186, 36.740047], [121.532071, 36.73621], [121.485259, 36.786073], [121.548701, 36.807638], [121.565331, 36.830635], [121.506817, 36.803805], [121.496962, 36.795179], [121.454462, 36.752515], [121.3941, 36.738129], [121.400876, 36.701191], [121.35776, 36.713186], [121.31218, 36.702151], [121.29863, 36.702151], [121.251818, 36.671436], [121.161275, 36.651273], [121.078123, 36.607568], [121.028848, 36.572971], [120.955551, 36.575855], [120.926602, 36.611892], [120.882255, 36.627262], [120.847146, 36.618617], [120.884718, 36.601323], [120.909972, 36.568645], [120.962327, 36.562877], [120.983269, 36.546051], [120.95432, 36.507578], [120.965407, 36.466199], [120.938305, 36.447908], [120.90874, 36.450315], [120.917979, 36.417573], [120.911204, 36.412276], [120.871784, 36.36699], [120.848994, 36.403124], [120.858849, 36.424797], [120.837291, 36.459942], [120.828668, 36.46668], [120.759683, 36.46283], [120.694393, 36.390118], [120.744284, 36.327946], [120.66298, 36.331803], [120.657437, 36.276339], [120.686386, 36.279234], [120.680843, 36.238698], [120.696857, 36.203936], [120.696857, 36.15563], [120.712255, 36.126632], [120.672835, 36.130016], [120.64327, 36.114547], [120.615553, 36.120348], [120.593995, 36.100525], [120.546568, 36.107778], [120.546568, 36.091821], [120.468959, 36.087952], [120.429539, 36.056994], [120.337764, 36.055058], [120.286025, 36.047317], [120.35809, 36.174956], [120.362402, 36.196209], [120.319902, 36.232423], [120.297112, 36.225664], [120.310047, 36.185101], [120.263236, 36.182202], [120.260772, 36.198624], [120.224432, 36.19138], [120.22012, 36.209248], [120.181316, 36.203936], [120.140664, 36.173507], [120.142512, 36.143549], [120.108635, 36.127599], [120.116642, 36.102943], [120.152367, 36.095206], [120.181316, 36.066669], [120.239214, 36.062316], [120.234902, 36.030863], [120.198562, 35.995525], [120.257076, 36.025055], [120.249069, 35.992136], [120.285409, 36.01247], [120.289721, 36.017311], [120.316206, 36.002304], [120.30512, 35.971796], [120.265699, 35.966468], [120.209033, 35.917531], [120.202258, 35.89184], [120.169613, 35.888446], [120.207801, 35.947575], [120.152983, 35.907353], [120.125265, 35.906868], [120.112331, 35.885052], [120.064287, 35.873414], [120.032258, 35.812288], [120.049505, 35.786562], [120.01378, 35.714193], [119.958346, 35.760342], [119.926317, 35.759856], [119.920157, 35.739943], [119.950339, 35.729741], [119.91215, 35.660725], [119.925085, 35.637382], [119.868419, 35.60868], [119.83023, 35.620357], [119.824071, 35.646136], [119.792658, 35.615492], [119.780339, 35.584835], [119.772332, 35.578995], [119.75139, 35.617924], [119.718129, 35.615492], [119.662079, 35.589215], [119.663311, 35.562931], [119.618963, 35.459655], [119.579543, 35.406504], [119.590014, 35.37284], [119.543819, 35.347949], [119.538275, 35.296678], [119.493312, 35.318655], [119.450812, 35.285443], [119.411392, 35.231689], [119.397841, 35.137777], [119.428022, 35.121136], [119.373819, 35.078538], [119.354109, 35.080007], [119.306066, 35.076578], [119.292515, 35.068742], [119.307298, 35.032977], [119.291899, 35.028567], [119.285124, 35.068252], [119.238313, 35.048657], [119.211211, 34.981507], [119.214907, 34.925589], [119.202588, 34.890253], [119.217371, 34.827886], [119.238313, 34.799388], [119.272189, 34.797914], [119.312841, 34.774813], [119.378747, 34.764489], [119.440957, 34.769406], [119.439725, 34.785136], [119.497007, 34.754164], [119.494543, 34.754656], [119.381827, 34.752198], [119.456971, 34.748264], [119.525956, 34.73351], [119.465594, 34.672994], [119.569072, 34.615389], [119.610956, 34.592729], [119.641137, 34.569078], [119.781571, 34.515839], [119.811752, 34.485754], [119.962657, 34.459112], [120.103707, 34.391481], [120.311895, 34.306991], [120.314359, 34.255563], [120.347619, 34.179352], [120.367329, 34.091674], [120.48559, 33.859411], [120.500372, 33.818152], [120.534249, 33.782346], [120.583524, 33.668362], [120.611241, 33.627012], [120.622944, 33.615051], [120.680227, 33.520306], [120.717183, 33.436945], [120.741205, 33.337505], [120.769538, 33.307], [120.813885, 33.303499], [120.833595, 33.274984], [120.819429, 33.237951], [120.843451, 33.209915], [120.874247, 33.093672], [120.871784, 33.047032], [120.917979, 33.02596], [120.932762, 33.005887], [120.957399, 32.893395], [120.981421, 32.85972], [120.972182, 32.761134], [120.953088, 32.714318], [120.916131, 32.701225], [120.963559, 32.68259], [120.979573, 32.636236], [120.961711, 32.612042], [121.020225, 32.605489], [121.076892, 32.576243], [121.153268, 32.52933], [121.269681, 32.483402], [121.352216, 32.474315], [121.390405, 32.460682], [121.425513, 32.430885], [121.450151, 32.282256], [121.493882, 32.263533], [121.499426, 32.211394], [121.458774, 32.177462], [121.542542, 32.152132], [121.525295, 32.136423], [121.759352, 32.059362], [121.772287, 32.032984], [121.856055, 31.955328], [121.889315, 31.866425], [121.970004, 31.718911], [121.974931, 31.61704], [121.995873, 31.493117], [121.981706, 31.464024], [121.890547, 31.428795], [121.819098, 31.437987], [121.682976, 31.491075], [121.625693, 31.501792], [121.547469, 31.531382], [121.434136, 31.590535], [121.395332, 31.585437], [121.371926, 31.553314], [121.343593, 31.511996], [121.404571, 31.479337], [121.520984, 31.394575], [121.599208, 31.37465], [121.722396, 31.3036], [121.809859, 31.196669], [121.946598, 31.066039], [121.977395, 31.016301], [121.990945, 30.96859], [121.994025, 30.862823], [121.954605, 30.825828], [121.970004, 30.789333], [121.987866, 30.753338], [121.992793, 30.695204], [122.011271, 30.66947], [122.075329, 30.647848], [122.133227, 30.595317], [122.087032, 30.602014], [121.997105, 30.658659], [121.968156, 30.688514], [121.943518, 30.776993], [121.904714, 30.814007], [121.681128, 30.818633], [121.601056, 30.805269], [121.517288, 30.775451], [121.426129, 30.730192], [121.362071, 30.679764], [121.274608, 30.677191], [121.239499, 30.648878], [121.188992, 30.632916], [121.148956, 30.599953], [121.058413, 30.563888], [121.092906, 30.515952], [121.183449, 30.434458], [121.225333, 30.404526], [121.328195, 30.397299], [121.371926, 30.37097], [121.395332, 30.338435], [121.497578, 30.258861], [121.561636, 30.184395], [121.635548, 30.070002], [121.652795, 30.071037], [121.699606, 30.007832], [121.721164, 29.992802], [121.78399, 29.99332], [121.835113, 29.958068], [121.919497, 29.920729], [121.971235, 29.955476], [122.00388, 29.92021], [122.00696, 29.891678], [122.140003, 29.901535], [122.143082, 29.877668], [122.10243, 29.859504], [122.043916, 29.822647], [122.003264, 29.762401], [121.937359, 29.748373], [121.833265, 29.653242], [121.872685, 29.632437], [121.909641, 29.650122], [121.966308, 29.636078], [122.000185, 29.582486], [121.995257, 29.545007], [121.968772, 29.515846], [121.973083, 29.477821], [121.993409, 29.45229], [121.975547, 29.411113], [121.937975, 29.384], [121.936127, 29.348012], [121.958301, 29.334448], [121.94475, 29.28435], [122.000185, 29.278608], [122.002032, 29.260336], [121.966924, 29.249894], [121.971851, 29.193485], [121.948446, 29.193485], [121.986634, 29.154817], [121.988482, 29.110906], [121.970004, 29.092604], [121.966308, 29.052852], [121.884388, 29.105677], [121.85975, 29.086328], [121.811091, 29.10986], [121.780294, 29.10986], [121.767975, 29.166837], [121.750113, 29.136523], [121.715621, 29.125022], [121.608447, 29.168927], [121.616454, 29.143318], [121.660186, 29.118226], [121.658954, 29.058606], [121.712541, 29.028783], [121.711309, 28.985865], [121.743338, 28.954451], [121.772287, 28.898404], [121.774751, 28.863818], [121.687287, 28.863294], [121.704534, 28.804577], [121.689135, 28.719062], [121.646019, 28.682842], [121.540694, 28.655537], [121.557324, 28.645033], [121.596128, 28.575156], [121.634317, 28.562542], [121.646019, 28.511544], [121.671273, 28.472621], [121.692831, 28.407368], [121.658954, 28.392628], [121.634317, 28.347868], [121.660186, 28.355768], [121.669425, 28.33312], [121.627541, 28.251966], [121.580114, 28.240368], [121.571491, 28.279376], [121.538846, 28.299401], [121.488955, 28.301509], [121.45631, 28.250385], [121.402107, 28.197127], [121.373774, 28.133287], [121.328195, 28.134343], [121.299862, 28.067297], [121.261057, 28.034551], [121.176058, 28.022401], [121.140949, 28.031382], [121.121239, 28.12537], [121.108304, 28.139092], [121.059029, 28.096338], [121.015298, 27.981714], [120.991892, 27.95], [121.05595, 27.900294], [121.099681, 27.895005], [121.162507, 27.90717], [121.162507, 27.879136], [121.193304, 27.872259], [121.192072, 27.822518], [121.152652, 27.810344], [121.153268, 27.809815], [121.149572, 27.801875], [121.149572, 27.801345], [121.13479, 27.787051], [121.134174, 27.787051], [121.152036, 27.815638], [121.107688, 27.81352], [121.070116, 27.834162], [121.027616, 27.832574], [120.97403, 27.887071], [120.942001, 27.896592], [120.910588, 27.864852], [120.840371, 27.758986], [120.809574, 27.775402], [120.797871, 27.779638], [120.771386, 27.734623], [120.709176, 27.682699], [120.685154, 27.622797], [120.634647, 27.577186], [120.637111, 27.561271], [120.703016, 27.478475], [120.673451, 27.420055], [120.665444, 27.357884], [120.580444, 27.321203], [120.554575, 27.25206], [120.574901, 27.234501], [120.545952, 27.156785], [120.492365, 27.136016], [120.461568, 27.142407], [120.403054, 27.10086], [120.391967, 27.081146], [120.282946, 27.089671], [120.29588, 27.035845], [120.275554, 27.027315], [120.279866, 26.987326], [120.25954, 26.982526], [120.233055, 26.907837], [120.1807, 26.920644], [120.130193, 26.917976], [120.126497, 26.920644], [120.117874, 26.882751], [120.054432, 26.863533], [120.042729, 26.828292], [120.073526, 26.823485], [120.102476, 26.82669], [120.103707, 26.794642], [120.136352, 26.797847], [120.106787, 26.752966], [120.151135, 26.750829], [120.162222, 26.717691], [120.110483, 26.692563], [120.1382, 26.638012], [120.093852, 26.613938], [120.063671, 26.627848], [120.007621, 26.595744], [119.967585, 26.597885], [119.93802, 26.576478], [119.947875, 26.56042], [119.867187, 26.509019], [119.828383, 26.524013], [119.851788, 26.595209], [119.901679, 26.624638], [119.949107, 26.624638], [119.972512, 26.654594], [119.969433, 26.686681], [119.99407, 26.720363], [120.061824, 26.768997], [120.052584, 26.786629], [119.942947, 26.784492], [119.938636, 26.747088], [119.899216, 26.693098], [119.908455, 26.661547], [119.873962, 26.642827], [119.864107, 26.671174], [119.833926, 26.690959], [119.711354, 26.686681], [119.664543, 26.726243], [119.637441, 26.703256], [119.619579, 26.649246], [119.577695, 26.622498], [119.605412, 26.595744], [119.670086, 26.618218], [119.740303, 26.610727], [119.788346, 26.583435], [119.83639, 26.454381], [119.835774, 26.434019], [119.893672, 26.355752], [119.946027, 26.374519], [119.95465, 26.352534], [119.904143, 26.308552], [119.862875, 26.307479], [119.845013, 26.323036], [119.806825, 26.307479], [119.802513, 26.268846], [119.7711, 26.285481], [119.676246, 26.262943], [119.664543, 26.202282], [119.604181, 26.168985], [119.618963, 26.11956], [119.654688, 26.090002], [119.668854, 26.026024], [119.700267, 26.032477], [119.723673, 26.011503], [119.69534, 25.904424], [119.638057, 25.889888], [119.628202, 25.87212], [119.626354, 25.723406], [119.602949, 25.714779], [119.602949, 25.68512], [119.543819, 25.684581], [119.472986, 25.662466], [119.478529, 25.631715], [119.541355, 25.6247], [119.534579, 25.585303], [119.586934, 25.59232], [119.616499, 25.556691], [119.611572, 25.519972], [119.634362, 25.475137], [119.675014, 25.475137], [119.680557, 25.497827], [119.715666, 25.51187], [119.716898, 25.551292], [119.683637, 25.592859], [119.700267, 25.616606], [119.785883, 25.66786], [119.790194, 25.614447], [119.843165, 25.597717], [119.831462, 25.579905], [119.883817, 25.546432], [119.861027, 25.531313], [119.81668, 25.532393], [119.811136, 25.507009], [119.862875, 25.474597], [119.864107, 25.469734], [119.866571, 25.455145], [119.804977, 25.457847], [119.764325, 25.433529], [119.773564, 25.395691], [119.688564, 25.441095], [119.682405, 25.445959], [119.675014, 25.468113], [119.622659, 25.434069], [119.670086, 25.435691], [119.656535, 25.396772], [119.665159, 25.3719], [119.649144, 25.342697], [119.597405, 25.334584], [119.582623, 25.374063], [119.59063, 25.398394], [119.577695, 25.445959], [119.555521, 25.429205], [119.578927, 25.400556], [119.548746, 25.365952], [119.486536, 25.369737], [119.507478, 25.396231], [119.48592, 25.418935], [119.491464, 25.443257], [119.463131, 25.448661], [119.438493, 25.412449], [119.45266, 25.493505], [119.400921, 25.493505], [119.359037, 25.521592], [119.343638, 25.472436], [119.353493, 25.411908], [119.288204, 25.410827], [119.26295, 25.428124], [119.275269, 25.476758], [119.256175, 25.488643], [119.219834, 25.468654], [119.191501, 25.424341], [119.151465, 25.426503], [119.14469, 25.388121], [119.218603, 25.368115], [119.240776, 25.316733], [119.247552, 25.333502], [119.299291, 25.328634], [119.333167, 25.287516], [119.380595, 25.250173], [119.331935, 25.230685], [119.294979, 25.237182], [119.314689, 25.190076], [119.26911, 25.159746], [119.231537, 25.188993], [119.190269, 25.175995], [119.131755, 25.223106], [119.108349, 25.193867], [119.137299, 25.15487], [119.165632, 25.145661], [119.146538, 25.056782], [119.119436, 25.012861], [119.107118, 25.075214], [119.134219, 25.106107], [119.075705, 25.099604], [119.06585, 25.102855], [119.028893, 25.139702], [119.032589, 25.17437], [119.054147, 25.168412], [119.074473, 25.211195], [119.055379, 25.219316], [118.990089, 25.20199], [118.975307, 25.237723], [118.996864, 25.266411], [118.956212, 25.272905], [118.918024, 25.25721], [118.91556, 25.256668], [118.919256, 25.248008], [118.900162, 25.242595], [118.903242, 25.239347], [118.943278, 25.221482], [118.940198, 25.21715], [118.942046, 25.211195], [118.985162, 25.19495], [118.985162, 25.168954], [118.951901, 25.15162], [118.974691, 25.115319], [118.892155, 25.092558], [118.945126, 25.028588], [118.974691, 25.024792], [119.016575, 25.058409], [119.023966, 25.04377], [118.989473, 24.973807], [119.004872, 24.970009], [119.007335, 24.963499], [119.032589, 24.961871], [119.032589, 24.961328], [119.014111, 24.941252], [118.945741, 24.954275], [118.91864, 24.932569], [118.932807, 24.906518], [118.987009, 24.898375], [118.988857, 24.878831], [118.933423, 24.870687], [118.864437, 24.887518], [118.834256, 24.854397], [118.807771, 24.870687], [118.748641, 24.84245], [118.69875, 24.848967], [118.702445, 24.865258], [118.647627, 24.843536], [118.650707, 24.808774], [118.786213, 24.77672], [118.778822, 24.743569], [118.703677, 24.665278], [118.670417, 24.679962], [118.652554, 24.653857], [118.661178, 24.622306], [118.687047, 24.63373], [118.680272, 24.58204], [118.614366, 24.521617], [118.558316, 24.51236], [118.557084, 24.572788], [118.512736, 24.60816], [118.444367, 24.614689], [118.363679, 24.567889], [118.375382, 24.536317], [118.242955, 24.51236], [118.169042, 24.559725], [118.150564, 24.583673], [118.121615, 24.570067], [118.084042, 24.528695], [118.048934, 24.418122], [118.088354, 24.408858], [118.081579, 24.35653], [118.112376, 24.357075], [118.158571, 24.269814], [118.115455, 24.229435], [118.074803, 24.225615], [118.019369, 24.197232], [118.000275, 24.152462], [117.936217, 24.100029], [117.927594, 24.039922], [117.910347, 24.012045], [117.864768, 24.004938], [117.807486, 23.947521], [117.792703, 23.906494], [117.762522, 23.886796], [117.691073, 23.888985], [117.671979, 23.878041], [117.651653, 23.815093], [117.660276, 23.789357], [117.601762, 23.70171], [117.54448, 23.715956], [117.501364, 23.70445], [117.493357, 23.642514], [117.454552, 23.628259], [117.463791, 23.584937], [117.387415, 23.555317], [117.302415, 23.550379], [117.291328, 23.571225], [117.192778, 23.5619], [117.085605, 23.536663], [117.044953, 23.539955], [117.01046, 23.502641], [116.963649, 23.507031], [116.92854, 23.530079], [116.888504, 23.501543], [116.895895, 23.476295], [116.874953, 23.447748], [116.874338, 23.447199], [116.871258, 23.416449], [116.871874, 23.4159], [116.782563, 23.313714], [116.798577, 23.244996], [116.821367, 23.240597], [116.806584, 23.200998], [116.74499, 23.215299], [116.701259, 23.198248], [116.665534, 23.158086], [116.566368, 23.134424], [116.550969, 23.109656], [116.566368, 23.088738], [116.557129, 23.056253], [116.576839, 23.014397], [116.544194, 22.996769], [116.50539, 22.930645], [116.449955, 22.936707], [116.382818, 22.91907], [116.302746, 22.951588], [116.259014, 22.932298], [116.239304, 22.921275], [116.14137, 22.835259], [116.104413, 22.816505], [116.05637, 22.844635], [115.99724, 22.826985], [115.965211, 22.800506], [115.931334, 22.802713], [115.883291, 22.78561], [115.829089, 22.734838], [115.796444, 22.739254], [115.788437, 22.809885], [115.760103, 22.834707], [115.696046, 22.84298], [115.654162, 22.865591], [115.583945, 22.82864], [115.570394, 22.786713], [115.541445, 22.755259], [115.609198, 22.753052], [115.565467, 22.684048], [115.575322, 22.650914], [115.471844, 22.697852], [115.430576, 22.684048], [115.381301, 22.684048], [115.349272, 22.712206], [115.338185, 22.776781], [115.319091, 22.783402], [115.230396, 22.776781], [115.236555, 22.82533], [115.190359, 22.818711], [115.190975, 22.77347], [115.154635, 22.80161], [115.076411, 22.788368], [115.053621, 22.747533], [115.02344, 22.726007], [115.039454, 22.713862], [114.945216, 22.645391], [114.927969, 22.621639], [114.922426, 22.549253], [114.88547, 22.538751], [114.866375, 22.591805], [114.746267, 22.581859], [114.743803, 22.632687], [114.728405, 22.651466], [114.73518, 22.724351], [114.749963, 22.764089], [114.709927, 22.787817], [114.689601, 22.7674], [114.601521, 22.730975], [114.591666, 22.690122], [114.567029, 22.685705], [114.51529, 22.655332], [114.579964, 22.661407], [114.603369, 22.638763], [114.559022, 22.583517], [114.568261, 22.560859], [114.614456, 22.545384], [114.628623, 22.513875], [114.611377, 22.481806], [114.549167, 22.465769], [114.506667, 22.438667], [114.476486, 22.459132], [114.472174, 22.522168], [114.427211, 22.589042], [114.381631, 22.60175], [114.321885, 22.587385], [114.294784, 22.563623], [114.232574, 22.539857], [114.222719, 22.553122], [114.166052, 22.559201], [114.156813, 22.543726], [114.095219, 22.534329], [114.082285, 22.512216], [114.031778, 22.503923], [113.976343, 22.510558], [113.954785, 22.491206], [113.952937, 22.486783], [113.893807, 22.442539], [113.869786, 22.459685], [113.856851, 22.539857], [113.803264, 22.593463], [113.765692, 22.665825], [113.758301, 22.683496], [113.733663, 22.736494], [113.678228, 22.726007], [113.717033, 22.645391], [113.740438, 22.534329], [113.691779, 22.514981], [113.668373, 22.4807], [113.631417, 22.475723], [113.573519, 22.41156], [113.608627, 22.408793], [113.624642, 22.443092], [113.66591, 22.438667], [113.669605, 22.416539], [113.627721, 22.349027], [113.604932, 22.339617], [113.617866, 22.315259], [113.595693, 22.304186], [113.594461, 22.228864], [113.558736, 22.212244], [113.53841, 22.209473], [113.534715, 22.174009], [113.554425, 22.142416], [113.554425, 22.107489], [113.567359, 22.075327], [113.527939, 22.073663], [113.45957, 22.043711], [113.442324, 22.009315], [113.330223, 21.96159], [113.319752, 21.909407], [113.266781, 21.871646], [113.235368, 21.887751], [113.1516, 21.979905], [113.142977, 22.012089], [113.091854, 22.065344], [113.086927, 22.12634], [113.045659, 22.088636], [113.032108, 22.04593], [113.053666, 22.012089], [113.047507, 21.956595], [112.989608, 21.869424], [112.929862, 21.838875], [112.893522, 21.84443], [112.841167, 21.920512], [112.792508, 21.921067], [112.68595, 21.810541], [112.647146, 21.758302], [112.535661, 21.753856], [112.497473, 21.785535], [112.445734, 21.803317], [112.427256, 21.789981], [112.415553, 21.734956], [112.353343, 21.707157], [112.238778, 21.702153], [112.236315, 21.727173], [112.196894, 21.736624], [112.192583, 21.789425], [112.136532, 21.793871], [112.036134, 21.761637], [111.956062, 21.710494], [111.954214, 21.667674], [111.997946, 21.657107], [112.026895, 21.633744], [111.972692, 21.603144], [111.941896, 21.607039], [111.887693, 21.578659], [111.810084, 21.555283], [111.832258, 21.578659], [111.794686, 21.61149], [111.736788, 21.609821], [111.693672, 21.590345], [111.677658, 21.529677], [111.650556, 21.512418], [111.609904, 21.530234], [111.560629, 21.50518], [111.521825, 21.517429], [111.494724, 21.501282], [111.444217, 21.514088], [111.382623, 21.495714], [111.353058, 21.464528], [111.28592, 21.41885], [111.257587, 21.41495], [111.250196, 21.45116], [111.276065, 21.443362], [111.28284, 21.485691], [111.171355, 21.458401], [111.103602, 21.455616], [111.034617, 21.438906], [110.929291, 21.375945], [110.888639, 21.367585], [110.796248, 21.37483], [110.768531, 21.364799], [110.713097, 21.3124], [110.65951, 21.239902], [110.626249, 21.215915], [110.534474, 21.204198], [110.501213, 21.217588], [110.451322, 21.186343], [110.422373, 21.190807], [110.39096, 21.124949], [110.296722, 21.093684], [110.24991, 21.045098], [110.241903, 21.016051], [110.208642, 21.050684], [110.204947, 21.003202], [110.180925, 20.98197], [110.184005, 20.891979], [110.209874, 20.860106], [110.269004, 20.839972], [110.327519, 20.847802], [110.350924, 20.84165], [110.393424, 20.816479], [110.407591, 20.731987], [110.392192, 20.682724], [110.411286, 20.670966], [110.466105, 20.680485], [110.487047, 20.640167], [110.499982, 20.572386], [110.550489, 20.47262], [110.54125, 20.42047], [110.491358, 20.373912], [110.452554, 20.311064], [110.425453, 20.291419], [110.384185, 20.293103], [110.349076, 20.258859], [110.296722, 20.249314], [110.220345, 20.25156], [110.168606, 20.219553], [110.118099, 20.219553], [110.082375, 20.258859], [109.993679, 20.254368], [109.929006, 20.211691], [109.909296, 20.236961], [109.916071, 20.316677], [109.861252, 20.376717], [109.864948, 20.40196], [109.895745, 20.42776], [109.888354, 20.475423], [109.839695, 20.489439], [109.811977, 20.541566], [109.813825, 20.574627], [109.793499, 20.615522], [109.74484, 20.621124], [109.730057, 20.719673], [109.711579, 20.774519], [109.664768, 20.862343], [109.655529, 20.929435], [109.674007, 21.067997], [109.674623, 21.136671], [109.763934, 21.226514], [109.757775, 21.346963], [109.770709, 21.359783], [109.868644, 21.365913], [109.904368, 21.429992], [109.894513, 21.442248], [109.819369, 21.445033], [109.785492, 21.45673], [109.704188, 21.462857], [109.654913, 21.493487], [109.612413, 21.556953], [109.581, 21.548047], [109.576689, 21.493487], [109.540964, 21.466199], [109.484914, 21.453388], [109.41716, 21.438906], [109.245929, 21.425536], [109.186183, 21.390991], [109.138756, 21.388762], [109.095024, 21.419407], [109.046365, 21.424421], [109.039589, 21.457844], [109.074698, 21.489589], [109.142451, 21.511861], [109.138756, 21.567528], [109.110422, 21.568085], [109.09872, 21.571424], [109.093792, 21.579215], [108.937959, 21.589789], [108.881293, 21.627068], [108.83325, 21.610933], [108.801837, 21.626512], [108.745786, 21.602587], [108.734084, 21.626512], [108.735931, 21.628181], [108.678033, 21.659331], [108.658939, 21.643757], [108.626294, 21.67991], [108.591802, 21.677129], [108.492635, 21.554727], [108.397781, 21.533017], [108.330027, 21.540254], [108.230245, 21.491259], [108.210535, 21.505737], [108.249955, 21.561406], [108.241332, 21.599805], [108.205608, 21.597579], [108.156332, 21.55083], [108.193905, 21.519656], [108.108289, 21.508521], [108.034376, 21.545821], [107.958, 21.534131], [107.929051, 21.585893], [107.893942, 21.596466], [107.892095, 21.622617], [107.863761, 21.650988], [107.837892, 21.640419], [107.807711, 21.655438], [107.712856, 21.616497], [107.603219, 21.597579], [107.584741, 21.614828], [107.547168, 21.58645], [107.486806, 21.59591], [107.500973, 21.613715], [107.477567, 21.659888], [107.431372, 21.642088], [107.388256, 21.594241], [107.363619, 21.602031], [107.356843, 21.667674], [107.310648, 21.733844], [107.271844, 21.727173], [107.242279, 21.703265], [107.199163, 21.718833], [107.194851, 21.736624], [107.148656, 21.758858], [107.093837, 21.803317], [107.018077, 21.81943], [107.018693, 21.859427], [107.058729, 21.887196], [107.05996, 21.914959], [106.999598, 21.947714], [106.974345, 21.923288], [106.935541, 21.933836], [106.926302, 21.967695], [106.859164, 21.986009], [106.802498, 21.98157], [106.790179, 22.004876], [106.73844, 22.008205], [106.698404, 21.959925], [106.683006, 21.999882], [106.706411, 22.021521], [106.71565, 22.089745], [106.691629, 22.13521], [106.706411, 22.160707], [106.673151, 22.182322], [106.7021, 22.207257], [106.688549, 22.260438], [106.670071, 22.283144], [106.663296, 22.33076], [106.562897, 22.345706], [106.588767, 22.374486], [106.560434, 22.455813], [106.588151, 22.472958], [106.585071, 22.517192], [106.61402, 22.602303], [106.650361, 22.575228], [106.711955, 22.575228], [106.756302, 22.68957], [106.780324, 22.708894], [106.768621, 22.739254], [106.820976, 22.768504], [106.838838, 22.803265], [106.813585, 22.817608], [106.808657, 22.817608], [106.804346, 22.816505], [106.801882, 22.815401], [106.796338, 22.812091], [106.784636, 22.812643], [106.78094, 22.813195], [106.779708, 22.813195], [106.779092, 22.813746], [106.778476, 22.814298], [106.776012, 22.813746], [106.774781, 22.812643], [106.709491, 22.866142], [106.716882, 22.881582], [106.674998, 22.891506], [106.657136, 22.863385], [106.631267, 22.88103], [106.606013, 22.925684], [106.562282, 22.923479], [106.525941, 22.946628], [106.504383, 22.91025], [106.41384, 22.877171], [106.37134, 22.878273], [106.366413, 22.857871], [106.286957, 22.867245], [106.258007, 22.889852], [106.270326, 22.907494], [106.206885, 22.978588], [106.153914, 22.988505], [106.106486, 22.980792], [106.08616, 22.996218], [106.019639, 22.990709], [105.994385, 22.93781], [105.959277, 22.948832], [105.893987, 22.936707], [105.879205, 22.916865], [105.839169, 22.987403], [105.805908, 22.994565], [105.780039, 23.022659], [105.74185, 23.030921], [105.724604, 23.06231], [105.648844, 23.078828], [105.625438, 23.064513], [105.574931, 23.066165], [105.558916, 23.177893], [105.542902, 23.184495], [105.50225, 23.202648], [105.445584, 23.292827], [105.416018, 23.283482], [105.372903, 23.317561], [105.353809, 23.362069], [105.325475, 23.390086], [105.260186, 23.31811], [105.238012, 23.26424], [105.181962, 23.279084], [105.122215, 23.247745], [105.093266, 23.260942], [104.958991, 23.188896], [104.949136, 23.152033], [104.912796, 23.175693], [104.882615, 23.163589], [104.874608, 23.123417], [104.804391, 23.110207], [104.821021, 23.032022], [104.860441, 22.970874], [104.846275, 22.926235], [104.772362, 22.893711], [104.760659, 22.862282], [104.732942, 22.852356], [104.737869, 22.825882], [104.674428, 22.817056], [104.596203, 22.846289], [104.527834, 22.814298], [104.498885, 22.774574], [104.422508, 22.734838], [104.375697, 22.690122], [104.323342, 22.728767], [104.272835, 22.73815], [104.256821, 22.77347], [104.274067, 22.828088], [104.261748, 22.841877], [104.224176, 22.826434], [104.117618, 22.808781], [104.089901, 22.768504], [104.045553, 22.728215], [104.04309, 22.67687], [104.022148, 22.593463], [104.009213, 22.575228], [104.009213, 22.517745], [103.964865, 22.502265], [103.894032, 22.564728], [103.875554, 22.565833], [103.863851, 22.584069], [103.825047, 22.615562], [103.766533, 22.688465], [103.743127, 22.697852], [103.740048, 22.709446], [103.642113, 22.794989], [103.567585, 22.701164], [103.580519, 22.66693], [103.529396, 22.59291], [103.50907, 22.601198], [103.457947, 22.658646], [103.436389, 22.6973], [103.441317, 22.753052], [103.375411, 22.794989], [103.323057, 22.807678], [103.321209, 22.777885], [103.288564, 22.732078], [103.283021, 22.678526], [103.220195, 22.643734], [103.195557, 22.648153], [103.161065, 22.590147], [103.183238, 22.558649], [103.071753, 22.488441], [103.081608, 22.454154], [103.030485, 22.441432], [102.986754, 22.477935], [102.930703, 22.482359], [102.892515, 22.533223], [102.880196, 22.586832], [102.82353, 22.623296], [102.80074, 22.620534], [102.688639, 22.70006], [102.657226, 22.687913], [102.607335, 22.730975], [102.569763, 22.701164], [102.551285, 22.743669], [102.510633, 22.774574], [102.45951, 22.762986], [102.43672, 22.699508], [102.384365, 22.679631], [102.404691, 22.629925], [102.356648, 22.563623], [102.322771, 22.554227], [102.25625, 22.457473], [102.270416, 22.419858], [102.179257, 22.430369], [102.145381, 22.397727], [102.131214, 22.430922], [102.046214, 22.458026], [101.978461, 22.427603], [101.907628, 22.437007], [101.901469, 22.384447], [101.862665, 22.389427], [101.823244, 22.42705], [101.824476, 22.45692], [101.774585, 22.506135], [101.715455, 22.477935], [101.672339, 22.47517], [101.648318, 22.400494], [101.671723, 22.372826], [101.625528, 22.28259], [101.56455, 22.269299], [101.547304, 22.238282], [101.596579, 22.161262], [101.602738, 22.131883], [101.573789, 22.115251], [101.626144, 22.005986], [101.606434, 21.967695], [101.666796, 21.934391], [101.701288, 21.938832], [101.700057, 21.897191], [101.735165, 21.875534], [101.740093, 21.845541], [101.771506, 21.833319], [101.747484, 21.729953], [101.76781, 21.716054], [101.780129, 21.640975], [101.807846, 21.644313], [101.828788, 21.617054], [101.804766, 21.577546], [101.754875, 21.58478], [101.755491, 21.538027], [101.772737, 21.512975], [101.741324, 21.482906], [101.749948, 21.409379], [101.730238, 21.336929], [101.745636, 21.297345], [101.791832, 21.285636], [101.833715, 21.252731], [101.834331, 21.204756], [101.794911, 21.208104], [101.76473, 21.147835], [101.703136, 21.14616], [101.672339, 21.194713], [101.605818, 21.172392], [101.588572, 21.191365], [101.601506, 21.233208], [101.532521, 21.252174], [101.439514, 21.227072], [101.387775, 21.225956], [101.290457, 21.17853], [101.222088, 21.234324], [101.246725, 21.275598], [101.244877, 21.302364], [101.183899, 21.334699], [101.142631, 21.409379], [101.194986, 21.424979], [101.193138, 21.473996], [101.225167, 21.499055], [101.210385, 21.509077], [101.209153, 21.55751], [101.146943, 21.560293], [101.169117, 21.590345], [101.153102, 21.669343], [101.116762, 21.691032], [101.111835, 21.746074], [101.123537, 21.771642], [101.089661, 21.773865], [101.015132, 21.707157], [100.937524, 21.693812], [100.936292, 21.694368], [100.899335, 21.684915], [100.896872, 21.68269], [100.870386, 21.67268], [100.847597, 21.634856], [100.804481, 21.609821], [100.789082, 21.570867], [100.753358, 21.555283], [100.730568, 21.518542], [100.691764, 21.510748], [100.579047, 21.451717], [100.526692, 21.471211], [100.48296, 21.458958], [100.437381, 21.533017], [100.349302, 21.528564], [100.298795, 21.477894], [100.235353, 21.466756], [100.206404, 21.509634], [100.184846, 21.516315], [100.168831, 21.482906], [100.131259, 21.504066], [100.123252, 21.565302], [100.107853, 21.585337], [100.169447, 21.663225], [100.131875, 21.699929], [100.094303, 21.702709], [100.049339, 21.669899], [99.991441, 21.703821], [99.944014, 21.821097], [99.960028, 21.907186], [99.982202, 21.919401], [100.000064, 21.973245], [99.965571, 22.014309], [99.972347, 22.053141], [99.871333, 22.067007], [99.870101, 22.029288], [99.762927, 22.068117], [99.696406, 22.067562], [99.648979, 22.100835], [99.581841, 22.103053], [99.578762, 22.098617], [99.562747, 22.113034], [99.516552, 22.099726], [99.486987, 22.128557], [99.400139, 22.100281], [99.35456, 22.095845], [99.294814, 22.109152], [99.219669, 22.110816], [99.156227, 22.159599], [99.188256, 22.162924], [99.175321, 22.185647], [99.207966, 22.232188], [99.235683, 22.250468], [99.233836, 22.296434], [99.278183, 22.34626], [99.251698, 22.393301], [99.297277, 22.41156], [99.382277, 22.493418], [99.359487, 22.535435], [99.385973, 22.57136], [99.339777, 22.708894], [99.31514, 22.737598], [99.326842, 22.751396], [99.385357, 22.761882], [99.401371, 22.826434], [99.462965, 22.844635], [99.43648, 22.913557], [99.446951, 22.934503], [99.531334, 22.897019], [99.563363, 22.925684], [99.533798, 22.961507], [99.517168, 23.006685], [99.528255, 23.065614], [99.477747, 23.083233], [99.440791, 23.079379], [99.380429, 23.099748], [99.3484, 23.12892], [99.281879, 23.101399], [99.255393, 23.077727], [99.187024, 23.100299], [99.106336, 23.086536], [99.048438, 23.11461], [99.057677, 23.164689], [99.002242, 23.160287], [98.906772, 23.185595], [98.889525, 23.209249], [98.928946, 23.26589], [98.936953, 23.309866], [98.906772, 23.331849], [98.872895, 23.329651], [98.920938, 23.360971], [98.912315, 23.426333], [98.874743, 23.483431], [98.826084, 23.470257], [98.80391, 23.540504], [98.844562, 23.578904], [98.882134, 23.595358], [98.882134, 23.620035], [98.847026, 23.632097], [98.835939, 23.683625], [98.811917, 23.703354], [98.824236, 23.727462], [98.784816, 23.781691], [98.696121, 23.784429], [98.669019, 23.800857], [98.701664, 23.834254], [98.68565, 23.90157], [98.701048, 23.946427], [98.673331, 23.960647], [98.701048, 23.981427], [98.727533, 23.970491], [98.773729, 24.022431], [98.807606, 24.025164], [98.895069, 24.098936], [98.876591, 24.15137], [98.841482, 24.126794], [98.818692, 24.133348], [98.71891, 24.127887], [98.681954, 24.100029], [98.646229, 24.106038], [98.593875, 24.08036], [98.547063, 24.128433], [98.487933, 24.123517], [98.48239, 24.122425], [98.37768, 24.114232], [98.343187, 24.098936], [98.219999, 24.113685], [98.19721, 24.09839], [98.132536, 24.09238], [98.125761, 24.092927], [98.123297, 24.092927], [98.096196, 24.08637], [98.091268, 24.085824], [97.995182, 24.04648], [97.984095, 24.031177], [97.902175, 24.014231], [97.896015, 23.974319], [97.863371, 23.978693], [97.8104, 23.943146], [97.795617, 23.951897], [97.763588, 23.907041], [97.72848, 23.895551], [97.718009, 23.867643], [97.684132, 23.876946], [97.647176, 23.840823], [97.640401, 23.866001], [97.618227, 23.888438], [97.5283, 23.926736], [97.529531, 23.943146], [97.572647, 23.983068], [97.628698, 24.004938], [97.637321, 24.04812], [97.697067, 24.092927], [97.700763, 24.093473], [97.730944, 24.113685], [97.743262, 24.159561], [97.748806, 24.160653], [97.754349, 24.163929], [97.72848, 24.183585], [97.729712, 24.227252], [97.767284, 24.258357], [97.721089, 24.295999], [97.665038, 24.296544], [97.662574, 24.339083], [97.716161, 24.358711], [97.679821, 24.401228], [97.669966, 24.452993], [97.588662, 24.435559], [97.530147, 24.443187], [97.554785, 24.490577], [97.570799, 24.602719], [97.569567, 24.708236], [97.547394, 24.739221], [97.569567, 24.765852], [97.652103, 24.790846], [97.680437, 24.827243], [97.765436, 24.823984], [97.797465, 24.845709], [97.785762, 24.876117], [97.729712, 24.908689], [97.716777, 24.978147], [97.727864, 25.04377], [97.719857, 25.080634], [97.743262, 25.078466], [97.796233, 25.155954], [97.839349, 25.27074], [97.875689, 25.25721], [97.904023, 25.216609], [97.940363, 25.214985], [98.0075, 25.279399], [98.006884, 25.298338], [98.06971, 25.311864], [98.099891, 25.354055], [98.101123, 25.388662], [98.137464, 25.381633], [98.15779, 25.457307], [98.131304, 25.51025], [98.163949, 25.524292], [98.189818, 25.569108], [98.170724, 25.620383], [98.247717, 25.607971], [98.314854, 25.543193], [98.326557, 25.566409], [98.402317, 25.593939], [98.409709, 25.664084], [98.457752, 25.682963], [98.461448, 25.735267], [98.476846, 25.77731], [98.529201, 25.840884], [98.553839, 25.845731], [98.640686, 25.798864], [98.677642, 25.816105], [98.705976, 25.855426], [98.686881, 25.925955], [98.637606, 25.971696], [98.614201, 25.968468], [98.602498, 26.054523], [98.575396, 26.118485], [98.632679, 26.145887], [98.656084, 26.139977], [98.661012, 26.087852], [98.720142, 26.127082], [98.712751, 26.156093], [98.735541, 26.185097], [98.713367, 26.231274], [98.672715, 26.239863], [98.681338, 26.308016], [98.733693, 26.350926], [98.750323, 26.424372], [98.741084, 26.432947], [98.757098, 26.491881], [98.753403, 26.559349], [98.773113, 26.578083], [98.781736, 26.620893], [98.762642, 26.660478], [98.770033, 26.690424], [98.746012, 26.696841], [98.762026, 26.798916], [98.730613, 26.851253], [98.757098, 26.877947], [98.732461, 27.002257], [98.762642, 27.018252], [98.765722, 27.05077], [98.712751, 27.075817], [98.713983, 27.139744], [98.696121, 27.211086], [98.723222, 27.221198], [98.717062, 27.271211], [98.734925, 27.287168], [98.741084, 27.330241], [98.706591, 27.362136], [98.702896, 27.412618], [98.686881, 27.425367], [98.704744, 27.462014], [98.685034, 27.484315], [98.706591, 27.553313], [98.662244, 27.586734], [98.650541, 27.567637], [98.583404, 27.571351], [98.587099, 27.587265], [98.554454, 27.646126], [98.53536, 27.620676], [98.474998, 27.634462], [98.444201, 27.665209], [98.430035, 27.653547], [98.429419, 27.549068], [98.388767, 27.515104], [98.337644, 27.508734], [98.317318, 27.51935], [98.310542, 27.583552], [98.283441, 27.654608], [98.234166, 27.690648], [98.215688, 27.810874], [98.169492, 27.851096], [98.205217, 27.889716], [98.187355, 27.939426], [98.143007, 27.948942], [98.133152, 27.990698], [98.160253, 28.101089], [98.139311, 28.142259], [98.097427, 28.166531], [98.090036, 28.195544], [98.056775, 28.202401], [98.03337, 28.187105], [98.008116, 28.214003], [98.020435, 28.253548], [97.907718, 28.363141], [97.871378, 28.361561], [97.842429, 28.326798], [97.801161, 28.326798], [97.769748, 28.3742], [97.738335, 28.396313], [97.737103, 28.465782], [97.68598, 28.519958], [97.634857, 28.532051], [97.60406, 28.515225], [97.569567, 28.541515], [97.521524, 28.495766], [97.507974, 28.46473], [97.521524, 28.444736], [97.499966, 28.428948], [97.485184, 28.38631], [97.488879, 28.347341], [97.518445, 28.327852], [97.469169, 28.30309], [97.461162, 28.26778], [97.422358, 28.297293], [97.402032, 28.279903], [97.398336, 28.238786], [97.349677, 28.235623], [97.362612, 28.199236], [97.352757, 28.149646], [97.326887, 28.132759], [97.340438, 28.104785], [97.305945, 28.071522], [97.320728, 28.054095], [97.375547, 28.062545], [97.378626, 28.031382], [97.413119, 28.01342], [97.379242, 27.970087], [97.372467, 27.907699], [97.386634, 27.882839], [97.324424, 27.880723], [97.303482, 27.913516], [97.253591, 27.891832], [97.167975, 27.811932], [97.103301, 27.780697], [97.097758, 27.740979], [97.062649, 27.742568], [97.049099, 27.81405], [97.008447, 27.807698], [96.972722, 27.861149], [96.908049, 27.884426], [96.849534, 27.874375], [96.810114, 27.890245], [96.784245, 27.931495], [96.711564, 27.9574], [96.690622, 27.948942], [96.635188, 27.994926], [96.623485, 28.024514], [96.538485, 28.075218], [96.499681, 28.067297], [96.46334, 28.143314], [96.426384, 28.161782], [96.395587, 28.143842], [96.398667, 28.118509], [96.367254, 28.118509], [96.298269, 28.140148], [96.275479, 28.228241], [96.194175, 28.212949], [96.098088, 28.212421], [96.074683, 28.193434], [95.989067, 28.198181], [95.936096, 28.240368], [95.907763, 28.241422], [95.899756, 28.278322], [95.874502, 28.29782], [95.832003, 28.295186], [95.787655, 28.270416], [95.740228, 28.275159], [95.674322, 28.254075], [95.528345, 28.182885], [95.437802, 28.161782], [95.39715, 28.142259], [95.371896, 28.110063], [95.352802, 28.04089], [95.32878, 28.017646], [95.28628, 27.939955], [95.067006, 27.840512], [95.015267, 27.82887], [94.947514, 27.792345], [94.88592, 27.743098], [94.836645, 27.728796], [94.78121, 27.699127], [94.722696, 27.683759], [94.660486, 27.650367], [94.524979, 27.596282], [94.478168, 27.602116], [94.443675, 27.585143], [94.399944, 27.589386], [94.353132, 27.578778], [94.277372, 27.58143], [94.220705, 27.536333], [94.147409, 27.458297], [94.056866, 27.375423], [93.970634, 27.30525], [93.849294, 27.168499], [93.841903, 27.045973], [93.817265, 27.025183], [93.747048, 27.015587], [93.625092, 26.955323], [93.56781, 26.938252], [93.232739, 26.906769], [93.111399, 26.880082], [93.050421, 26.883819], [92.909371, 26.914241], [92.802813, 26.895028], [92.682089, 26.947855], [92.64698, 26.952656], [92.549046, 26.941453], [92.496691, 26.921711], [92.404916, 26.9025], [92.28604, 26.892359], [92.197961, 26.86994], [92.109265, 26.854991], [92.124664, 26.960124], [92.076005, 27.041175], [92.043976, 27.052902], [92.02673, 27.108318], [92.032273, 27.167967], [92.061222, 27.190327], [92.071077, 27.237694], [92.091403, 27.264296], [92.125896, 27.273339], [92.064918, 27.391365], [92.021802, 27.444489], [92.010715, 27.474758], [91.946657, 27.464138], [91.839484, 27.489624], [91.753868, 27.462545], [91.71876, 27.467324], [91.663325, 27.507142], [91.626985, 27.509265], [91.585101, 27.540578], [91.564775, 27.58196], [91.582637, 27.598933], [91.562311, 27.627569], [91.570934, 27.650897], [91.622673, 27.692238], [91.642383, 27.7664], [91.610355, 27.819343], [91.544449, 27.820401], [91.561079, 27.855329], [91.618978, 27.856916], [91.611586, 27.891303], [91.552456, 27.90717], [91.486551, 27.937311], [91.490246, 27.971672], [91.464993, 28.002852], [91.309776, 28.057791], [91.251878, 27.970615], [91.216153, 27.989113], [91.162567, 27.968501], [91.147784, 27.927794], [91.155175, 27.894476], [91.113292, 27.846333], [91.025828, 27.857445], [90.96485, 27.900294], [90.976553, 27.935725], [90.96177, 27.9537], [90.896481, 27.946299], [90.853365, 27.969029], [90.806554, 28.015005], [90.802242, 28.040362], [90.741264, 28.053038], [90.701844, 28.076274], [90.591591, 28.021345], [90.569417, 28.044059], [90.513983, 28.062016], [90.47949, 28.044587], [90.43699, 28.063073], [90.384019, 28.06096], [90.367389, 28.088946], [90.297172, 28.153868], [90.231882, 28.144897], [90.189999, 28.161782], [90.166593, 28.187632], [90.124709, 28.190797], [90.103151, 28.141731], [90.07297, 28.155451], [90.03355, 28.136981], [90.017536, 28.162837], [89.976268, 28.189215], [89.901739, 28.18183], [89.869094, 28.221386], [89.789638, 28.240895], [89.779167, 28.197127], [89.720037, 28.170224], [89.605472, 28.161782], [89.541414, 28.088418], [89.511233, 28.086307], [89.461958, 28.03191], [89.44348, 27.968501], [89.375727, 27.875962], [89.295655, 27.84845], [89.238988, 27.796581], [89.184786, 27.673689], [89.131815, 27.633402], [89.128735, 27.611131], [89.163228, 27.574534], [89.109025, 27.537925], [89.095474, 27.471572], [89.132431, 27.441302], [89.182938, 27.373829], [89.152757, 27.319076], [89.077612, 27.287168], [89.067757, 27.240354], [88.984605, 27.208957], [88.942105, 27.261636], [88.911924, 27.272807], [88.920548, 27.325456], [88.901453, 27.327583], [88.867577, 27.3818], [88.838012, 27.37808], [88.809063, 27.405711], [88.783193, 27.467324], [88.797976, 27.521473], [88.770874, 27.563924], [88.813374, 27.606889], [88.816454, 27.641354], [88.852178, 27.671039], [88.850331, 27.710783], [88.870657, 27.743098], [88.863265, 27.811932], [88.888519, 27.846863], [88.864497, 27.921448], [88.846635, 27.921448], [88.842939, 28.006023], [88.812142, 28.018175], [88.764099, 28.068353], [88.67602, 28.068353], [88.645223, 28.111119], [88.620585, 28.091586], [88.565151, 28.083139], [88.554064, 28.027684], [88.498013, 28.04089], [88.469064, 28.009721], [88.43334, 28.002852], [88.401311, 27.976958], [88.357579, 27.986471], [88.254101, 27.939426], [88.242398, 27.967444], [88.203594, 27.943127], [88.156783, 27.957929], [88.120442, 27.915103], [88.137689, 27.878607], [88.111819, 27.864852], [88.090877, 27.885484], [88.037291, 27.901881], [87.982472, 27.884426], [87.930733, 27.909285], [87.826639, 27.927794], [87.782292, 27.890774], [87.77798, 27.860091], [87.727473, 27.802933], [87.668343, 27.809815], [87.670191, 27.832045], [87.598126, 27.814579], [87.58088, 27.859562], [87.45954, 27.820931], [87.418272, 27.825694], [87.421967, 27.856916], [87.364069, 27.824106], [87.317258, 27.826753], [87.280917, 27.845275], [87.249504, 27.839454], [87.227946, 27.812991], [87.173744, 27.818284], [87.118309, 27.840512], [87.080737, 27.910872], [87.035157, 27.946299], [86.935375, 27.955286], [86.926752, 27.985942], [86.885484, 27.995983], [86.864542, 28.022401], [86.827586, 28.012363], [86.756753, 28.032967], [86.768456, 28.06941], [86.74813, 28.089474], [86.700086, 28.101617], [86.662514, 28.092114], [86.647732, 28.06941], [86.611391, 28.069938], [86.60092, 28.097922], [86.568891, 28.103201], [86.55842, 28.047757], [86.537478, 28.044587], [86.513457, 27.996511], [86.514689, 27.954757], [86.475884, 27.944713], [86.450015, 27.908757], [86.414906, 27.904526], [86.393349, 27.926736], [86.308965, 27.950528], [86.27324, 27.976958], [86.231972, 27.974315], [86.206103, 28.084195], [86.223965, 28.092642], [86.19132, 28.167058], [86.140198, 28.114814], [86.128495, 28.086835], [86.086611, 28.090002], [86.082915, 28.018175], [86.125415, 27.923035], [86.053966, 27.900823], [86.002227, 27.90717], [85.949256, 27.937311], [85.980053, 27.984357], [85.901213, 28.053566], [85.898749, 28.101617], [85.871648, 28.124843], [85.854402, 28.172334], [85.791576, 28.195544], [85.753388, 28.227714], [85.720743, 28.372093], [85.682555, 28.375779], [85.650526, 28.283592], [85.601251, 28.254075], [85.602483, 28.295712], [85.520563, 28.326798], [85.458969, 28.332593], [85.415853, 28.321003], [85.379512, 28.274105], [85.349947, 28.298347], [85.272339, 28.282538], [85.209513, 28.338914], [85.179948, 28.324164], [85.113427, 28.344708], [85.129441, 28.377885], [85.108499, 28.461047], [85.160238, 28.49261], [85.189803, 28.544669], [85.18426, 28.587244], [85.195963, 28.624022], [85.155926, 28.643983], [85.126361, 28.676016], [85.05676, 28.674441], [84.995782, 28.611414], [84.981616, 28.586193], [84.896616, 28.587244], [84.857196, 28.567798], [84.773428, 28.610363], [84.698284, 28.633478], [84.699515, 28.671816], [84.669334, 28.680742], [84.650856, 28.714338], [84.620059, 28.732182], [84.557233, 28.74635], [84.483321, 28.735331], [84.445133, 28.764189], [84.434046, 28.823978], [84.404481, 28.828173], [84.408176, 28.85386], [84.340423, 28.866963], [84.330568, 28.859101], [84.268358, 28.895261], [84.234481, 28.889497], [84.228322, 28.949738], [84.248648, 29.030353], [84.224626, 29.049189], [84.194445, 29.045004], [84.192597, 29.084236], [84.20738, 29.118749], [84.176583, 29.133909], [84.17104, 29.19453], [84.197525, 29.210202], [84.203068, 29.239972], [84.130388, 29.239972], [84.116837, 29.286438], [84.052163, 29.296877], [84.002272, 29.291658], [83.986874, 29.325057], [83.949301, 29.312533], [83.911729, 29.323491], [83.851367, 29.294789], [83.82057, 29.294267], [83.800244, 29.249372], [83.727563, 29.244672], [83.667201, 29.200277], [83.656114, 29.16736], [83.596368, 29.174153], [83.57789, 29.203934], [83.548941, 29.201322], [83.492274, 29.280174], [83.463941, 29.285916], [83.450391, 29.332883], [83.423289, 29.361053], [83.415898, 29.420496], [83.383253, 29.42206], [83.325355, 29.502826], [83.27608, 29.505951], [83.266841, 29.571035], [83.217565, 29.60018], [83.164595, 29.595496], [83.159667, 29.61735], [83.12887, 29.623593], [83.088834, 29.604863], [83.011226, 29.667804], [82.966878, 29.658963], [82.9484, 29.704718], [82.885574, 29.689122], [82.830756, 29.687562], [82.816589, 29.717192], [82.774089, 29.726548], [82.757459, 29.761881], [82.691553, 29.766037], [82.737749, 29.80655], [82.703872, 29.847566], [82.6238, 29.834588], [82.64351, 29.868846], [82.609017, 29.886489], [82.560974, 29.955476], [82.498148, 29.947698], [82.474743, 29.973622], [82.431011, 29.989692], [82.412533, 30.011978], [82.368185, 30.014051], [82.333693, 30.045138], [82.311519, 30.035813], [82.246845, 30.071555], [82.17786, 30.06793], [82.183403, 30.12178], [82.207425, 30.143519], [82.188947, 30.18543], [82.142135, 30.200948], [82.114418, 30.226806], [82.11873, 30.279019], [82.132896, 30.30434], [82.104563, 30.346182], [82.060215, 30.332237], [82.022027, 30.339468], [81.99123, 30.322939], [81.954274, 30.355995], [81.939491, 30.344633], [81.872354, 30.373035], [81.759021, 30.385426], [81.723913, 30.407623], [81.63029, 30.446842], [81.613044, 30.412784], [81.566232, 30.428782], [81.555761, 30.369421], [81.494783, 30.381296], [81.454131, 30.412268], [81.418407, 30.420525], [81.406704, 30.40401], [81.432573, 30.379231], [81.406088, 30.369421], [81.399929, 30.319323], [81.427646, 30.305373], [81.406088, 30.291938], [81.419023, 30.270232], [81.397465, 30.240767], [81.393769, 30.199396], [81.335871, 30.149729], [81.269349, 30.153351], [81.293371, 30.094859], [81.2829, 30.061197], [81.247792, 30.032705], [81.256415, 30.011978], [81.225618, 30.005759], [81.131995, 30.016124], [81.09627, 30.052909], [81.110437, 30.085538], [81.085799, 30.100554], [81.082104, 30.151281], [81.038372, 30.205086], [81.034677, 30.246971], [80.996488, 30.267648], [80.933662, 30.266614], [80.910873, 30.30279], [80.81725, 30.321389], [80.719316, 30.414848], [80.692214, 30.416913], [80.633084, 30.458707], [80.585041, 30.463866], [80.549316, 30.448905], [80.504969, 30.483466], [80.446454, 30.495327], [80.43044, 30.515952], [80.357759, 30.520592], [80.322035, 30.564403], [80.261673, 30.566465], [80.214245, 30.586044], [80.143412, 30.55822], [80.04363, 30.603559], [80.014065, 30.661748], [79.970333, 30.685941], [79.955551, 30.738422], [79.961094, 30.771337], [79.900732, 30.7991], [79.913051, 30.833022], [79.890877, 30.855116], [79.835443, 30.851006], [79.75845, 30.936769], [79.729501, 30.941389], [79.668523, 30.980392], [79.660516, 30.956787], [79.59769, 30.925989], [79.550879, 30.957813], [79.505915, 31.027584], [79.427075, 31.018353], [79.424611, 31.061425], [79.404901, 31.071678], [79.35809, 31.031174], [79.316206, 31.01784], [79.33222, 30.969103], [79.227511, 30.949088], [79.205953, 31.0004], [79.181931, 31.015788], [79.096931, 30.992192], [79.059359, 31.028097], [79.010084, 31.043994], [78.97436, 31.115751], [78.997765, 31.158779], [78.930628, 31.220726], [78.923852, 31.246824], [78.884432, 31.277006], [78.865338, 31.312804], [78.859179, 31.289281], [78.795121, 31.301043], [78.755085, 31.355742], [78.760013, 31.392531], [78.792041, 31.435944], [78.755701, 31.478316], [78.729832, 31.478316], [78.740303, 31.532912], [78.779723, 31.545154], [78.833925, 31.584927], [78.845628, 31.609905], [78.806824, 31.64099], [78.798817, 31.675629], [78.763092, 31.668499], [78.706426, 31.778453], [78.654687, 31.819144], [78.665158, 31.851684], [78.739687, 31.885228], [78.768636, 31.92638], [78.762476, 31.947203], [78.705194, 31.988835], [78.60726, 32.023851], [78.609107, 32.052768], [78.527188, 32.11463], [78.509941, 32.147065], [78.469905, 32.127808], [78.429869, 32.194683], [78.430485, 32.212407], [78.475449, 32.236708], [78.508709, 32.297939], [78.480992, 32.329297], [78.483456, 32.357106], [78.458818, 32.379853], [78.472985, 32.435431], [78.426174, 32.502584], [78.395377, 32.530339], [78.424942, 32.565652], [78.500086, 32.580782], [78.518564, 32.605993], [78.577695, 32.615067], [78.588782, 32.637748], [78.628202, 32.630188], [78.675013, 32.658408], [78.6861, 32.680071], [78.741534, 32.703743], [78.74215, 32.654881], [78.781571, 32.608009], [78.760629, 32.563635], [78.782186, 32.480373], [78.81052, 32.436441], [78.87273, 32.40512], [78.904142, 32.374798], [78.970664, 32.331826], [79.005772, 32.375304], [79.067982, 32.380863], [79.103091, 32.369744], [79.124649, 32.416235], [79.135736, 32.472295], [79.180083, 32.492994], [79.190554, 32.511669], [79.252148, 32.516715], [79.272474, 32.561113], [79.308199, 32.596918], [79.299575, 32.637244], [79.27309, 32.678056], [79.301423, 32.728919], [79.275554, 32.778746], [79.225047, 32.784281], [79.237982, 32.846145], [79.227511, 32.89038], [79.255844, 32.942628], [79.204721, 32.964724], [79.162837, 33.01191], [79.139431, 33.117735], [79.162221, 33.165841], [79.152366, 33.184375], [79.10925, 33.200401], [79.072294, 33.22844], [79.083997, 33.245459], [79.041497, 33.268479], [79.022403, 33.323504], [78.9682, 33.334505], [78.949722, 33.376495], [78.896751, 33.41247], [78.84994, 33.419963], [78.816679, 33.480882], [78.74215, 33.55323], [78.755085, 33.623025], [78.713201, 33.623025], [78.684868, 33.654415], [78.692259, 33.676331], [78.779723, 33.73259], [78.758165, 33.790802], [78.766172, 33.823124], [78.756317, 33.8773], [78.762476, 33.90959], [78.734143, 33.918529], [78.744614, 33.980585], [78.736607, 33.999937], [78.656535, 34.030196], [78.661462, 34.086718], [78.737223, 34.089692], [78.801897, 34.137258], [78.828998, 34.125369], [78.878273, 34.163012], [78.910302, 34.143202], [78.9257, 34.155584], [78.941099, 34.212022], [78.958345, 34.230827], [78.981751, 34.31836], [79.019939, 34.313417], [79.039649, 34.33467], [78.973128, 34.362833], [78.958961, 34.386049], [78.899831, 34.354929], [78.878273, 34.391481], [78.809288, 34.432955], [78.742766, 34.45467], [78.758781, 34.481807], [78.715049, 34.502031], [78.708274, 34.522249], [78.634977, 34.538026], [78.58139, 34.505483], [78.562912, 34.51288], [78.559832, 34.55725], [78.542586, 34.574499], [78.492695, 34.578441], [78.436029, 34.543942], [78.427405, 34.594207], [78.397224, 34.605538], [78.346101, 34.60406], [78.280812, 34.623269], [78.265413, 34.651335], [78.267261, 34.705472], [78.213059, 34.717771], [78.21429, 34.760556], [78.230921, 34.776288], [78.237696, 34.882398], [78.206283, 34.891726], [78.182262, 34.936874], [78.201972, 34.974642], [78.160704, 34.990823], [78.123131, 35.036897], [78.150849, 35.069721], [78.124979, 35.108407], [78.078784, 35.100084], [78.062769, 35.114772], [78.060306, 35.180344], [78.01719, 35.228267], [78.020885, 35.315237], [78.013494, 35.366008], [78.046755, 35.384063], [78.107117, 35.437229], [78.113892, 35.466967], [78.140378, 35.494745], [78.048603, 35.491334], [78.029509, 35.469404], [78.009799, 35.491821], [77.951284, 35.478664], [77.917408, 35.490847], [77.914944, 35.465017], [77.870596, 35.495232], [77.85643, 35.487436], [77.816394, 35.518616], [77.797299, 35.491334], [77.757879, 35.497181], [77.735706, 35.461605], [77.690742, 35.448443], [77.657481, 35.477689], [77.639619, 35.45478], [77.590344, 35.460143], [77.578025, 35.47574], [77.518895, 35.482075], [77.451758, 35.46063], [77.396939, 35.467942], [77.355055, 35.494257], [77.331649, 35.530793], [77.307628, 35.540533], [77.195527, 35.519103], [77.093281, 35.569746], [77.072339, 35.591162], [76.99781, 35.611113], [76.967013, 35.591649], [76.906651, 35.615005], [76.848753, 35.668018], [76.769297, 35.653917], [76.69292, 35.747714], [76.593754, 35.771996], [76.566037, 35.819082], [76.587595, 35.840431], [76.579587, 35.866625], [76.59745, 35.895718], [76.55803, 35.923347], [76.51553, 35.881173], [76.471798, 35.886021], [76.431762, 35.851589], [76.369552, 35.86323], [76.365857, 35.82442], [76.298719, 35.841401], [76.228502, 35.837035], [76.221727, 35.823449], [76.160133, 35.82442], [76.146582, 35.839946], [76.16506, 35.908807], [76.117017, 35.975186], [76.097307, 36.022635], [76.044336, 36.026991], [76.028322, 36.016827], [75.982742, 36.031347], [75.949482, 36.070056], [75.936547, 36.13485], [75.96796, 36.159013], [76.016619, 36.165294], [76.011691, 36.229044], [76.060967, 36.225182], [76.055423, 36.252695], [75.998757, 36.312034], [75.991365, 36.35205], [76.035097, 36.409386], [75.991981, 36.505654], [75.924228, 36.566242], [75.947018, 36.590752], [75.871257, 36.666636], [75.8072, 36.707908], [75.724048, 36.750597], [75.634121, 36.771693], [75.588541, 36.762584], [75.537418, 36.773131], [75.536802, 36.729975], [75.504773, 36.743404], [75.458578, 36.720861], [75.425933, 36.778883], [75.434556, 36.83303], [75.430245, 36.873255], [75.396368, 36.904367], [75.413614, 36.954599], [75.345861, 36.960816], [75.288579, 36.974682], [75.244847, 36.963207], [75.16847, 36.991892], [75.172166, 37.013877], [75.063145, 37.006231], [75.032348, 37.016745], [75.005862, 36.99476], [74.927638, 36.978029], [74.938725, 36.94312], [74.893762, 36.939772], [74.86974, 36.990458], [74.84387, 37.0134], [74.84695, 37.056873], [74.806914, 37.054485], [74.792747, 37.027257], [74.739161, 37.028212], [74.70898, 37.084569], [74.632603, 37.066425], [74.617205, 37.043499], [74.56793, 37.032512], [74.530357, 37.082182], [74.498944, 37.072155], [74.496481, 37.116072], [74.465068, 37.147085], [74.487858, 37.161871], [74.477387, 37.19954], [74.511263, 37.240048], [74.54514, 37.2491], [74.578401, 37.231472], [74.598727, 37.258151], [74.642458, 37.261485], [74.665864, 37.23576], [74.727458, 37.282916], [74.753943, 37.281011], [74.800139, 37.248147], [74.816153, 37.216699], [74.911008, 37.233378], [74.927022, 37.277678], [75.018181, 37.293867], [75.078543, 37.318144], [75.125971, 37.322427], [75.140137, 37.355258], [75.125971, 37.388075], [75.153072, 37.414223], [75.129666, 37.459367], [75.090862, 37.486915], [75.078543, 37.511129], [75.035428, 37.500685], [75.002167, 37.511604], [75.000935, 37.53059], [74.940573, 37.559061], [74.891914, 37.668097], [74.920863, 37.684675], [74.923327, 37.717347], [74.949196, 37.725395], [75.006478, 37.770823], [74.989848, 37.797783], [74.917167, 37.845057], [74.936877, 37.876241], [74.919015, 37.908357], [74.911008, 37.966884], [74.92579, 38.01735], [74.879595, 38.021122], [74.821697, 38.10311], [74.80445, 38.167128], [74.816769, 38.215576], [74.793363, 38.271039], [74.806914, 38.285602], [74.789668, 38.324581], [74.834015, 38.361193], [74.868508, 38.403883], [74.862965, 38.484035], [74.821697, 38.491062], [74.78474, 38.538357], [74.717603, 38.542102], [74.639995, 38.599653], [74.613509, 38.593105], [74.546988, 38.607604], [74.506336, 38.637528], [74.455829, 38.632853], [74.421952, 38.647812], [74.353583, 38.655757], [74.229779, 38.656224], [74.147859, 38.676785], [74.11275, 38.611345], [74.088113, 38.610878], [74.068403, 38.585621], [74.090577, 38.542102], [74.034526, 38.541634], [74.011736, 38.52478], [73.926121, 38.536016], [73.89902, 38.579071], [73.852208, 38.584217], [73.799237, 38.610878], [73.809092, 38.634256], [73.757353, 38.719755], [73.769056, 38.775765], [73.729636, 38.837324], [73.699455, 38.857832], [73.70931, 38.893241], [73.742571, 38.933754], [73.767824, 38.941202], [73.826339, 38.916993], [73.846665, 38.962145], [73.839889, 39.008199], [73.820179, 39.041674], [73.780143, 39.026798], [73.743187, 39.029588], [73.720397, 39.071881], [73.719781, 39.108112], [73.688368, 39.154999], [73.657571, 39.166136], [73.639709, 39.220402], [73.623079, 39.235237], [73.580579, 39.237555], [73.564564, 39.266288], [73.542391, 39.269531], [73.554709, 39.295935], [73.554094, 39.350102], [73.502355, 39.383877], [73.592898, 39.412087], [73.61076, 39.465702], [73.6471, 39.474479], [73.745651, 39.462005], [73.836194, 39.472169], [73.868223, 39.482794], [73.893476, 39.528046], [73.883621, 39.540969], [73.914418, 39.564041], [73.916266, 39.586644], [73.953838, 39.600018], [73.924273, 39.722108], [73.905795, 39.741899], [73.841737, 39.756163], [73.845433, 39.831115], [73.907027, 39.873843], [73.910722, 39.934443], [73.980324, 40.004617], [73.943367, 40.016076], [74.008041, 40.050901], [74.023439, 40.085251], [74.113366, 40.086624], [74.126301, 40.104479], [74.26304, 40.125074], [74.280902, 40.09807], [74.316626, 40.106767], [74.356662, 40.089371], [74.433039, 40.13148], [74.485394, 40.182251], [74.534669, 40.207851], [74.577169, 40.260391], [74.618437, 40.27957], [74.673255, 40.278656], [74.697893, 40.310153], [74.700357, 40.346195], [74.824776, 40.344371], [74.862965, 40.32658], [74.908544, 40.338897], [74.795211, 40.443278], [74.814921, 40.461039], [74.819233, 40.505647], [74.844486, 40.521117], [74.891914, 40.507467], [74.963363, 40.464681], [74.995392, 40.455119], [75.021877, 40.466958], [75.051442, 40.449654], [75.102565, 40.44009], [75.13521, 40.463315], [75.206659, 40.447833], [75.242383, 40.448743], [75.268869, 40.483802], [75.292274, 40.483802], [75.355716, 40.537947], [75.432093, 40.563412], [75.467817, 40.599773], [75.550353, 40.64883], [75.599628, 40.659727], [75.636584, 40.624306], [75.627345, 40.605226], [75.631041, 40.548862], [75.646439, 40.516567], [75.733287, 40.474242], [75.717272, 40.443278], [75.686475, 40.418223], [75.669845, 40.363982], [75.688323, 40.343915], [75.709265, 40.280939], [75.739446, 40.299199], [75.785642, 40.301025], [75.831221, 40.327492], [75.84046, 40.312434], [75.890351, 40.30924], [75.921764, 40.291439], [75.932235, 40.339353], [75.986438, 40.381763], [76.026474, 40.355317], [76.048648, 40.357141], [76.048648, 40.388601], [76.081293, 40.39635], [76.144118, 40.393615], [76.176147, 40.381307], [76.22419, 40.401819], [76.279625, 40.439179], [76.283321, 40.415034], [76.327668, 40.391336], [76.333212, 40.343459], [76.381871, 40.39088], [76.390494, 40.37766], [76.442233, 40.391336], [76.470566, 40.422779], [76.508754, 40.429613], [76.539551, 40.464226], [76.543247, 40.513837], [76.556798, 40.542495], [76.601145, 40.578868], [76.611, 40.601591], [76.657196, 40.620218], [76.654732, 40.652917], [76.676906, 40.696036], [76.646725, 40.73686], [76.646725, 40.759983], [76.693536, 40.779472], [76.731724, 40.818887], [76.741579, 40.912119], [76.761905, 40.954167], [76.817956, 40.975406], [76.85368, 40.97631], [76.885709, 41.027347], [76.940528, 41.028701], [77.002122, 41.073381], [77.023064, 41.059394], [77.091433, 41.062553], [77.108063, 41.038181], [77.169041, 41.009285], [77.236795, 41.027798], [77.296541, 41.004769], [77.363062, 41.04089], [77.415417, 41.038633], [77.473931, 41.022832], [77.476395, 40.999349], [77.540453, 41.006575], [77.591576, 40.992122], [77.597119, 41.005221], [77.654402, 41.016059], [77.684583, 41.00793], [77.737553, 41.032313], [77.780669, 41.022832], [77.796068, 41.049014], [77.829328, 41.059394], [77.807155, 41.091876], [77.814546, 41.13426], [77.836104, 41.153189], [77.905089, 41.185174], [77.972842, 41.173013], [78.094798, 41.224347], [78.129291, 41.228398], [78.136682, 41.279239], [78.165015, 41.340825], [78.149617, 41.368228], [78.163783, 41.383497], [78.235232, 41.399211], [78.324544, 41.384395], [78.338094, 41.397415], [78.385522, 41.394721], [78.391681, 41.408189], [78.454507, 41.412228], [78.527188, 41.440947], [78.580774, 41.481759], [78.650375, 41.467411], [78.675629, 41.50238], [78.707042, 41.522098], [78.696571, 41.54181], [78.739071, 41.555695], [78.825302, 41.560173], [78.86657, 41.593749], [78.891824, 41.597777], [78.957729, 41.65146], [78.99407, 41.664427], [79.021787, 41.657273], [79.043345, 41.681414], [79.10925, 41.697503], [79.138199, 41.722968], [79.21704, 41.725648], [79.271858, 41.767174], [79.276786, 41.78101], [79.326061, 41.809565], [79.356242, 41.795735], [79.415372, 41.836769], [79.457256, 41.847915], [79.500988, 41.835432], [79.550879, 41.834094], [79.616784, 41.856385], [79.640806, 41.884907], [79.724574, 41.896935], [79.776313, 41.89248], [79.822508, 41.963275], [79.854537, 41.984186], [79.852689, 42.015319], [79.923522, 42.042436], [80.089826, 42.047325], [80.14218, 42.03488], [80.193303, 42.081535], [80.16805, 42.096635], [80.139717, 42.151232], [80.163738, 42.152563], [80.168666, 42.200462], [80.233339, 42.210215], [80.28631, 42.233261], [80.29247, 42.259842], [80.272144, 42.281984], [80.283847, 42.320493], [80.229028, 42.358536], [80.239499, 42.389927], [80.206238, 42.431462], [80.225948, 42.485769], [80.265368, 42.502097], [80.221637, 42.533415], [80.180985, 42.590718], [80.163738, 42.629919], [80.179753, 42.670415], [80.228412, 42.692852], [80.225948, 42.713083], [80.259209, 42.790865], [80.262289, 42.828623], [80.280151, 42.838278], [80.338049, 42.831695], [80.407034, 42.834767], [80.450766, 42.861971], [80.503737, 42.882146], [80.602903, 42.894424], [80.5912, 42.923354], [80.487106, 42.948766], [80.397795, 42.996933], [80.378701, 43.031502], [80.416889, 43.05687], [80.482795, 43.06955], [80.556092, 43.104515], [80.593048, 43.133347], [80.650946, 43.147321], [80.706997, 43.143828], [80.73225, 43.131163], [80.752576, 43.148194], [80.79446, 43.137277], [80.804315, 43.178314], [80.789533, 43.201876], [80.788917, 43.242433], [80.769207, 43.265535], [80.777214, 43.308227], [80.69283, 43.32042], [80.686055, 43.333916], [80.735946, 43.389609], [80.746417, 43.439167], [80.761199, 43.446554], [80.75504, 43.494329], [80.522215, 43.816473], [80.511128, 43.906657], [80.475404, 43.938124], [80.485259, 43.95579], [80.457541, 43.981203], [80.458773, 44.047054], [80.449534, 44.078017], [80.3941, 44.127009], [80.407034, 44.149772], [80.400875, 44.198704], [80.413194, 44.264741], [80.399027, 44.30587], [80.383013, 44.401297], [80.350368, 44.484615], [80.411962, 44.605321], [80.400259, 44.628751], [80.313412, 44.704938], [80.238883, 44.7228], [80.200695, 44.756808], [80.178521, 44.796741], [80.18776, 44.825612], [80.169898, 44.84471], [80.115695, 44.815424], [80.087978, 44.817122], [79.999283, 44.793768], [79.991891, 44.830281], [79.953703, 44.849377], [79.969102, 44.877797], [79.887798, 44.90917], [79.944464, 44.937985], [79.951855, 44.957892], [79.98142, 44.964244], [80.056565, 45.011227], [80.060876, 45.026033], [80.111999, 45.052675], [80.136021, 45.041259], [80.144644, 45.059017], [80.195767, 45.030686], [80.24381, 45.031532], [80.291854, 45.06578], [80.328194, 45.070007], [80.358375, 45.040836], [80.404571, 45.049293], [80.443991, 45.077614], [80.445839, 45.097895], [80.493882, 45.127037], [80.519135, 45.108878], [80.599207, 45.105921], [80.686055, 45.129148], [80.731634, 45.156164], [80.816634, 45.152788], [80.862214, 45.127037], [80.897938, 45.127459], [80.93551, 45.160384], [80.966307, 45.168402], [81.024821, 45.162916], [81.080872, 45.182745], [81.111669, 45.218168], [81.170183, 45.211001], [81.175111, 45.227863], [81.236705, 45.247248], [81.284748, 45.23882], [81.327864, 45.260729], [81.382066, 45.257781], [81.398697, 45.275471], [81.437501, 45.28263], [81.462754, 45.264099], [81.52866, 45.285999], [81.536667, 45.304101], [81.575471, 45.30789], [81.582863, 45.336503], [81.645072, 45.359216], [81.677101, 45.35459], [81.78797, 45.3836], [81.832318, 45.319673], [81.879745, 45.284314], [81.921013, 45.233342], [81.993078, 45.237978], [82.052824, 45.255674], [82.09594, 45.249776], [82.091012, 45.222383], [82.109491, 45.211422], [82.206809, 45.236713], [82.294272, 45.247669], [82.344779, 45.219011], [82.487061, 45.181058], [82.562822, 45.204676], [82.58746, 45.224069], [82.60101, 45.346178], [82.546808, 45.426038], [82.448257, 45.461309], [82.281954, 45.53891], [82.266555, 45.620172], [82.288729, 45.655321], [82.289961, 45.71636], [82.340468, 45.772742], [82.349707, 45.822811], [82.336156, 45.882418], [82.342932, 45.935303], [82.401446, 45.972333], [82.461808, 45.97982], [82.518474, 46.153798], [82.609017, 46.294985], [82.726662, 46.494756], [82.774089, 46.600124], [82.788872, 46.677784], [82.829524, 46.772551], [82.878183, 46.797138], [82.876335, 46.823762], [82.923762, 46.932169], [82.937929, 47.014248], [82.993364, 47.065229], [83.031552, 47.168265], [83.02724, 47.21544], [83.108544, 47.221944], [83.15474, 47.236168], [83.17445, 47.218286], [83.207094, 47.213814], [83.221877, 47.186977], [83.257602, 47.173147], [83.306261, 47.179656], [83.324739, 47.167858], [83.370318, 47.178436], [83.418978, 47.119012], [83.463325, 47.132042], [83.53847, 47.083977], [83.566803, 47.080717], [83.576042, 47.059114], [83.700462, 47.032199], [83.69923, 47.015472], [83.766367, 47.026896], [83.88586, 46.982003], [83.932671, 46.970161], [83.951765, 46.98731], [84.002888, 46.990576], [84.038613, 46.973428], [84.086656, 46.965261], [84.150098, 46.977512], [84.195061, 47.003638], [84.2893, 46.994658], [84.336727, 47.00527], [84.37122, 46.993434], [84.425422, 47.008943], [84.506726, 46.97302], [84.563393, 46.991801], [84.668718, 46.995067], [84.699515, 47.008535], [84.748175, 47.009759], [84.781435, 46.979962], [84.849189, 46.957092], [84.867051, 46.927673], [84.934188, 46.863878], [84.95513, 46.861013], [84.979768, 46.883106], [84.987159, 46.918272], [85.082014, 46.939933], [85.102956, 46.968936], [85.175637, 46.997924], [85.213825, 47.041172], [85.276651, 47.068898], [85.325926, 47.044842], [85.355491, 47.054629], [85.441106, 47.063191], [85.545816, 47.057891], [85.547048, 47.096609], [85.582772, 47.142626], [85.641903, 47.18413], [85.682555, 47.222757], [85.682555, 47.249982], [85.701033, 47.28856], [85.675779, 47.321837], [85.701649, 47.384275], [85.685018, 47.428829], [85.614801, 47.498015], [85.617881, 47.550552], [85.547048, 48.008205], [85.531649, 48.046227], [85.551975, 48.081423], [85.55136, 48.127781], [85.576613, 48.15853], [85.587084, 48.191654], [85.622193, 48.202824], [85.633895, 48.232731], [85.678243, 48.266205], [85.695489, 48.302445], [85.695489, 48.335078], [85.758315, 48.403064], [85.791576, 48.418954], [85.916612, 48.438015], [86.053966, 48.441192], [86.225813, 48.432456], [86.270161, 48.452307], [86.305269, 48.491984], [86.38103, 48.49357], [86.416138, 48.481671], [86.579978, 48.538763], [86.594761, 48.576789], [86.635413, 48.612016], [86.640956, 48.629027], [86.693311, 48.64366], [86.70255, 48.666195], [86.771535, 48.717156], [86.780774, 48.731369], [86.754289, 48.78463], [86.770303, 48.810255], [86.818963, 48.831139], [86.821426, 48.850439], [86.782006, 48.887049], [86.757985, 48.894919], [86.730267, 48.959797], [86.732115, 48.994757], [86.772151, 49.02773], [86.836209, 49.051269], [86.84976, 49.066563], [86.854071, 49.109284], [86.887948, 49.132001], [86.953853, 49.131218], [87.000049, 49.142572], [87.088128, 49.133567], [87.112766, 49.15549], [87.211932, 49.140615], [87.239033, 49.114376], [87.304939, 49.112418], [87.388707, 49.097921], [87.43675, 49.075188], [87.511894, 49.10184], [87.49588, 49.132001], [87.517438, 49.145704], [87.563017, 49.142572], [87.602437, 49.152359], [87.67635, 49.15549], [87.700372, 49.175839], [87.762582, 49.172709], [87.793379, 49.18249], [87.821096, 49.173883], [87.82048, 49.148445], [87.845733, 49.146096], [87.867291, 49.108892], [87.844502, 49.090084], [87.858052, 49.07362], [87.835263, 49.054406], [87.883306, 49.023806], [87.883922, 48.993971], [87.911639, 48.979833], [87.871603, 48.963726], [87.87653, 48.949186], [87.814321, 48.945256], [87.793995, 48.927565], [87.760118, 48.925992], [87.742256, 48.881146], [87.78106, 48.872094], [87.792147, 48.849258], [87.829103, 48.825623], [87.803234, 48.824835], [87.826639, 48.800795], [87.872219, 48.799612], [87.93874, 48.757809], [87.96153, 48.773588], [88.029283, 48.750313], [88.064392, 48.712813], [88.090877, 48.71992], [88.089645, 48.69504], [88.02682, 48.65315], [88.010805, 48.618742], [87.96153, 48.599353], [87.973233, 48.575997], [88.041602, 48.548272], [88.10874, 48.545895], [88.130297, 48.521721], [88.151855, 48.526478], [88.196819, 48.493967], [88.229464, 48.498329], [88.318159, 48.478497], [88.363123, 48.460641], [88.360659, 48.433251], [88.438267, 48.393528], [88.462289, 48.392335], [88.503557, 48.412996], [88.523267, 48.403461], [88.535586, 48.368884], [88.573158, 48.369679], [88.573774, 48.351785], [88.605803, 48.337863], [88.575006, 48.277757], [88.594716, 48.259831], [88.601491, 48.221567], [88.638447, 48.183674], [88.668628, 48.171303], [88.700657, 48.180881], [88.721599, 48.160526], [88.79736, 48.133772], [88.824461, 48.107005], [88.939026, 48.115396], [88.953808, 48.090618], [89.027105, 48.051028], [89.044967, 48.009806], [89.078228, 47.98698], [89.156452, 47.996992], [89.231597, 47.98017], [89.282104, 47.994189], [89.308589, 48.021816], [89.359712, 48.026219], [89.38127, 48.046227], [89.498299, 48.02822], [89.569132, 48.037825], [89.599313, 48.015811], [89.595617, 47.973359], [89.645508, 47.947711], [89.651052, 47.913627], [89.735435, 47.89758], [89.761921, 47.835751], [89.86971, 47.834144], [89.957789, 47.842982], [89.960253, 47.885942], [90.040941, 47.874704], [90.066195, 47.883534], [90.086521, 47.86547], [90.070506, 47.820483], [90.07605, 47.777469], [90.13518, 47.723147], [90.180144, 47.72516], [90.216484, 47.70543], [90.331665, 47.681663], [90.384635, 47.644179], [90.346447, 47.637324], [90.376012, 47.603036], [90.398186, 47.547724], [90.468403, 47.497611], [90.474562, 47.462422], [90.459164, 47.43895], [90.468403, 47.404937], [90.507823, 47.400076], [90.526301, 47.379007], [90.488113, 47.317374], [90.521374, 47.2845], [90.56141, 47.206903], [90.579888, 47.198364], [90.653801, 47.111681], [90.691989, 47.080717], [90.767134, 46.992617], [90.830575, 46.995883], [90.901408, 46.960768], [90.92235, 46.938707], [90.929742, 46.893331], [90.958075, 46.879425], [90.942676, 46.82581], [90.992567, 46.790583], [90.992567, 46.769682], [91.019053, 46.766402], [91.054161, 46.717598], [91.036299, 46.670393], [91.017821, 46.58244], [91.068328, 46.579149], [91.079415, 46.558989], [91.060937, 46.516999], [91.038147, 46.500936], [91.025828, 46.444057], [90.996263, 46.419309], [90.983328, 46.374734], [90.900177, 46.31235], [90.955611, 46.233752], [90.94822, 46.219262], [90.98456, 46.160431], [91.021517, 46.121038], [91.014741, 46.06667], [91.028292, 46.023054], [90.890937, 45.921566], [90.799778, 45.834905], [90.714779, 45.728895], [90.676591, 45.582488], [90.671047, 45.487747], [90.723402, 45.464667], [90.772677, 45.432338], [90.773909, 45.405874], [90.813329, 45.32851], [90.804706, 45.29484], [90.831807, 45.300313], [90.877387, 45.280946], [90.897713, 45.249776], [90.866916, 45.209314], [90.881698, 45.192025], [90.96177, 45.201303], [91.007966, 45.218589], [91.050466, 45.208892], [91.129922, 45.21606], [91.17119, 45.199616], [91.195827, 45.159118], [91.230936, 45.153632], [91.242023, 45.13717], [91.33503, 45.129571], [91.37753, 45.11099], [91.429268, 45.156586], [91.448978, 45.156586], [91.500101, 45.103809], [91.561695, 45.075501], [91.694738, 45.065357], [91.803144, 45.082685], [91.885679, 45.078882], [92.056911, 45.086911], [92.100026, 45.081417], [92.240461, 45.015881], [92.315605, 45.028994], [92.348866, 45.014188], [92.414155, 45.018419], [92.501003, 45.001072], [92.547814, 45.018419], [92.683937, 45.02561], [92.779407, 45.050561], [92.847777, 45.038721], [92.884117, 45.046756], [92.922921, 45.03703], [92.932776, 45.017573], [93.002377, 45.009958], [93.062124, 45.018419], [93.100312, 45.007419], [93.174225, 45.015458], [93.252449, 44.991761], [93.314043, 44.980333], [93.314659, 44.995147], [93.376869, 44.985412], [93.434767, 44.955351], [93.509296, 44.968055], [93.613389, 44.926546], [93.716251, 44.894334], [93.723642, 44.865498], [94.066105, 44.732154], [94.152336, 44.684944], [94.215162, 44.667921], [94.227481, 44.645785], [94.279836, 44.603617], [94.329727, 44.582734], [94.359292, 44.515775], [94.390705, 44.521749], [94.470777, 44.509373], [94.557008, 44.462408], [94.606283, 44.448311], [94.673421, 44.397021], [94.722696, 44.34055], [94.768275, 44.34055], [94.826174, 44.320001], [94.945666, 44.292592], [94.998637, 44.253169], [95.1286, 44.269884], [95.238853, 44.277169], [95.41378, 44.298589], [95.43041, 44.281882], [95.4107, 44.245024], [95.376208, 44.227444], [95.355882, 44.166087], [95.35157, 44.090054], [95.326932, 44.028554], [95.377439, 44.025972], [95.426099, 44.009618], [95.527113, 44.007466], [95.623199, 43.855756], [95.645373, 43.787966], [95.705735, 43.67077], [95.735916, 43.597569], [95.857872, 43.417436], [95.880046, 43.28035], [95.921314, 43.229789], [96.363558, 42.900562], [96.386348, 42.727592], [96.742361, 42.75704], [96.968411, 42.756161], [97.172903, 42.795257], [97.28254, 42.782081], [97.831958, 42.706047], [98.195362, 42.653251], [98.546447, 42.638284], [98.962822, 42.607018], [99.51224, 42.568244], [99.969267, 42.647969], [100.004376, 42.648849], [100.272309, 42.636523], [100.32528, 42.690213], [100.826655, 42.675255], [100.862995, 42.671295], [101.291689, 42.586312], [101.557775, 42.529887], [101.770274, 42.509597], [101.803534, 42.503861], [101.877447, 42.432345], [102.070236, 42.232374], [102.093642, 42.223512], [102.449039, 42.144133], [102.540814, 42.162323], [102.621502, 42.154338], [102.712045, 42.153007], [103.021862, 42.028212], [103.20726, 41.96283], [103.418527, 41.882233], [103.454868, 41.877332], [103.868779, 41.802427], [104.080046, 41.805104], [104.30856, 41.840782], [104.418813, 41.860397], [104.530298, 41.875104], [104.524138, 41.661745], [104.68921, 41.6452], [104.803775, 41.652355], [104.923267, 41.654143], [105.009498, 41.583007], [105.230621, 41.751103], [105.291599, 41.749763], [105.385221, 41.797073], [105.589713, 41.888471], [105.74185, 41.949033], [106.01348, 42.032213], [106.344855, 42.149457], [106.372572, 42.161436], [106.612789, 42.241679], [106.785867, 42.291281], [107.051337, 42.319166], [107.271844, 42.364285], [107.303872, 42.412465], [107.46648, 42.458842], [107.501589, 42.456635], [107.57427, 42.412907], [107.736262, 42.415116], [107.939522, 42.403628], [107.986949, 42.413349], [108.022058, 42.433229], [108.089195, 42.436321], [108.238252, 42.460167], [108.298614, 42.438529], [108.532671, 42.442945], [108.705134, 42.413349], [108.798757, 42.415116], [108.845569, 42.395673], [108.983539, 42.449128], [109.026039, 42.458401], [109.291509, 42.435879], [109.486761, 42.458842], [109.544044, 42.472528], [109.683862, 42.558988], [109.733753, 42.579262], [109.906216, 42.635643], [110.108244, 42.642687], [110.139657, 42.674815], [110.34846, 42.742098], [110.437156, 42.781203], [110.469801, 42.839156], [110.631177, 42.936061], [110.689691, 43.02144], [110.687227, 43.036314], [110.736502, 43.089657], [110.769763, 43.099272], [110.82027, 43.149067], [111.02045, 43.329998], [111.069725, 43.357852], [111.151029, 43.38004], [111.183674, 43.396132], [111.354289, 43.436125], [111.400485, 43.472618], [111.456535, 43.494329], [111.564325, 43.490422], [111.606209, 43.513863], [111.79407, 43.672068], [111.891388, 43.6738], [111.951135, 43.693275], [111.970845, 43.748205], [111.959758, 43.823382], [111.870447, 43.940279], [111.773128, 44.010479], [111.702295, 44.034147], [111.662875, 44.061247], [111.559397, 44.171238], [111.541535, 44.206855], [111.534144, 44.26217], [111.507042, 44.294305], [111.428818, 44.319573], [111.415883, 44.35724], [111.427586, 44.394455], [111.478709, 44.488884], [111.514434, 44.507666], [111.530448, 44.55033], [111.569868, 44.57634], [111.560629, 44.647062], [111.585267, 44.705789], [111.624687, 44.778477], [111.69244, 44.859983], [111.764505, 44.969325], [111.903707, 45.052252], [112.002874, 45.090713], [112.071243, 45.096206], [112.113743, 45.072965], [112.396459, 45.064512], [112.438959, 45.071697], [112.540589, 45.001072], [112.599719, 44.930783], [112.712436, 44.879494], [112.850406, 44.840466], [112.937869, 44.840042], [113.037652, 44.822641], [113.11526, 44.799714], [113.503918, 44.777628], [113.540874, 44.759358], [113.631417, 44.745333], [113.712105, 44.788247], [113.798953, 44.849377], [113.861778, 44.863377], [113.907358, 44.915104], [114.065038, 44.931206], [114.116777, 44.957045], [114.158045, 44.994301], [114.19069, 45.036607], [114.313262, 45.107189], [114.347139, 45.119436], [114.409348, 45.179371], [114.459855, 45.21353], [114.519602, 45.283893], [114.539928, 45.325985], [114.551014, 45.387383], [114.600906, 45.403773], [114.745035, 45.438217], [114.920578, 45.386122], [114.983404, 45.379397], [115.178041, 45.396209], [115.36467, 45.392427], [115.586408, 45.440317], [115.699741, 45.45963], [115.864197, 45.572853], [115.936878, 45.632727], [116.026805, 45.661177], [116.035428, 45.685013], [116.1155, 45.679577], [116.17463, 45.688775], [116.217746, 45.72221], [116.22329, 45.747273], [116.260862, 45.776082], [116.286731, 45.775247], [116.278108, 45.831152], [116.288579, 45.839074], [116.243, 45.876169], [116.271949, 45.966926], [116.414231, 46.133896], [116.439484, 46.137628], [116.536187, 46.23251], [116.573143, 46.258998], [116.585462, 46.292504], [116.673541, 46.325163], [116.745606, 46.327642], [116.81336, 46.355737], [116.834302, 46.384229], [116.876801, 46.375559], [117.097308, 46.356976], [117.247597, 46.366888], [117.372017, 46.36028], [117.383719, 46.394962], [117.375712, 46.416421], [117.392343, 46.463023], [117.447777, 46.528117], [117.42006, 46.582029], [117.49582, 46.600535], [117.596218, 46.603414], [117.622704, 46.596012], [117.641182, 46.558166], [117.704008, 46.516587], [117.748355, 46.521941], [117.769913, 46.537586], [117.813645, 46.530588], [117.870927, 46.549935], [117.868464, 46.575447], [117.914659, 46.607936], [117.982412, 46.614925], [117.992883, 46.631366], [118.04647, 46.631366], [118.124078, 46.678195], [118.192448, 46.682711], [118.238643, 46.709392], [118.274984, 46.715957], [118.316252, 46.73934], [118.41049, 46.728265], [118.446831, 46.704467], [118.586033, 46.692975], [118.639004, 46.721291], [118.677192, 46.6979], [118.788061, 46.687227], [118.788061, 46.717598], [118.845343, 46.771731], [118.914329, 46.77501], [118.912481, 46.733188], [118.951285, 46.722111], [119.011647, 46.745902], [119.073857, 46.676552], [119.123132, 46.642872], [119.152081, 46.658072], [119.20074, 46.648213], [119.26295, 46.649034], [119.325776, 46.608759], [119.357805, 46.619447], [119.374435, 46.603414], [119.431718, 46.638763], [119.491464, 46.629311], [119.557985, 46.633832], [119.598637, 46.618214], [119.656535, 46.625612], [119.682405, 46.605058], [119.677477, 46.584908], [119.739687, 46.615336], [119.783419, 46.626023], [119.8136, 46.66834], [119.804361, 46.68189], [119.859179, 46.669572], [119.911534, 46.669572], [119.93494, 46.712674], [119.917078, 46.758203], [119.936172, 46.790173], [119.920157, 46.853238], [119.926933, 46.903963], [119.859795, 46.917046], [119.845013, 46.964852], [119.795122, 47.013024], [119.79081, 47.04525], [119.806825, 47.055037], [119.763093, 47.13082], [119.716282, 47.195518], [119.627586, 47.247544], [119.56784, 47.248357], [119.559217, 47.303172], [119.450812, 47.353065], [119.437877, 47.378602], [119.386138, 47.397645], [119.365812, 47.423161], [119.32208, 47.42721], [119.365812, 47.47739], [119.205052, 47.520249], [119.152081, 47.540453], [119.134219, 47.664335], [118.773278, 47.771034], [118.568171, 47.992187], [118.441903, 47.995791], [118.422193, 48.01461], [118.37415, 48.016612], [118.351976, 48.006203], [118.284839, 48.011007], [118.238027, 48.031422], [118.238643, 48.041826], [118.150564, 48.036224], [118.124694, 48.047427], [118.107448, 48.031021], [118.052014, 48.01421], [117.96147, 48.011007], [117.886942, 48.025418], [117.813645, 48.016212], [117.529081, 47.782697], [117.519226, 47.761782], [117.493357, 47.758563], [117.384335, 47.641356], [117.094844, 47.8241], [116.879265, 47.893968], [116.791186, 47.89758], [116.669846, 47.890758], [116.453035, 47.837358], [116.26579, 47.876711], [116.130283, 47.823296], [116.111189, 47.811642], [115.968291, 47.689721], [115.939342, 47.683275], [115.580249, 47.921649], [115.539597, 48.104607], [115.545141, 48.134971], [115.529126, 48.155336], [115.81061, 48.257042], [115.822929, 48.259432], [115.799523, 48.514982], [115.83032, 48.560156], [116.069305, 48.811437], [116.077928, 48.822471], [116.048363, 48.873274], [116.428397, 49.430659], [116.717889, 49.847288], [116.736367, 49.847674], [117.068974, 49.695389], [117.278394, 49.636512], [117.485349, 49.633024], [117.638102, 49.574847], [117.809333, 49.521263], [117.849369, 49.551557], [117.866, 49.591532], [117.950999, 49.596187], [117.995963, 49.623332], [118.011362, 49.614803], [118.082811, 49.616741], [118.129622, 49.669446], [118.156723, 49.660149], [118.211542, 49.690744], [118.220781, 49.729831], [118.284223, 49.743755], [118.315636, 49.766953], [118.384005, 49.783958], [118.398787, 49.802502], [118.385853, 49.827217], [118.443751, 49.835709], [118.483787, 49.830691], [118.485019, 49.866194], [118.531214, 49.887791], [118.574946, 49.931342], [118.605127, 49.926719], [118.672264, 49.955991], [118.739402, 49.946364], [118.761576, 49.959456], [118.791757, 49.955606], [118.964836, 49.988708], [118.982082, 49.979087], [119.090487, 49.985629], [119.12498, 50.019095], [119.163168, 50.027554], [119.193965, 50.069826], [119.190269, 50.087877], [119.236465, 50.075204], [119.290052, 50.121655], [119.309762, 50.161161], [119.350414, 50.166145], [119.339327, 50.192206], [119.358421, 50.197953], [119.319001, 50.220933], [119.339943, 50.244668], [119.35103, 50.303953], [119.381827, 50.324208], [119.358421, 50.358965], [119.322696, 50.352474], [119.277117, 50.366218], [119.259871, 50.345218], [119.232153, 50.365455], [119.188422, 50.347509], [119.155777, 50.364691], [119.176719, 50.378814], [119.125596, 50.389118], [119.165016, 50.422683], [119.217371, 50.414675], [119.22353, 50.441363], [119.250631, 50.448604], [119.262334, 50.490124], [119.264182, 50.536933], [119.295595, 50.573814], [119.281428, 50.601551], [119.298059, 50.616743], [119.361501, 50.632689], [119.394145, 50.667219], [119.385522, 50.682769], [119.430486, 50.684286], [119.450196, 50.695281], [119.506862, 50.763846], [119.496391, 50.771795], [119.515485, 50.814165], [119.498855, 50.827776], [119.491464, 50.87878], [119.569688, 50.933879], [119.598637, 50.984767], [119.630666, 51.00925], [119.678093, 51.016404], [119.726753, 51.051028], [119.719361, 51.075099], [119.764325, 51.092017], [119.752622, 51.117193], [119.771716, 51.124331], [119.788346, 51.174636], [119.760629, 51.212516], [119.784035, 51.22601], [119.821607, 51.21439], [119.797586, 51.243622], [119.828383, 51.263099], [119.811136, 51.281071], [119.885049, 51.302777], [119.883817, 51.336813], [119.946643, 51.360736], [119.914614, 51.374187], [119.910918, 51.390994], [119.97128, 51.40033], [119.982983, 51.445112], [120.002693, 51.459283], [119.982367, 51.482396], [119.985447, 51.505125], [120.017476, 51.52114], [120.052584, 51.560967], [120.035954, 51.583657], [120.05936, 51.634203], [120.100628, 51.649058], [120.087077, 51.678013], [120.172693, 51.679868], [120.226279, 51.717703], [120.294649, 51.752171], [120.317438, 51.785873], [120.363634, 51.789945], [120.40675, 51.81659], [120.40059, 51.833605], [120.480046, 51.855049], [120.481278, 51.885719], [120.549032, 51.882394], [120.548416, 51.907877], [120.656821, 51.926333], [120.66298, 51.958061], [120.704864, 51.983501], [120.717799, 52.015556], [120.691929, 52.026973], [120.690698, 52.047221], [120.717183, 52.072978], [120.753523, 52.085483], [120.76769, 52.10938], [120.760299, 52.136937], [120.786784, 52.15787], [120.745516, 52.20594], [120.755371, 52.258355], [120.715951, 52.261286], [120.695625, 52.290214], [120.653741, 52.302658], [120.627256, 52.323878], [120.62356, 52.361172], [120.653741, 52.371038], [120.64943, 52.3904], [120.688234, 52.427637], [120.68269, 52.464479], [120.706712, 52.492909], [120.687002, 52.511489], [120.734429, 52.536977], [120.690698, 52.547532], [120.658669, 52.56718], [120.62664, 52.570818], [120.605082, 52.589364], [120.56135, 52.595544], [120.483742, 52.630066], [120.462184, 52.64532], [120.396895, 52.616261], [120.289721, 52.623527], [120.194866, 52.578819], [120.125265, 52.586819], [120.07599, 52.586092], [120.049505, 52.598453], [120.035338, 52.646409], [120.071063, 52.70628], [120.031642, 52.773674], [120.101244, 52.788877], [120.14128, 52.813119], [120.181316, 52.806969], [120.222584, 52.84277], [120.297112, 52.869872], [120.295265, 52.891542], [120.350699, 52.906343], [120.363018, 52.94134], [120.411061, 52.957927], [120.452945, 53.01017], [120.529321, 53.045803], [120.562582, 53.082845], [120.643886, 53.106923], [120.659901, 53.137091], [120.687002, 53.142476], [120.690698, 53.174771], [120.736277, 53.204892], [120.821893, 53.241797], [120.838523, 53.239648], [120.820661, 53.269007], [120.867472, 53.278669], [120.882871, 53.294411], [120.936457, 53.28833], [120.950624, 53.29763], [121.055334, 53.29155], [121.098449, 53.306929], [121.129246, 53.277238], [121.155732, 53.285468], [121.227797, 53.280459], [121.308485, 53.301565], [121.336818, 53.325877], [121.416274, 53.319443], [121.499426, 53.337314], [121.589969, 53.350891], [121.697758, 53.392666], [121.754425, 53.389454], [121.816019, 53.41336], [121.875765, 53.426556], [122.026054, 53.428339], [122.077177, 53.422277], [122.111054, 53.426913], [122.161561, 53.468614], [122.227466, 53.461845], [122.266886, 53.470039], [122.350038, 53.505647], [122.37406, 53.47467], [122.435038, 53.444739], [122.496016, 53.458638], [122.5379, 53.453293], [122.608117, 53.465408], [122.673406, 53.459351], [122.763949, 53.463626], [122.826775, 53.457213], [122.894528, 53.462914], [122.943804, 53.483929], [123.052209, 53.506715], [123.093477, 53.508138], [123.137209, 53.498172], [123.179092, 53.509918], [123.231447, 53.549404], [123.274563, 53.563269], [123.309672, 53.56078], [123.394055, 53.538024], [123.454417, 53.536602], [123.47228, 53.509206], [123.499381, 53.497816], [123.510468, 53.509206], [123.490758, 53.542648], [123.517243, 53.558292], [123.546808, 53.551537], [123.557895, 53.531978], [123.53141, 53.507071], [123.569598, 53.505291], [123.58746, 53.546915], [123.620721, 53.550115], [123.668764, 53.533756], [123.698329, 53.498528], [123.746373, 53.500308], [123.797495, 53.489983], [123.865249, 53.489627], [123.985973, 53.434401], [124.01369, 53.403371], [124.058038, 53.404085], [124.125791, 53.348033], [124.19416, 53.37339], [124.239124, 53.379817], [124.327819, 53.331954], [124.375863, 53.258984], [124.412203, 53.248601], [124.435609, 53.223886], [124.487348, 53.217436], [124.496587, 53.207759], [124.563108, 53.201666], [124.590209, 53.208476], [124.678905, 53.207043], [124.720789, 53.192344], [124.712165, 53.162574], [124.734339, 53.146783], [124.787926, 53.140681], [124.832889, 53.145347], [124.87231, 53.099018], [124.909266, 53.118059], [124.887708, 53.164368], [124.970244, 53.194137], [125.038613, 53.202741], [125.142091, 53.204175], [125.195062, 53.198439], [125.252344, 53.18051], [125.315786, 53.144989], [125.343503, 53.14463], [125.452524, 53.107641], [125.503647, 53.095424], [125.504263, 53.061271], [125.530749, 53.0512], [125.588647, 53.081047], [125.613901, 53.083564], [125.640386, 53.06199], [125.643466, 53.039686], [125.684118, 53.00801], [125.742632, 52.993964], [125.737088, 52.943504], [125.665023, 52.913561], [125.666871, 52.869872], [125.678574, 52.86084], [125.722306, 52.880347], [125.751255, 52.88143], [125.772197, 52.89804], [125.827631, 52.899123], [125.854117, 52.891542], [125.855349, 52.866259], [125.923718, 52.815651], [125.937269, 52.786705], [125.966834, 52.759914], [125.985312, 52.758465], [126.02042, 52.795753], [126.052449, 52.800095], [126.116507, 52.768243], [126.112195, 52.757016], [126.044442, 52.739628], [126.072775, 52.691048], [126.061688, 52.673271], [125.995783, 52.675085], [125.971145, 52.654033], [125.968682, 52.630429], [125.989008, 52.603178], [126.030891, 52.576273], [126.055529, 52.582455], [126.066616, 52.603905], [126.147304, 52.573], [126.213209, 52.525327], [126.192883, 52.492181], [126.205202, 52.466302], [126.268644, 52.475051], [126.326542, 52.424353], [126.353644, 52.389304], [126.348716, 52.357882], [126.320999, 52.342163], [126.327774, 52.310342], [126.4331, 52.298632], [126.436795, 52.277034], [126.401071, 52.279597], [126.357955, 52.264216], [126.312992, 52.235271], [126.306832, 52.205574], [126.34502, 52.192002], [126.403535, 52.185031], [126.457121, 52.165212], [126.499005, 52.16044], [126.556288, 52.136203], [126.563679, 52.119302], [126.514404, 52.037282], [126.487918, 52.041699], [126.450962, 52.027709], [126.447882, 52.009294], [126.468208, 51.982395], [126.462665, 51.948471], [126.510092, 51.922274], [126.555056, 51.874266], [126.580925, 51.824728], [126.622809, 51.777357], [126.658534, 51.762544], [126.6727, 51.73179], [126.724439, 51.7266], [126.734294, 51.711399], [126.723823, 51.679126], [126.741069, 51.642374], [126.67886, 51.602246], [126.69549, 51.57845], [126.837156, 51.536033], [126.843931, 51.521885], [126.812518, 51.493948], [126.784185, 51.448095], [126.791577, 51.432428], [126.835308, 51.413769], [126.908605, 51.407423], [126.930163, 51.359241], [126.904293, 51.340552], [126.837156, 51.345038], [126.813134, 51.311756], [126.820526, 51.281071], [126.863025, 51.248492], [126.908605, 51.246619], [126.92154, 51.259729], [126.908605, 51.283691], [126.877808, 51.300906], [126.887047, 51.321856], [126.970815, 51.332327], [126.98375, 51.318863], [126.976358, 51.291551], [126.926467, 51.246244], [126.899982, 51.200518], [126.917844, 51.138977], [126.922772, 51.061937], [126.985597, 51.029202], [127.052119, 50.962911], [127.113713, 50.93765], [127.143894, 50.910111], [127.236285, 50.781256], [127.295415, 50.755139], [127.305886, 50.733932], [127.28864, 50.699451], [127.294799, 50.663426], [127.370559, 50.581415], [127.36132, 50.547582], [127.323132, 50.52552], [127.293567, 50.46575], [127.30527, 50.45432], [127.3644, 50.438314], [127.369944, 50.403996], [127.332371, 50.340634], [127.371791, 50.29669], [127.44632, 50.270686], [127.603385, 50.239309], [127.60708, 50.178794], [127.58737, 50.137768], [127.501755, 50.056764], [127.495595, 49.994479], [127.543638, 49.944438], [127.547334, 49.928645], [127.529472, 49.864265], [127.531936, 49.826059], [127.583059, 49.786277], [127.653892, 49.780094], [127.674833, 49.764247], [127.677913, 49.697712], [127.705015, 49.665185], [127.782007, 49.630698], [127.815268, 49.593859], [127.897804, 49.579116], [127.949542, 49.596187], [128.001281, 49.592307], [128.070882, 49.556604], [128.122005, 49.55311], [128.185447, 49.53952], [128.243345, 49.563203], [128.287077, 49.566309], [128.343128, 49.544956], [128.389939, 49.58998], [128.500192, 49.593859], [128.537764, 49.604332], [128.619684, 49.593471], [128.656025, 49.577564], [128.715155, 49.564756], [128.744104, 49.595023], [128.802618, 49.58222], [128.813089, 49.558157], [128.763198, 49.515824], [128.76135, 49.482009], [128.792147, 49.473065], [128.871604, 49.492506], [128.932582, 49.46801], [129.013886, 49.457119], [129.061929, 49.374189], [129.084719, 49.359769], [129.143849, 49.357431], [129.180805, 49.386657], [129.215298, 49.399122], [129.266421, 49.396006], [129.320623, 49.3586], [129.358196, 49.355871], [129.379138, 49.367175], [129.374826, 49.414309], [129.390224, 49.432605], [129.448739, 49.441167], [129.51834, 49.423652], [129.546057, 49.395227], [129.562687, 49.299706], [129.604571, 49.279018], [129.696962, 49.298535], [129.730223, 49.288387], [129.761636, 49.25754], [129.753629, 49.208692], [129.784426, 49.184054], [129.847867, 49.181316], [129.864498, 49.158621], [129.855259, 49.133567], [129.866962, 49.113985], [129.913157, 49.1085], [129.934715, 49.078717], [129.9187, 49.060681], [129.937179, 49.040285], [130.020946, 49.021058], [130.059135, 48.979047], [130.113337, 48.956653], [130.219895, 48.893739], [130.237757, 48.868551], [130.279641, 48.866976], [130.412068, 48.905148], [130.471198, 48.905541], [130.501995, 48.865795], [130.559277, 48.861071], [130.609168, 48.881146], [130.680617, 48.881146], [130.689856, 48.849651], [130.622103, 48.783842], [130.576524, 48.688719], [130.538951, 48.635751], [130.538335, 48.612016], [130.605473, 48.594207], [130.615944, 48.575601], [130.620871, 48.49595], [130.647357, 48.484844], [130.711414, 48.511414], [130.767465, 48.507846], [130.776704, 48.480084], [130.745907, 48.449131], [130.747755, 48.404256], [130.785327, 48.357353], [130.81982, 48.341444], [130.845073, 48.296473], [130.817972, 48.265409], [130.787791, 48.256643], [130.769313, 48.231136], [130.765617, 48.18926], [130.673842, 48.12818], [130.666451, 48.105007], [130.699711, 48.044227], [130.737284, 48.034223], [130.770544, 47.998194], [130.870943, 47.943301], [130.891269, 47.927263], [130.961486, 47.828118], [130.966413, 47.733211], [130.983659, 47.713081], [131.029855, 47.694555], [131.115471, 47.689721], [131.183224, 47.702611], [131.236811, 47.733211], [131.273767, 47.738846], [131.359998, 47.730796], [131.456085, 47.747297], [131.543548, 47.736028], [131.559563, 47.724757], [131.568186, 47.682469], [131.59036, 47.660707], [131.641483, 47.663932], [131.690142, 47.707041], [131.741881, 47.706638], [131.825649, 47.677231], [131.900793, 47.685692], [131.976554, 47.673201], [132.000575, 47.712276], [132.086191, 47.703013], [132.157024, 47.70543], [132.19706, 47.714289], [132.242639, 47.70986], [132.272205, 47.718718], [132.288835, 47.742065], [132.325175, 47.762184], [132.371987, 47.765402], [132.469305, 47.726368], [132.558, 47.718316], [132.6005, 47.740858], [132.599268, 47.792347], [132.621442, 47.82852], [132.662094, 47.854227], [132.687348, 47.88514], [132.662094, 47.922451], [132.661478, 47.944905], [132.691043, 47.962941], [132.723072, 47.962941], [132.769268, 47.93849], [132.819159, 47.936887], [132.883216, 48.002599], [132.992238, 48.035424], [133.016259, 48.054228], [133.02673, 48.085421], [133.053216, 48.110202], [133.130208, 48.134971], [133.182563, 48.135769], [133.239845, 48.126583], [133.302055, 48.103009], [133.407997, 48.124585], [133.451728, 48.112999], [133.545967, 48.121389], [133.573068, 48.182078], [133.59709, 48.194846], [133.667307, 48.183275], [133.693177, 48.186866], [133.740604, 48.254651], [133.791111, 48.261026], [133.824372, 48.277359], [133.876111, 48.282536], [133.940784, 48.302047], [133.995603, 48.303639], [134.029479, 48.327519], [134.0689, 48.338659], [134.116327, 48.333089], [134.150819, 48.346217], [134.20379, 48.3824], [134.369478, 48.382797], [134.438463, 48.405448], [134.501905, 48.418954], [134.578281, 48.405448], [134.640491, 48.409818], [134.704549, 48.405448], [134.764295, 48.370076], [134.820961, 48.37604], [134.848679, 48.393925], [134.886867, 48.437618], [134.927519, 48.451513], [134.996504, 48.439603], [135.035924, 48.440795], [135.068569, 48.459451], [135.09567, 48.437618], [135.090743, 48.403461], [135.009439, 48.365703], [134.864077, 48.332293], [134.77107, 48.288908], [134.679295, 48.256245], [134.67252, 48.170505], [134.632484, 48.099412], [134.551796, 48.032622], [134.55426, 47.982173], [134.599839, 47.947711], [134.607846, 47.909214], [134.658969, 47.901191], [134.677448, 47.884738], [134.670056, 47.864667], [134.678679, 47.819278], [134.772918, 47.763391], [134.779694, 47.7159], [134.689766, 47.63813], [134.678064, 47.588507], [134.627556, 47.546512], [134.576434, 47.519036], [134.568426, 47.478199], [134.522847, 47.468086], [134.490202, 47.446235], [134.339297, 47.439759], [134.307268, 47.428829], [134.266616, 47.391974], [134.263536, 47.371307], [134.203174, 47.347389], [134.177305, 47.326299], [134.156979, 47.248357], [134.210566, 47.210155], [134.230276, 47.182097], [134.232739, 47.134892], [134.222268, 47.105164], [134.142812, 47.093349], [134.118175, 47.061968], [134.10216, 47.005678], [134.063972, 46.979962], [134.076291, 46.938298], [134.042414, 46.886787], [134.041182, 46.848326], [134.025168, 46.810657], [134.052885, 46.779928], [134.033175, 46.759023], [134.030711, 46.708981], [134.011001, 46.637941], [133.919842, 46.596012], [133.890893, 46.525235], [133.849625, 46.475389], [133.852089, 46.450242], [133.902596, 46.446119], [133.948791, 46.401153], [133.940784, 46.38134], [133.876726, 46.362345], [133.869335, 46.338386], [133.922922, 46.330948], [133.908139, 46.308216], [133.91861, 46.280924], [133.909987, 46.254447], [133.867487, 46.250722], [133.87919, 46.233752], [133.849625, 46.203939], [133.814517, 46.230854], [133.794807, 46.193583], [133.764626, 46.17328], [133.706111, 46.163333], [133.690713, 46.133896], [133.745531, 46.075389], [133.740604, 46.048812], [133.681474, 45.986473], [133.676546, 45.94321], [133.614952, 45.942794], [133.618032, 45.903662], [133.583539, 45.868669], [133.55459, 45.893249], [133.51209, 45.887001], [133.491764, 45.867002], [133.494228, 45.840325], [133.467743, 45.834905], [133.469591, 45.799451], [133.505315, 45.785681], [133.469591, 45.777751], [133.486837, 45.740173], [133.454192, 45.731819], [133.445569, 45.705077], [133.484989, 45.691702], [133.485605, 45.658667], [133.448649, 45.647372], [133.471438, 45.631053], [133.412924, 45.618079], [133.423395, 45.584163], [133.393214, 45.580393], [133.342707, 45.554836], [133.333468, 45.562379], [133.246005, 45.517528], [133.203505, 45.516689], [133.170244, 45.465506], [133.164701, 45.437377], [133.143759, 45.430658], [133.144991, 45.367205], [133.119121, 45.352908], [133.128976, 45.336924], [133.097563, 45.284735], [133.110498, 45.266627], [133.095715, 45.246827], [133.129592, 45.211422], [133.139447, 45.127459], [133.107418, 45.124504], [133.089556, 45.097473], [133.070462, 45.097051], [133.035969, 45.054366], [132.98731, 45.043373], [132.954049, 45.023072], [132.916477, 45.031109], [132.867202, 45.061976], [132.76434, 45.081417], [132.394161, 45.16376], [132.17427, 45.216903], [132.003655, 45.25441], [131.976554, 45.277156], [131.93159, 45.287683], [131.917423, 45.339448], [131.887858, 45.342393], [131.82996, 45.311677], [131.825649, 45.291472], [131.788692, 45.245984], [131.79362, 45.211844], [131.759127, 45.213952], [131.721555, 45.234606], [131.681519, 45.215217], [131.650722, 45.159962], [131.687678, 45.1511], [131.695685, 45.132104], [131.63286, 45.075078], [131.566338, 45.045487], [131.529382, 45.012073], [131.484418, 44.99557], [131.501664, 44.977793], [131.464708, 44.963397], [131.409889, 44.985836], [131.380324, 44.978216], [131.355071, 44.990068], [131.313803, 44.965938], [131.313803, 44.950692], [131.274999, 44.919766], [131.263296, 44.929935], [131.207861, 44.913833], [131.20355, 44.932901], [131.16105, 44.948151], [131.090217, 44.924427], [131.10192, 44.898997], [131.07913, 44.881614], [130.965181, 44.85065], [130.972573, 44.820094], [131.015688, 44.814999], [131.016304, 44.789521], [131.064348, 44.786973], [131.069275, 44.759783], [131.093297, 44.746183], [131.090833, 44.717272], [131.111775, 44.710042], [131.310723, 44.046623], [131.293477, 44.043182], [131.287318, 44.03802], [131.28239, 44.035868], [131.26576, 44.034578], [131.245434, 43.95579], [131.26268, 43.948897], [131.254057, 43.893289], [131.2171, 43.836334], [131.213405, 43.801357], [131.232499, 43.742585], [131.215869, 43.72745], [131.221412, 43.682024], [131.239274, 43.670337], [131.216485, 43.613169], [131.222028, 43.593234], [131.20047, 43.532089], [131.276847, 43.495632], [131.304564, 43.502144], [131.31873, 43.499539], [131.314419, 43.461325], [131.295941, 43.441774], [131.314419, 43.392653], [131.275615, 43.369165], [131.269455, 43.297775], [131.255289, 43.265099], [131.206014, 43.237202], [131.201086, 43.203185], [131.218948, 43.191405], [131.207861, 43.1316], [131.173985, 43.111506], [131.171521, 43.06955], [131.120398, 43.068238], [131.102536, 43.021002], [131.11855, 43.007875], [131.115471, 42.975482], [131.151195, 42.968475], [131.145652, 42.9365], [131.114855, 42.915027], [131.034167, 42.929051], [131.017536, 42.915027], [131.043406, 42.862848], [130.981812, 42.857145], [130.949783, 42.876884], [130.912826, 42.870744], [130.890653, 42.852758], [130.845073, 42.881269], [130.801957, 42.879515], [130.784095, 42.842227], [130.75453, 42.845738], [130.719422, 42.831695], [130.708335, 42.846615], [130.665835, 42.847932], [130.603625, 42.819405], [130.562357, 42.815015], [130.532792, 42.787352], [130.46627, 42.772417], [130.40714, 42.731548], [130.425003, 42.706926], [130.464423, 42.688453], [130.521089, 42.702089], [130.592538, 42.671295], [130.633806, 42.603494], [130.622719, 42.573092], [130.570364, 42.557224], [130.565437, 42.506509], [130.599929, 42.486211], [130.600545, 42.450453], [130.645509, 42.426603], [130.581451, 42.435437], [130.585763, 42.485328], [130.558661, 42.495919], [130.520473, 42.593362], [130.522937, 42.622433], [130.482285, 42.626837], [130.459495, 42.588075], [130.476125, 42.570007], [130.435474, 42.553257], [130.423771, 42.574855], [130.44656, 42.607459], [130.420691, 42.617148], [130.388046, 42.603054], [130.373264, 42.630799], [130.333228, 42.64973], [130.290112, 42.702968], [130.257467, 42.710884], [130.242069, 42.738582], [130.245148, 42.799209], [130.258083, 42.860655], [130.277793, 42.892232], [130.258083, 42.90626], [130.21004, 42.902315], [130.17062, 42.912397], [130.136127, 42.90363], [130.10225, 42.922916], [130.127504, 42.932556], [130.120729, 42.954461], [130.144134, 42.976357], [130.10841, 42.989929], [130.072685, 42.971541], [130.027106, 42.9676], [130.002468, 42.981174], [129.963664, 42.978547], [129.954425, 43.010938], [129.897143, 43.001748], [129.903918, 42.968475], [129.868193, 42.97373], [129.856491, 42.951833], [129.874969, 42.923792], [129.846636, 42.918533], [129.835549, 42.866796], [129.816454, 42.851003], [129.810911, 42.795257], [129.78381, 42.762752], [129.767179, 42.707806], [129.796744, 42.681854], [129.754245, 42.645768], [129.786889, 42.615387], [129.746237, 42.58455], [129.749933, 42.546644], [129.738846, 42.500332], [129.748701, 42.471204], [129.704354, 42.427045], [129.651999, 42.426603], [129.624281, 42.459284], [129.587941, 42.448686], [129.601492, 42.422627], [129.601492, 42.415116], [129.569463, 42.399208], [129.578086, 42.380202], [129.546057, 42.361632], [129.49863, 42.412023], [129.452434, 42.441179], [129.400695, 42.449128], [129.392688, 42.42837], [129.366203, 42.428811], [129.376058, 42.447803], [129.344029, 42.451777], [129.356348, 42.427045], [129.331094, 42.429695], [129.30892, 42.403628], [129.326167, 42.389927], [129.240551, 42.376223], [129.231312, 42.356325], [129.260261, 42.335536], [129.208522, 42.293052], [129.231312, 42.283755], [129.215914, 42.265157], [129.183269, 42.262056], [129.181421, 42.242122], [129.209138, 42.237692], [129.215914, 42.208442], [129.166639, 42.188047], [129.113668, 42.140583], [129.048378, 42.137476], [129.039139, 42.107736], [129.008958, 42.09175], [128.971386, 42.097079], [128.954755, 42.083756], [128.952908, 42.025545], [128.898089, 42.016653], [128.795227, 42.042436], [128.779213, 42.033546], [128.737945, 42.050435], [128.70222, 42.02021], [128.658489, 42.018876], [128.637547, 42.035324], [128.60675, 42.02999], [128.598127, 42.007315], [128.49896, 42.000644], [128.466316, 42.020654], [128.405338, 42.018876], [128.294468, 42.026434], [128.090593, 42.022877], [128.033926, 42.000199], [128.106607, 41.949923], [128.115846, 41.896935], [128.104143, 41.843457], [128.112766, 41.793504], [128.147875, 41.78101], [128.163889, 41.721628], [128.208853, 41.688565], [128.248889, 41.681414], [128.30186, 41.627756], [128.317874, 41.575844], [128.301244, 41.540018], [128.238418, 41.497898], [128.243345, 41.477276], [128.203925, 41.410882], [128.169433, 41.404149], [128.114614, 41.364186], [128.090593, 41.374516], [128.110919, 41.393375], [128.040085, 41.393375], [128.000049, 41.442741], [127.991426, 41.421204], [127.970484, 41.438704], [127.93168, 41.444984], [127.909506, 41.42973], [127.882405, 41.448124], [127.86947, 41.4037], [127.854688, 41.420755], [127.780159, 41.427038], [127.684073, 41.422999], [127.636645, 41.413575], [127.618783, 41.432871], [127.563964, 41.432871], [127.547334, 41.477276], [127.526392, 41.467859], [127.465414, 41.479069], [127.459255, 41.461581], [127.419835, 41.460235], [127.405668, 41.478621], [127.360088, 41.479518], [127.360704, 41.466065], [127.296031, 41.486243], [127.253531, 41.486691], [127.28864, 41.501932], [127.241212, 41.520754], [127.188241, 41.527475], [127.164836, 41.542706], [127.11864, 41.540018], [127.125416, 41.566442], [127.178386, 41.600015], [127.135887, 41.600463], [127.127263, 41.622388], [127.093387, 41.629993], [127.103242, 41.647883], [127.037952, 41.676944], [127.057662, 41.703758], [127.050887, 41.744852], [127.005923, 41.749317], [126.979438, 41.776993], [126.940018, 41.773423], [126.952953, 41.804212], [126.931395, 41.812687], [126.887047, 41.791719], [126.85625, 41.760031], [126.848243, 41.734134], [126.809439, 41.749317], [126.8002, 41.702865], [126.723207, 41.753335], [126.694874, 41.751103], [126.690562, 41.728328], [126.724439, 41.710907], [126.688099, 41.674262], [126.644983, 41.661297], [126.608027, 41.669345], [126.592628, 41.624624], [126.564295, 41.608965], [126.582773, 41.563307], [126.559983, 41.548081], [126.497158, 41.406842], [126.539041, 41.366881], [126.524259, 41.349362], [126.497158, 41.374965], [126.437411, 41.353405], [126.373354, 41.289133], [126.35426, 41.244599], [126.332086, 41.236949], [126.295129, 41.171661], [126.188572, 41.114875], [126.187956, 41.113072], [126.16763, 41.094583], [126.124514, 41.092327], [126.133753, 41.063906], [126.099877, 41.036376], [126.1085, 41.011995], [126.066, 40.997542], [126.08263, 40.976762], [126.051833, 40.96185], [126.041362, 40.928851], [126.008102, 40.936537], [125.959442, 40.88181], [125.921254, 40.882715], [125.875059, 40.908501], [125.860892, 40.888597], [125.817161, 40.866877], [125.778356, 40.897645], [125.707523, 40.866877], [125.648393, 40.826133], [125.641002, 40.798503], [125.67611, 40.788082], [125.685349, 40.769048], [125.61698, 40.763609], [125.585567, 40.788535], [125.551075, 40.761796], [125.544915, 40.729605], [125.49564, 40.728697], [125.459916, 40.707379], [125.453756, 40.676522], [125.418648, 40.673345], [125.422343, 40.635661], [125.375532, 40.658365], [125.329337, 40.643835], [125.305315, 40.661089], [125.279445, 40.655187], [125.262815, 40.620218], [125.181511, 40.611132], [125.113758, 40.569322], [125.076801, 40.562048], [125.015823, 40.533853], [125.004737, 40.496091], [125.042925, 40.483802], [125.044157, 40.466503], [124.985642, 40.475153], [124.945606, 40.45603], [124.913578, 40.481981], [124.834121, 40.423235], [124.739267, 40.371733], [124.722636, 40.321561], [124.62655, 40.291896], [124.515065, 40.22019]]], [[[114.031778, 22.503923], [114.082285, 22.512216], [114.095219, 22.534329], [114.156813, 22.543726], [114.166052, 22.559201], [114.222719, 22.553122], [114.232574, 22.539857], [114.232574, 22.528801], [114.260291, 22.547595], [114.263371, 22.541515], [114.263987, 22.541515], [114.28924, 22.52272], [114.309566, 22.497288], [114.340979, 22.50337], [114.2529, 22.445304], [114.23319, 22.466875], [114.205473, 22.449729], [114.220255, 22.427603], [114.278769, 22.435901], [114.325581, 22.479041], [114.376088, 22.436454], [114.406269, 22.433688], [114.406269, 22.432582], [114.385327, 22.41156], [114.394566, 22.361757], [114.356994, 22.340171], [114.323733, 22.384447], [114.323733, 22.385001], [114.323117, 22.385554], [114.322501, 22.385554], [114.283081, 22.386661], [114.278153, 22.328546], [114.315726, 22.299756], [114.315726, 22.299203], [114.313262, 22.264315], [114.284929, 22.263761], [114.262139, 22.294773], [114.248588, 22.274837], [114.265835, 22.200608], [114.203009, 22.206703], [114.200545, 22.232188], [114.164821, 22.226648], [114.120473, 22.272068], [114.145726, 22.300864], [114.121089, 22.320795], [114.069966, 22.326885], [114.034857, 22.300864], [114.02993, 22.263207], [114.004676, 22.239389], [114.026234, 22.229418], [113.996669, 22.206149], [113.981271, 22.229972], [113.935691, 22.205041], [113.899351, 22.215568], [113.84946, 22.191188], [113.8433, 22.229418], [113.889496, 22.271514], [113.898119, 22.308615], [113.969568, 22.321349], [113.955401, 22.298649], [114.026234, 22.34792], [113.980039, 22.366185], [113.956633, 22.359543], [113.951706, 22.355116], [113.920293, 22.367845], [113.918445, 22.418199], [113.977575, 22.45692], [114.000981, 22.491206], [114.031778, 22.503923]]], [[[122.63953, 39.286209], [122.640761, 39.288061], [122.655544, 39.277407], [122.662935, 39.273701], [122.673406, 39.269531], [122.67895, 39.268605], [122.57732, 39.269994], [122.50895, 39.290377], [122.539131, 39.308439], [122.593334, 39.278334], [122.63953, 39.286209]]], [[[122.318625, 39.170775], [122.319241, 39.172167], [122.322937, 39.174487], [122.322321, 39.177271], [122.343263, 39.203246], [122.393154, 39.213448], [122.383299, 39.190723], [122.398697, 39.16196], [122.366053, 39.174951], [122.345111, 39.144788], [122.318625, 39.170775]]], [[[122.691884, 39.23292], [122.691268, 39.23431], [122.690037, 39.234774], [122.628443, 39.231993], [122.635834, 39.241727], [122.740544, 39.248679], [122.751631, 39.229675], [122.696812, 39.206492], [122.691884, 39.23292]]], [[[122.738696, 39.034701], [122.739312, 39.036561], [122.75779, 39.009594], [122.733152, 39.014244], [122.704819, 39.044463], [122.738696, 39.034701]]], [[[110.106396, 20.026812], [110.144585, 20.074598], [110.243135, 20.077408], [110.28933, 20.056047], [110.318279, 20.108882], [110.387265, 20.113378], [110.495054, 20.077408], [110.526467, 20.07516], [110.562191, 20.110006], [110.655814, 20.134169], [110.687843, 20.163947], [110.717408, 20.148778], [110.744509, 20.074036], [110.778386, 20.068415], [110.808567, 20.035808], [110.871393, 20.01163], [110.940994, 20.028499], [110.966248, 20.018377], [111.013675, 19.850159], [111.043856, 19.763448], [111.071573, 19.628784], [111.061718, 19.612436], [111.008747, 19.60398], [110.920668, 19.552668], [110.888023, 19.518827], [110.844292, 19.449996], [110.787009, 19.399765], [110.729727, 19.378878], [110.706321, 19.320153], [110.676756, 19.286264], [110.619474, 19.152334], [110.585597, 18.88075], [110.590525, 18.838841], [110.578206, 18.784458], [110.499366, 18.751592], [110.499366, 18.651824], [110.367555, 18.631977], [110.329366, 18.642185], [110.246215, 18.609859], [110.214186, 18.578662], [110.116867, 18.506602], [110.090382, 18.399309], [110.070672, 18.376025], [110.022629, 18.360121], [109.919767, 18.375457], [109.785492, 18.339672], [109.749767, 18.193618], [109.726362, 18.177698], [109.661688, 18.175424], [109.584696, 18.143579], [109.527413, 18.169169], [109.467051, 18.173718], [109.441182, 18.199303], [109.355566, 18.215221], [109.287813, 18.264671], [109.17448, 18.260125], [109.138756, 18.268081], [109.108575, 18.323766], [109.006329, 18.323198], [108.944735, 18.314107], [108.905315, 18.389087], [108.881293, 18.416344], [108.776583, 18.441894], [108.68912, 18.447571], [108.644772, 18.486738], [108.641077, 18.565614], [108.663866, 18.67337], [108.65278, 18.740258], [108.593033, 18.809386], [108.595497, 18.872256], [108.637997, 18.924346], [108.630606, 19.003017], [108.598577, 19.055633], [108.591186, 19.141592], [108.609048, 19.276661], [108.644772, 19.349518], [108.694047, 19.387346], [108.765496, 19.400894], [108.806148, 19.450561], [108.855424, 19.469182], [108.92872, 19.524468], [108.993394, 19.587065], [109.048829, 19.619764], [109.093792, 19.68965], [109.147379, 19.704863], [109.169553, 19.736411], [109.159082, 19.79048], [109.231147, 19.863105], [109.255784, 19.867045], [109.25948, 19.898561], [109.300748, 19.917693], [109.349407, 19.898561], [109.411001, 19.895184], [109.498464, 19.873236], [109.526797, 19.943573], [109.585312, 19.98801], [109.657993, 20.01163], [109.712195, 20.017253], [109.76147, 19.981261], [109.814441, 19.993072], [109.855093, 19.984073], [109.898825, 19.994196], [109.965346, 19.993634], [109.997375, 19.980136], [110.042339, 19.991384], [110.106396, 20.026812]]], [[[120.443706, 22.441432], [120.297112, 22.531565], [120.274323, 22.560307], [120.20041, 22.721039], [120.149287, 22.896468], [120.133272, 23.000625], [120.029795, 23.048544], [120.018708, 23.073322], [120.081534, 23.291728], [120.108019, 23.341191], [120.12157, 23.504836], [120.095084, 23.58768], [120.102476, 23.701162], [120.175156, 23.807427], [120.245989, 23.840276], [120.278018, 23.92783], [120.316206, 23.984708], [120.391967, 24.118055], [120.451713, 24.182493], [120.470807, 24.242533], [120.520698, 24.311816], [120.546568, 24.370159], [120.589068, 24.43229], [120.642654, 24.490033], [120.68885, 24.600542], [120.762147, 24.658208], [120.82374, 24.688118], [120.89211, 24.767482], [120.914899, 24.864715], [120.961095, 24.940167], [121.009754, 24.993878], [121.024537, 25.040517], [121.102145, 25.075214], [121.132942, 25.078466], [121.209318, 25.12724], [121.319572, 25.140785], [121.371926, 25.159746], [121.413194, 25.238806], [121.444607, 25.27074], [121.53515, 25.307535], [121.585041, 25.309159], [121.62323, 25.29455], [121.655259, 25.242054], [121.700222, 25.226896], [121.707613, 25.191701], [121.745186, 25.161912], [121.782142, 25.160287], [121.841888, 25.135367], [121.917033, 25.138076], [121.947214, 25.031841], [121.98109, 25.030757], [122.012503, 25.001471], [121.933047, 24.938539], [121.844968, 24.836476], [121.841272, 24.734329], [121.86283, 24.671261], [121.892395, 24.617953], [121.88562, 24.529784], [121.867758, 24.47914], [121.82649, 24.423572], [121.809243, 24.339083], [121.689135, 24.174303], [121.678048, 24.133895], [121.643556, 24.097843], [121.63986, 24.064514], [121.65957, 24.007125], [121.621382, 23.920718], [121.587505, 23.760878], [121.522832, 23.538858], [121.5216, 23.483431], [121.497578, 23.419744], [121.479716, 23.322507], [121.440296, 23.271937], [121.415042, 23.196047], [121.430441, 23.137175], [121.409499, 23.1025], [121.370695, 23.084334], [121.35468, 23.00999], [121.324499, 22.945526], [121.276456, 22.877171], [121.237652, 22.836362], [121.21055, 22.770711], [121.170514, 22.723247], [121.078739, 22.669691], [121.03316, 22.650914], [121.014682, 22.584069], [120.981421, 22.528248], [120.914899, 22.302525], [120.903197, 22.12634], [120.912436, 22.086418], [120.907508, 22.033171], [120.86624, 21.984345], [120.873016, 21.897191], [120.854537, 21.883309], [120.781857, 21.923843], [120.743052, 21.915515], [120.701784, 21.927174], [120.667908, 21.983235], [120.651277, 22.033171], [120.661748, 22.067007], [120.659285, 22.154056], [120.640806, 22.241605], [120.569973, 22.361757], [120.517619, 22.408793], [120.443706, 22.441432]]], [[[117.024627, 23.437865], [117.029554, 23.443356], [117.058503, 23.47355], [117.093612, 23.459277], [117.129336, 23.483431], [117.142887, 23.459826], [117.142887, 23.400522], [117.124409, 23.389537], [117.081909, 23.409309], [117.050496, 23.400522], [117.027091, 23.41535], [116.951946, 23.419744], [116.944555, 23.440061], [116.982743, 23.460924], [117.024627, 23.437865]]], [[[122.163408, 29.988137], [122.118445, 29.986582], [122.106742, 30.005759], [122.027902, 29.991247], [121.978011, 30.059125], [121.989714, 30.077252], [121.983554, 30.100554], [121.934895, 30.161631], [121.955221, 30.183878], [122.048844, 30.147141], [122.095655, 30.158008], [122.152938, 30.113497], [122.293988, 30.100554], [122.301379, 30.086574], [122.290908, 30.074663], [122.310002, 30.039958], [122.343879, 30.020269], [122.341415, 29.976733], [122.322321, 29.940438], [122.279205, 29.937326], [122.239785, 29.962735], [122.163408, 29.988137]]], [[[118.412338, 24.514538], [118.451758, 24.506915], [118.477012, 24.437738], [118.457918, 24.412128], [118.405563, 24.427931], [118.353208, 24.415398], [118.329802, 24.382152], [118.282375, 24.413218], [118.31194, 24.424661], [118.298389, 24.477506], [118.318715, 24.486765], [118.374766, 24.458986], [118.412338, 24.514538]]], [[[122.213915, 30.186464], [122.168336, 30.138343], [122.143698, 30.163183], [122.152938, 30.19112], [122.178807, 30.199396], [122.213915, 30.186464]]], [[[122.229314, 29.711995], [122.231162, 29.710435], [122.269966, 29.685482], [122.210836, 29.700559], [122.229314, 29.711995]]], [[[122.427646, 30.738422], [122.445509, 30.745109], [122.475074, 30.714243], [122.528045, 30.725047], [122.532972, 30.696748], [122.427031, 30.697777], [122.427646, 30.738422]]], [[[124.542782, 25.903886], [124.566804, 25.941563], [124.584666, 25.908731], [124.542782, 25.903886]]], [[[122.162793, 30.329654], [122.176343, 30.351863], [122.191126, 30.329654], [122.228082, 30.329654], [122.247176, 30.30124], [122.231778, 30.234562], [122.154169, 30.244903], [122.058083, 30.291938], [122.162793, 30.329654]]], [[[112.853486, 21.740515], [112.83316, 21.736624], [112.804826, 21.686583], [112.821457, 21.655994], [112.798667, 21.610933], [112.817145, 21.590345], [112.775261, 21.564189], [112.730914, 21.613715], [112.780189, 21.671568], [112.734609, 21.666562], [112.70566, 21.679354], [112.724138, 21.719945], [112.782653, 21.739959], [112.840551, 21.776644], [112.876275, 21.772753], [112.853486, 21.740515]]], [[[122.317393, 30.249556], [122.333408, 30.272817], [122.40732, 30.272817], [122.417175, 30.238699], [122.365437, 30.255242], [122.358661, 30.236113], [122.277973, 30.242835], [122.317393, 30.249556]]], [[[112.530733, 21.583667], [112.535045, 21.628737], [112.57077, 21.645982], [112.560299, 21.666562], [112.592327, 21.693256], [112.663776, 21.714386], [112.66624, 21.683803], [112.639139, 21.67268], [112.665624, 21.642644], [112.621277, 21.606482], [112.571385, 21.619835], [112.563378, 21.591458], [112.530733, 21.583667]]], [[[122.026054, 29.178333], [122.036525, 29.20759], [122.075945, 29.176243], [122.056851, 29.158476], [122.013119, 29.151681], [122.026054, 29.178333]]], [[[112.208597, 3.876129], [112.219068, 3.908969], [112.260336, 3.917925], [112.280046, 3.86777], [112.241858, 3.845677], [112.208597, 3.876129]]], [[[123.445178, 25.726102], [123.445794, 25.749822], [123.479055, 25.768687], [123.512316, 25.755212], [123.50862, 25.722867], [123.469816, 25.712623], [123.445178, 25.726102]]], [[[122.372212, 29.893234], [122.362973, 29.894272], [122.353734, 29.89946], [122.338951, 29.911911], [122.330944, 29.937845], [122.351886, 29.959105], [122.398081, 29.9394], [122.411632, 29.951846], [122.43319, 29.919173], [122.433806, 29.883376], [122.401777, 29.869884], [122.415944, 29.828877], [122.386379, 29.834069], [122.372212, 29.893234]]], [[[119.646064, 23.550928], [119.609108, 23.503738], [119.578927, 23.502641], [119.562297, 23.530627], [119.566608, 23.584937], [119.601717, 23.575613], [119.61034, 23.604132], [119.678093, 23.600294], [119.691028, 23.547087], [119.646064, 23.550928]]], [[[123.666916, 25.914114], [123.689706, 25.939949], [123.706952, 25.91519], [123.666916, 25.914114]]], [[[119.471138, 25.197116], [119.444036, 25.20199], [119.44342, 25.238806], [119.473601, 25.259916], [119.501319, 25.21715], [119.540739, 25.20199], [119.566608, 25.210112], [119.549362, 25.161912], [119.52534, 25.157579], [119.507478, 25.183036], [119.471138, 25.197116]]], [[[122.43011, 30.408655], [122.352502, 30.422074], [122.318625, 30.407106], [122.281669, 30.418461], [122.277973, 30.471603], [122.37406, 30.461802], [122.432574, 30.445294], [122.43011, 30.408655]]], [[[114.142647, 22.213906], [114.166668, 22.205041], [114.154965, 22.177888], [114.120473, 22.177888], [114.123553, 22.238836], [114.142647, 22.213906]]], [[[123.022644, 39.546507], [123.036194, 39.533123], [122.995542, 39.495264], [122.945035, 39.520198], [122.96105, 39.551122], [123.022644, 39.546507]]], [[[121.837577, 28.770484], [121.861598, 28.814016], [121.86283, 28.782024], [121.837577, 28.770484]]], [[[114.305871, 22.372273], [114.305255, 22.372826], [114.332972, 22.353455], [114.313878, 22.340724], [114.305871, 22.372273]]], [[[119.580159, 25.627398], [119.580775, 25.650059], [119.611572, 25.669479], [119.580159, 25.627398]]], [[[120.729502, 37.947065], [120.76461, 37.923937], [120.76461, 37.895134], [120.721495, 37.917328], [120.729502, 37.947065]]], [[[122.265038, 29.84549], [122.319241, 29.829397], [122.299531, 29.819532], [122.325401, 29.781621], [122.310002, 29.766557], [122.248408, 29.804473], [122.221307, 29.832512], [122.265038, 29.84549]]], [[[119.506246, 23.625518], [119.52534, 23.62497], [119.519181, 23.559705], [119.47237, 23.556962], [119.506246, 23.577259], [119.506246, 23.625518]]], [[[119.976824, 26.191005], [119.970665, 26.217852], [119.998998, 26.235569], [120.016244, 26.217316], [119.976824, 26.191005]]], [[[114.231342, 22.016528], [114.239965, 22.03539], [114.302791, 22.050368], [114.311414, 22.041493], [114.231342, 22.016528]]], [[[121.201311, 27.623328], [121.203775, 27.625979], [121.198848, 27.616964], [121.197616, 27.618025], [121.201311, 27.623328]]], [[[121.790765, 29.082144], [121.82033, 29.099402], [121.84312, 29.082144], [121.832649, 29.050236], [121.790765, 29.082144]]], [[[110.43346, 21.171276], [110.431612, 21.180763], [110.445163, 21.184669], [110.499366, 21.213125], [110.525235, 21.190249], [110.589293, 21.194713], [110.632409, 21.210893], [110.582517, 21.094801], [110.544945, 21.083633], [110.508605, 21.140579], [110.489511, 21.138904], [110.43346, 21.171276]]], [[[112.435263, 21.663781], [112.458669, 21.68992], [112.456205, 21.648763], [112.435263, 21.663781]]], [[[120.692545, 37.983867], [120.724574, 37.987641], [120.732581, 37.961694], [120.692545, 37.983867]]], [[[110.517844, 21.079166], [110.560344, 21.061295], [110.539402, 20.987557], [110.535706, 20.922727], [110.511684, 20.916578], [110.47288, 20.983087], [110.407591, 20.990351], [110.347845, 20.984763], [110.309656, 20.963529], [110.201251, 20.938378], [110.211106, 20.986999], [110.27578, 21.033369], [110.305961, 21.0881], [110.352772, 21.079724], [110.398352, 21.096476], [110.459946, 21.062971], [110.517844, 21.079166]]], [[[122.503407, 39.241263], [122.547755, 39.229211], [122.502175, 39.224112], [122.503407, 39.241263]]], [[[118.230636, 24.401228], [118.233716, 24.445911], [118.273752, 24.441007], [118.230636, 24.401228]]], [[[121.889315, 28.471569], [121.881924, 28.502603], [121.918881, 28.497344], [121.889315, 28.471569]]], [[[122.182503, 29.650642], [122.138155, 29.662083], [122.095655, 29.716673], [122.074097, 29.701599], [122.047612, 29.719791], [122.083952, 29.78318], [122.13138, 29.788893], [122.146778, 29.749412], [122.200365, 29.712515], [122.211452, 29.692241], [122.182503, 29.650642]]], [[[113.554425, 22.107489], [113.554425, 22.142416], [113.534715, 22.174009], [113.53841, 22.209473], [113.558736, 22.212244], [113.575983, 22.194513], [113.6037, 22.132438], [113.554425, 22.107489]]], [[[119.906607, 26.68989], [119.950954, 26.692563], [119.926933, 26.664756], [119.906607, 26.68989]]], [[[121.795693, 31.330186], [121.785222, 31.31127], [121.76428, 31.31536], [121.727939, 31.35472], [121.572107, 31.435944], [121.509897, 31.4824], [121.520984, 31.494137], [121.567179, 31.48342], [121.585657, 31.454836], [121.742106, 31.407345], [121.792613, 31.363408], [121.795693, 31.330186]]], [[[122.461523, 29.944068], [122.459059, 29.938882], [122.467067, 29.928509], [122.462755, 29.927991], [122.457827, 29.927472], [122.45598, 29.926435], [122.452284, 29.935252], [122.4529, 29.936807], [122.449204, 29.9394], [122.450436, 29.940956], [122.451052, 29.940956], [122.451668, 29.943031], [122.460291, 29.947179], [122.459675, 29.944586], [122.461523, 29.944068]]], [[[118.204151, 24.504737], [118.19368, 24.463344], [118.143173, 24.420847], [118.084042, 24.435559], [118.068644, 24.463344], [118.093281, 24.540672], [118.14502, 24.560814], [118.191832, 24.536861], [118.204151, 24.504737]]], [[[122.570544, 30.644244], [122.546523, 30.651967], [122.559457, 30.679764], [122.570544, 30.644244]]], [[[120.786784, 40.473787], [120.774465, 40.48016], [120.805262, 40.525666], [120.8299, 40.516112], [120.83298, 40.491995], [120.786784, 40.473787]]], [[[119.642985, 26.129231], [119.606028, 26.15287], [119.62697, 26.173282], [119.665159, 26.155556], [119.642985, 26.129231]]], [[[119.929397, 26.134067], [119.919542, 26.172208], [119.960194, 26.146961], [119.929397, 26.134067]]], [[[121.869605, 28.423685], [121.889931, 28.45105], [121.910873, 28.44], [121.869605, 28.423685]]], [[[119.497623, 23.38679], [119.516717, 23.349982], [119.495159, 23.349982], [119.497623, 23.38679]]], [[[123.086702, 39.426881], [123.054057, 39.457847], [123.090397, 39.450915], [123.086702, 39.426881]]], [[[113.765076, 21.962145], [113.74167, 21.991559], [113.774315, 21.998218], [113.765076, 21.962145]]], [[[121.850511, 29.977251], [121.844968, 29.982953], [121.84004, 30.047211], [121.848663, 30.101072], [121.88562, 30.094859], [121.924424, 30.052391], [121.933047, 29.994875], [121.874533, 29.964809], [121.850511, 29.977251]]], [[[113.266165, 8.125929], [113.293882, 8.176284], [113.353628, 8.237887], [113.354244, 8.304217], [113.386273, 8.289412], [113.386273, 8.238479], [113.349933, 8.172137], [113.288955, 8.119412], [113.343157, 8.193463], [113.311129, 8.177469], [113.266165, 8.125929]]], [[[122.065474, 30.179739], [122.025438, 30.161631], [122.017431, 30.186464], [122.055619, 30.200431], [122.065474, 30.179739]]], [[[122.391306, 29.970512], [122.3679, 29.980361], [122.378371, 30.023896], [122.411632, 30.025969], [122.391306, 29.970512]]], [[[119.557369, 23.666634], [119.586318, 23.675952], [119.615268, 23.661153], [119.608492, 23.620035], [119.557369, 23.666634]]], [[[113.723192, 21.922177], [113.71888, 21.951599], [113.742902, 21.950489], [113.723192, 21.922177]]], [[[121.066421, 27.478475], [121.067036, 27.478475], [121.107073, 27.443958], [121.066421, 27.461483], [121.066421, 27.478475]]], [[[121.952141, 29.187738], [121.976779, 29.191918], [121.979243, 29.160043], [121.952141, 29.187738]]], [[[113.142977, 21.831653], [113.136818, 21.868869], [113.167615, 21.876644], [113.203955, 21.861093], [113.162071, 21.853873], [113.142977, 21.831653]]], [[[120.034106, 26.488667], [120.035954, 26.515981], [120.071679, 26.521336], [120.066751, 26.498308], [120.034106, 26.488667]]], [[[122.038373, 29.759284], [122.02975, 29.716673], [122.011271, 29.746294], [122.038373, 29.759284]]], [[[119.662079, 25.646822], [119.716898, 25.664624], [119.718745, 25.634952], [119.673782, 25.632794], [119.662079, 25.646822]]], [[[121.957685, 30.287804], [121.921344, 30.30744], [121.94167, 30.33327], [121.989098, 30.339985], [122.0008, 30.308473], [121.957685, 30.287804]]], [[[121.940438, 30.114533], [121.962612, 30.106249], [121.945982, 30.064304], [121.910257, 30.089163], [121.940438, 30.114533]]], [[[111.99733, 3.848065], [112.03367, 3.892251], [112.073707, 3.865979], [112.064467, 3.830152], [112.015192, 3.823583], [111.99733, 3.848065]]], [[[121.801852, 31.356765], [121.792613, 31.377715], [121.845584, 31.37465], [121.951525, 31.337343], [122.040837, 31.324051], [122.116597, 31.320984], [122.122756, 31.307179], [122.097503, 31.255522], [122.016199, 31.282121], [121.932431, 31.283144], [121.840656, 31.295418], [121.8037, 31.328652], [121.801852, 31.356765]]], [[[111.463311, 17.077491], [111.452224, 17.092936], [111.542151, 17.11982], [111.559397, 17.087788], [111.4861, 17.058039], [111.536607, 17.104949], [111.463311, 17.077491]]], [[[113.819894, 22.396068], [113.786634, 22.413773], [113.813735, 22.419858], [113.819894, 22.396068]]], [[[122.192974, 29.965327], [122.18435, 29.955476], [122.155401, 29.970512], [122.154169, 29.97103], [122.152322, 29.97103], [122.163408, 29.988137], [122.192974, 29.965327]]], [[[114.190074, 21.986564], [114.180835, 22.00987], [114.229494, 21.995443], [114.190074, 21.986564]]], [[[117.708319, 15.182712], [117.715095, 15.222561], [117.748355, 15.230068], [117.782848, 15.187333], [117.838899, 15.15903], [117.784696, 15.16885], [117.74466, 15.217941], [117.720638, 15.195418], [117.72495, 15.131302], [117.827812, 15.111659], [117.726798, 15.105303], [117.712631, 15.118592], [117.708319, 15.182712]]], [[[122.066706, 25.6247], [122.092575, 25.639268], [122.087032, 25.61067], [122.066706, 25.6247]]], [[[120.150519, 26.798916], [120.161606, 26.803189], [120.163454, 26.798381], [120.140048, 26.795176], [120.150519, 26.798916]]], [[[120.990044, 36.413239], [120.950624, 36.414684], [120.978341, 36.428649], [120.990044, 36.413239]]], [[[114.153734, 21.97491], [114.124169, 21.985455], [114.171596, 22.000437], [114.153734, 21.97491]]], [[[119.760629, 26.613402], [119.796354, 26.630523], [119.818527, 26.616613], [119.776644, 26.600025], [119.760629, 26.613402]]], [[[122.760254, 30.141966], [122.762101, 30.142484], [122.763333, 30.141966], [122.770725, 30.138861], [122.778116, 30.13679], [122.781196, 30.13265], [122.784275, 30.130062], [122.760254, 30.141966]]], [[[121.468013, 22.67687], [121.514824, 22.676318], [121.513592, 22.631582], [121.474788, 22.643734], [121.468013, 22.67687]]], [[[122.287828, 29.723949], [122.251488, 29.731225], [122.2133, 29.771752], [122.241633, 29.784738], [122.258263, 29.753569], [122.301379, 29.748373], [122.287828, 29.723949]]], [[[121.510513, 22.086972], [121.575802, 22.0842], [121.575186, 22.037055], [121.604752, 22.022631], [121.594281, 21.995443], [121.533918, 22.022076], [121.507433, 22.048704], [121.510513, 22.086972]]], [[[123.160614, 39.025404], [123.143984, 39.038885], [123.145832, 39.091857], [123.20065, 39.077921], [123.205578, 39.057011], [123.160614, 39.025404]]], [[[112.241858, 3.942404], [112.254177, 3.97942], [112.288053, 3.97345], [112.292365, 3.946583], [112.241858, 3.942404]]], [[[116.769628, 20.771721], [116.820135, 20.780674], [116.88604, 20.775638], [116.925461, 20.726949], [116.934084, 20.676565], [116.905135, 20.619443], [116.862635, 20.588633], [116.796113, 20.582471], [116.749302, 20.600958], [116.849084, 20.628405], [116.889736, 20.683284], [116.87249, 20.738143], [116.761005, 20.750456], [116.769628, 20.771721]]], [[[121.134174, 27.787051], [121.13479, 27.787051], [121.134174, 27.785992], [121.134174, 27.787051]]], [[[111.734324, 16.19732], [111.790374, 16.220307], [111.789758, 16.250186], [111.716462, 16.249036], [111.782367, 16.273741], [111.813164, 16.261676], [111.81686, 16.224329], [111.779903, 16.19732], [111.734324, 16.19732]]], [[[113.025333, 21.847762], [113.007471, 21.869424], [113.045659, 21.882753], [113.025333, 21.847762]]], [[[122.097503, 25.499987], [122.122141, 25.495666], [122.110438, 25.465952], [122.097503, 25.499987]]], [[[122.454132, 29.956513], [122.455364, 29.955994], [122.458443, 29.951846], [122.459059, 29.950809], [122.447972, 29.947698], [122.446741, 29.951327], [122.445509, 29.952365], [122.447972, 29.955994], [122.454132, 29.956513]]], [[[111.649324, 16.255931], [111.681353, 16.262251], [111.598817, 16.198469], [111.606825, 16.177779], [111.690592, 16.211112], [111.611136, 16.156511], [111.56802, 16.162834], [111.577875, 16.208239], [111.649324, 16.255931]]], [[[113.896887, 7.607204], [113.921524, 7.639235], [114.029314, 7.670078], [114.095219, 7.721082], [114.211632, 7.786904], [114.268298, 7.870501], [114.414892, 7.952895], [114.47279, 7.968898], [114.511594, 7.966527], [114.540543, 7.945783], [114.555326, 7.891249], [114.540543, 7.862201], [114.464167, 7.814771], [114.419819, 7.765557], [114.407501, 7.683126], [114.368696, 7.638642], [114.289856, 7.617288], [114.157429, 7.561525], [114.058879, 7.537794], [113.98743, 7.536014], [113.919677, 7.566865], [113.896887, 7.607204]]], [[[122.282901, 29.860542], [122.301379, 29.883895], [122.343263, 29.882857], [122.343263, 29.860542], [122.30877, 29.849642], [122.282901, 29.860542]]], [[[122.264423, 30.269716], [122.300147, 30.271266], [122.315545, 30.250073], [122.253952, 30.237147], [122.264423, 30.269716]]], [[[113.976959, 8.872888], [113.989894, 8.878801], [114.041017, 8.843913], [114.060111, 8.816119], [114.035473, 8.783591], [114.013299, 8.836817], [113.976959, 8.872888]]], [[[120.135736, 26.550784], [120.117874, 26.568984], [120.153598, 26.604841], [120.167149, 26.571661], [120.135736, 26.550784]]], [[[122.781196, 30.694175], [122.757174, 30.713728], [122.778732, 30.729677], [122.799674, 30.716301], [122.781196, 30.694175]]], [[[113.956017, 8.840365], [113.977575, 8.841548], [114.012068, 8.798376], [113.975111, 8.793054], [113.956017, 8.840365]]], [[[121.098449, 27.937311], [121.038087, 27.948942], [121.0695, 27.984357], [121.120623, 27.986471], [121.152652, 27.961629], [121.098449, 27.937311]]], [[[109.088249, 21.014934], [109.088865, 21.031134], [109.09256, 21.057386], [109.138756, 21.067439], [109.144299, 21.041189], [109.117814, 21.017727], [109.11227, 21.02499], [109.088249, 21.014934]]], [[[110.405127, 20.678245], [110.414366, 20.710157], [110.437772, 20.677685], [110.405127, 20.678245]]], [[[111.97454, 16.323715], [112.002874, 16.350707], [112.047221, 16.360469], [112.074938, 16.349558], [112.07617, 16.323715], [112.002258, 16.306484], [111.97454, 16.323715]]], [[[111.739251, 16.452898], [111.765737, 16.495366], [111.759577, 16.545857], [111.786679, 16.520039], [111.766969, 16.470116], [111.739251, 16.452898]]], [[[120.750444, 38.150188], [120.742436, 38.199116], [120.7874, 38.158658], [120.750444, 38.150188]]], [[[112.216604, 8.866383], [112.180264, 8.862244], [112.206133, 8.88767], [112.216604, 8.866383]]], [[[113.792177, 7.373422], [113.829134, 7.383511], [113.828518, 7.362145], [113.792177, 7.373422]]], [[[120.159142, 35.765198], [120.172077, 35.785591], [120.193019, 35.756942], [120.169613, 35.740428], [120.159142, 35.765198]]], [[[120.918595, 38.345236], [120.895189, 38.36307], [120.914899, 38.373393], [120.918595, 38.345236]]], [[[114.194386, 8.764664], [114.222103, 8.784773], [114.248588, 8.724442], [114.201161, 8.727991], [114.194386, 8.764664]]], [[[112.232619, 16.996239], [112.266496, 16.993949], [112.292981, 16.96762], [112.222764, 16.960751], [112.207981, 16.987081], [112.232619, 16.996239]]], [[[121.185913, 27.963215], [121.17113, 27.978543], [121.197616, 28.000739], [121.237652, 27.988056], [121.185913, 27.963215]]], [[[123.716807, 39.74512], [123.719887, 39.763063], [123.756843, 39.754322], [123.716807, 39.74512]]], [[[119.421247, 23.216949], [119.453275, 23.216399], [119.436029, 23.186146], [119.421247, 23.216949]]], [[[114.689601, 10.345648], [114.717318, 10.380381], [114.747499, 10.37214], [114.725941, 10.319154], [114.702536, 10.312677], [114.689601, 10.345648]]], [[[115.837712, 9.709775], [115.870972, 9.778785], [115.901153, 9.795888], [115.925791, 9.781734], [115.901153, 9.67084], [115.867277, 9.650191], [115.861117, 9.694438], [115.837712, 9.709775]]], [[[114.617536, 9.965688], [114.685905, 9.979245], [114.672355, 9.927963], [114.642173, 9.917351], [114.617536, 9.965688]]], [[[113.769387, 7.636862], [113.831597, 7.644573], [113.814967, 7.603051], [113.773699, 7.601865], [113.769387, 7.636862]]], [[[109.463972, 7.344339], [109.536037, 7.448792], [109.653065, 7.559745], [109.72205, 7.575763], [109.816289, 7.572797], [109.904984, 7.55144], [109.948716, 7.522962], [109.938861, 7.504569], [109.791651, 7.524742], [109.709115, 7.511095], [109.654297, 7.479648], [109.571761, 7.373422], [109.513247, 7.320002], [109.463972, 7.315254], [109.463972, 7.344339]]], [[[120.62664, 37.94565], [120.602002, 37.978678], [120.631567, 37.981037], [120.62664, 37.94565]]], [[[120.360554, 26.916909], [120.319286, 26.944654], [120.327909, 26.963858], [120.363018, 26.967592], [120.394431, 26.933984], [120.360554, 26.916909]]], [[[122.836014, 30.698806], [122.807681, 30.714243], [122.831087, 30.728648], [122.836014, 30.698806]]], [[[116.273181, 8.879392], [116.305826, 8.917233], [116.332311, 8.901269], [116.294123, 8.858105], [116.273181, 8.879392]]], [[[112.476531, 16.001247], [112.448814, 16.005274], [112.462364, 16.043813], [112.588016, 16.070844], [112.612037, 16.039212], [112.570154, 16.011027], [112.476531, 16.001247]]], [[[110.644727, 20.935584], [110.646575, 20.917137], [110.611467, 20.860106], [110.562807, 20.861224], [110.548641, 20.908752], [110.584365, 20.948998], [110.644727, 20.935584]]], [[[112.537509, 8.846278], [112.598487, 8.859288], [112.639755, 8.818484], [112.57077, 8.815527], [112.537509, 8.846278]]], [[[120.802183, 38.284193], [120.816349, 38.318008], [120.848378, 38.305799], [120.802183, 38.284193]]], [[[114.469095, 10.836261], [114.55471, 10.900911], [114.587355, 10.909138], [114.593514, 10.856245], [114.565181, 10.836261], [114.513442, 10.848605], [114.475254, 10.814512], [114.469095, 10.836261]]], [[[121.489571, 37.577086], [121.488955, 37.578035], [121.489571, 37.578509], [121.489571, 37.577561], [121.489571, 37.577086]]], [[[119.668238, 26.628383], [119.651608, 26.657269], [119.673782, 26.680799], [119.712586, 26.6685], [119.748926, 26.681334], [119.758781, 26.659408], [119.720593, 26.635873], [119.668238, 26.628383]]], [[[122.200365, 29.969475], [122.239785, 29.960142], [122.273662, 29.93214], [122.233626, 29.946661], [122.200365, 29.969475]]], [[[112.409393, 16.294996], [112.509176, 16.317397], [112.536893, 16.312228], [112.531349, 16.285805], [112.475915, 16.288677], [112.411241, 16.2634], [112.383524, 16.265698], [112.409393, 16.294996]]], [[[121.487723, 37.578509], [121.488339, 37.578509], [121.488955, 37.578509], [121.488955, 37.578035], [121.487723, 37.577561], [121.487723, 37.578509]]], [[[121.485875, 37.578509], [121.487723, 37.578509], [121.487723, 37.578035], [121.485875, 37.578509]]], [[[122.471378, 29.927472], [122.47261, 29.927472], [122.473226, 29.925397], [122.470762, 29.925916], [122.471378, 29.927472]]], [[[121.626925, 31.445135], [121.579498, 31.479848], [121.631853, 31.456878], [121.626925, 31.445135]]], [[[114.320037, 22.381127], [114.320037, 22.38168], [114.319421, 22.382234], [114.322501, 22.385554], [114.323117, 22.385554], [114.323733, 22.385001], [114.323733, 22.384447], [114.320037, 22.381127]]], [[[110.556648, 20.32734], [110.586213, 20.381205], [110.593604, 20.360447], [110.556648, 20.32734]]], [[[116.48876, 10.395686], [116.526332, 10.426883], [116.542346, 10.41982], [116.514629, 10.34918], [116.637817, 10.365076], [116.644592, 10.335051], [116.566368, 10.304434], [116.511549, 10.297957], [116.467202, 10.309144], [116.461658, 10.34918], [116.48876, 10.395686]]], [[[111.500267, 16.45175], [111.538455, 16.461507], [111.545847, 16.43453], [111.49534, 16.4374], [111.500267, 16.45175]]], [[[121.943518, 31.215608], [121.950909, 31.228915], [122.008808, 31.221238], [121.995873, 31.160828], [121.959533, 31.159291], [121.943518, 31.215608]]], [[[112.349031, 16.912088], [112.30222, 16.963041], [112.334249, 16.962469], [112.360734, 16.925257], [112.349031, 16.912088]]], [[[122.029134, 29.954957], [122.058699, 29.955994], [122.043916, 29.930584], [122.029134, 29.954957]]], [[[115.500177, 9.897897], [115.518039, 9.933857], [115.581481, 9.917351], [115.585177, 9.896128], [115.54822, 9.869007], [115.500177, 9.897897]]], [[[121.044247, 27.979072], [121.073812, 28.007608], [121.089826, 27.998625], [121.044247, 27.979072]]], [[[118.869365, 39.142932], [118.857662, 39.098824], [118.82009, 39.108576], [118.869365, 39.142932]]], [[[114.669891, 8.210048], [114.726557, 8.21064], [114.74134, 8.189316], [114.691449, 8.18517], [114.669891, 8.210048]]], [[[114.507899, 8.120004], [114.595978, 8.15792], [114.624311, 8.149626], [114.595978, 8.120596], [114.530073, 8.103415], [114.507899, 8.120004]]], [[[113.895039, 8.00505], [113.940003, 8.018088], [113.969568, 7.974825], [113.9708, 7.944597], [113.904894, 7.963564], [113.895039, 8.00505]]], [[[115.16757, 8.386523], [115.202678, 8.395403], [115.299381, 8.370537], [115.315395, 8.356326], [115.285214, 8.314876], [115.235939, 8.321982], [115.18112, 8.345668], [115.16757, 8.386523]]], [[[115.436119, 9.393447], [115.456445, 9.417064], [115.469996, 9.3592], [115.450286, 9.345028], [115.436119, 9.393447]]], [[[120.355011, 22.327439], [120.383344, 22.355669], [120.395663, 22.342385], [120.355011, 22.327439]]], [[[116.457347, 9.174326], [116.500462, 9.164282], [116.477057, 9.137103], [116.457347, 9.174326]]], [[[113.638192, 8.976942], [113.644968, 8.989355], [113.719496, 9.020092], [113.730583, 9.004133], [113.654823, 8.962163], [113.638192, 8.976942]]], [[[114.696992, 11.004322], [114.710543, 11.039567], [114.766593, 11.110045], [114.799854, 11.10476], [114.793079, 11.07657], [114.710543, 11.001972], [114.696992, 11.004322]]], [[[122.152322, 29.97103], [122.154169, 29.97103], [122.155401, 29.970512], [122.152322, 29.97103]]], [[[114.62, 11.432264], [114.621232, 11.518479], [114.661884, 11.522584], [114.652644, 11.436957], [114.62, 11.432264]]], [[[114.910723, 10.863298], [114.934129, 10.902674], [114.959998, 10.902087], [114.931049, 10.841551], [114.910723, 10.863298]]], [[[111.572948, 16.470116], [111.592658, 16.490775], [111.614216, 16.44027], [111.578491, 16.447158], [111.572948, 16.470116]]], [[[113.939387, 8.875253], [113.916597, 8.837999], [113.893807, 8.862836], [113.912285, 8.888853], [113.939387, 8.875253]]], [[[109.936397, 7.848566], [109.953027, 7.888878], [110.0331, 7.944597], [110.078063, 7.949339], [110.082991, 7.896584], [110.050346, 7.846194], [109.988136, 7.8124], [109.936397, 7.823665], [109.936397, 7.848566]]], [[[116.727128, 11.501473], [116.738215, 11.514961], [116.772092, 11.445755], [116.765316, 11.430504], [116.727128, 11.501473]]], [[[111.690592, 16.587731], [111.717078, 16.59404], [111.724469, 16.560198], [111.690592, 16.587731]]], [[[121.88254, 31.240684], [121.923808, 31.234032], [121.909026, 31.195133], [121.88254, 31.240684]]], [[[112.507328, 16.466098], [112.499321, 16.493645], [112.575081, 16.537251], [112.586784, 16.525777], [112.507328, 16.466098]]], [[[111.761425, 16.061642], [111.829795, 16.070844], [111.828563, 16.049565], [111.791606, 16.028859], [111.761425, 16.061642]]], [[[113.845764, 10.018733], [113.856851, 10.12185], [113.872249, 10.123029], [113.865474, 10.00341], [113.845764, 10.018733]]], [[[114.791847, 8.160882], [114.818332, 8.141332], [114.812173, 8.110524], [114.777064, 8.114079], [114.791847, 8.160882]]], [[[116.557129, 9.745167], [116.593469, 9.723932], [116.566368, 9.718623], [116.557129, 9.745167]]], [[[115.28275, 10.191951], [115.28891, 10.211388], [115.333257, 10.200198], [115.288294, 10.172513], [115.28275, 10.191951]]], [[[116.832454, 10.476908], [116.868794, 10.495739], [116.855243, 10.468669], [116.832454, 10.476908]]], [[[114.703151, 16.170307], [114.704383, 16.199044], [114.802934, 16.215135], [114.816484, 16.198469], [114.703151, 16.170307]]], [[[115.97753, 9.321997], [115.999088, 9.293649], [115.976298, 9.268252], [115.943037, 9.269433], [115.926407, 9.311366], [115.97753, 9.321997]]], [[[113.660366, 9.231039], [113.697323, 9.225722], [113.676997, 9.202683], [113.660366, 9.231039]]], [[[114.665579, 7.590001], [114.703767, 7.614915], [114.72163, 7.59178], [114.671739, 7.563898], [114.665579, 7.590001]]], [[[117.770529, 10.773361], [117.775457, 10.809222], [117.801942, 10.839788], [117.831507, 10.838612], [117.835819, 10.803931], [117.798862, 10.753371], [117.770529, 10.773361]]], [[[114.493116, 10.717504], [114.539312, 10.793349], [114.562717, 10.778064], [114.513442, 10.722208], [114.493116, 10.717504]]], [[[114.688985, 11.469217], [114.720398, 11.49209], [114.737644, 11.463938], [114.722246, 11.429331], [114.688985, 11.469217]]], [[[114.242429, 10.242014], [114.265219, 10.275581], [114.312646, 10.300901], [114.326197, 10.284414], [114.263371, 10.239658], [114.242429, 10.242014]]], [[[116.638433, 10.503977], [116.699411, 10.517511], [116.70865, 10.492797], [116.653215, 10.491031], [116.638433, 10.503977]]], [[[110.459946, 8.116449], [110.461793, 8.128298], [110.568351, 8.17273], [110.599764, 8.156735], [110.554184, 8.093935], [110.471032, 8.072012], [110.459946, 8.116449]]], [[[111.463311, 8.52504], [111.509506, 8.550489], [111.497187, 8.523857], [111.463311, 8.52504]]], [[[115.258113, 8.509652], [115.296301, 8.510836], [115.271048, 8.477098], [115.258113, 8.509652]]], [[[113.221817, 8.073789], [113.269861, 8.120004], [113.283411, 8.111117], [113.235984, 8.068456], [113.221817, 8.073789]]], [[[114.305871, 22.369506], [114.305255, 22.372826], [114.305871, 22.372273], [114.305871, 22.369506]]], [[[114.074893, 10.929118], [114.096451, 10.947921], [114.110002, 10.918541], [114.064422, 10.904437], [114.074893, 10.929118]]], [[[117.258068, 10.320331], [117.274698, 10.358011], [117.299952, 10.343293], [117.299336, 10.313855], [117.258068, 10.320331]]], [[[115.943037, 21.097592], [115.965211, 21.123832], [116.024341, 21.12439], [116.044051, 21.110434], [116.067457, 21.04063], [116.040356, 21.02052], [115.989233, 21.035603], [115.953508, 21.064088], [115.943037, 21.097592]]], [[[114.212864, 16.040937], [114.268914, 16.059342], [114.306487, 16.057616], [114.31203, 16.034611], [114.212864, 16.040937]]], [[[110.609003, 8.010976], [110.622553, 8.041199], [110.641648, 8.031125], [110.642879, 7.989049], [110.609003, 8.010976]]], [[[115.509416, 8.490712], [115.514344, 8.519122], [115.558691, 8.523265], [115.569162, 8.49012], [115.55438, 8.461115], [115.521735, 8.460523], [115.509416, 8.490712]]], [[[111.539071, 7.54432], [111.566788, 7.606017], [111.612368, 7.592374], [111.583419, 7.543134], [111.542767, 7.524742], [111.539071, 7.54432]]], [[[111.657947, 8.672974], [111.697368, 8.67889], [111.717694, 8.6499], [111.665955, 8.622683], [111.657947, 8.672974]]], [[[110.460561, 7.799948], [110.485199, 7.827815], [110.511684, 7.805878], [110.487663, 7.783346], [110.460561, 7.799948]]], [[[112.345952, 8.926101], [112.384756, 8.946793], [112.392763, 8.919598], [112.345952, 8.926101]]], [[[111.925265, 8.070827], [111.95483, 8.106377], [112.013344, 8.093342], [112.018888, 8.065494], [111.994866, 8.047125], [111.949287, 8.05068], [111.925265, 8.070827]]], [[[116.469665, 9.810041], [116.490607, 9.821246], [116.50847, 9.79117], [116.47952, 9.785272], [116.469665, 9.810041]]], [[[115.926407, 20.981411], [115.954124, 20.99985], [116.000936, 20.948439], [115.999088, 20.922727], [115.970139, 20.919373], [115.939342, 20.945644], [115.926407, 20.981411]]], [[[114.985252, 11.078332], [115.021592, 11.085967], [115.013585, 11.063062], [114.985252, 11.078332]]], [[[114.457392, 15.599305], [114.491884, 15.59354], [114.466631, 15.576823], [114.457392, 15.599305]]], [[[116.045283, 10.095338], [116.070537, 10.12892], [116.09579, 10.09357], [116.067457, 10.065876], [116.045283, 10.095338]]], [[[114.10569, 16.004124], [114.132176, 16.007575], [114.110618, 15.978235], [114.10569, 16.004124]]], [[[117.266691, 10.69163], [117.293176, 10.735144], [117.369553, 10.7422], [117.418212, 10.702803], [117.404661, 10.671047], [117.348611, 10.672811], [117.266691, 10.69163]]], [[[114.854057, 7.244611], [114.869455, 7.198895], [114.819564, 7.192957], [114.854057, 7.244611]]], [[[112.207981, 8.835634], [112.241242, 8.852783], [112.235699, 8.827355], [112.207981, 8.835634]]], [[[111.670266, 7.651098], [111.691208, 7.711593], [111.726317, 7.729977], [111.749722, 7.703884], [111.707223, 7.648725], [111.670266, 7.651098]]], [[[112.823305, 8.910729], [112.873196, 8.908364], [112.859645, 8.889444], [112.823305, 8.910729]]], [[[112.527654, 5.79444], [112.562146, 5.820637], [112.562762, 5.75931], [112.531965, 5.766455], [112.527654, 5.79444]]], [[[114.599058, 8.846278], [114.61692, 8.881166], [114.665579, 8.900087], [114.68221, 8.881166], [114.645869, 8.844504], [114.599058, 8.846278]]], [[[114.868223, 7.983715], [114.883006, 8.011569], [114.914419, 8.00742], [114.907643, 7.951117], [114.868223, 7.983715]]], [[[112.945261, 8.410204], [112.949572, 8.432701], [112.985297, 8.429149], [112.945261, 8.410204]]], [[[113.600004, 6.961929], [113.62341, 6.942325], [113.580294, 6.920344], [113.600004, 6.961929]]], [[[117.347995, 10.090624], [117.373864, 10.106532], [117.385567, 10.063519], [117.354154, 10.06293], [117.347995, 10.090624]]], [[[116.695099, 16.345538], [116.717889, 16.373676], [116.747454, 16.360469], [116.738831, 16.303612], [116.708034, 16.299591], [116.695099, 16.345538]]], [[[115.834632, 22.722695], [115.835248, 22.722695], [115.834632, 22.722143], [115.834632, 22.722695]]], [[[114.315726, 22.299203], [114.315726, 22.299756], [114.316342, 22.30031], [114.316958, 22.298649], [114.315726, 22.299203]]], [[[112.993304, 19.472003], [112.980369, 19.496263], [112.993304, 19.52616], [113.029028, 19.52898], [113.048123, 19.506417], [113.038883, 19.480466], [112.993304, 19.472003]]], [[[114.448153, 16.034035], [114.465399, 16.067393], [114.521449, 16.056466], [114.485109, 16.034611], [114.448153, 16.034035]]], [[[113.832213, 19.158552], [113.799568, 19.19925], [113.80696, 19.222986], [113.875945, 19.237113], [113.920293, 19.223551], [113.914749, 19.172119], [113.874097, 19.151203], [113.832213, 19.158552]]], [[[112.650842, 5.106941], [112.678559, 5.121247], [112.719211, 5.075944], [112.682871, 5.048522], [112.655769, 5.055676], [112.650842, 5.106941]]], [[[111.638853, 7.907254], [111.651788, 7.932743], [111.713382, 7.927408], [111.712766, 7.887099], [111.665339, 7.887099], [111.638853, 7.907254]]], [[[112.244322, 8.874662], [112.288669, 8.885896], [112.281278, 8.855148], [112.244322, 8.874662]]], [[[112.89229, 7.844416], [112.93171, 7.867537], [112.929862, 7.827815], [112.89229, 7.844416]]], [[[112.583088, 5.56159], [112.616349, 5.568737], [112.642834, 5.489512], [112.614501, 5.465683], [112.606494, 5.51751], [112.583088, 5.56159]]], [[[112.523342, 5.656289], [112.528886, 5.687257], [112.56153, 5.677133], [112.565842, 5.63068], [112.5449, 5.616386], [112.523342, 5.656289]]], [[[113.596924, 10.240836], [113.638192, 10.243192], [113.617866, 10.22199], [113.596924, 10.240836]]], [[[115.361591, 13.948985], [115.377605, 13.968732], [115.423185, 13.977443], [115.438583, 13.943757], [115.397315, 13.92517], [115.361591, 13.948985]]], [[[113.860546, 15.477068], [113.890112, 15.490909], [113.893807, 15.463802], [113.860546, 15.477068]]], [[[114.319421, 22.382234], [114.320037, 22.38168], [114.320037, 22.381127], [114.319421, 22.382234]]], [[[115.834632, 22.723247], [115.835248, 22.722695], [115.834632, 22.722695], [115.834632, 22.723247]]], [[[112.907072, 4.993079], [112.910768, 5.038388], [112.952652, 5.047926], [112.943413, 4.991887], [112.907072, 4.993079]]], [[[112.557219, 5.109326], [112.601567, 5.120055], [112.610806, 5.091443], [112.568922, 5.071771], [112.557219, 5.109326]]], [[[112.350263, 5.621747], [112.385372, 5.643187], [112.385988, 5.615791], [112.350263, 5.621747]]], [[[112.226459, 16.759147], [112.211061, 16.795819], [112.262184, 16.778057], [112.254177, 16.751698], [112.226459, 16.759147]]], [[[112.233851, 15.69612], [112.20367, 15.71398], [112.240626, 15.741055], [112.25972, 15.734718], [112.233851, 15.69612]]], [[[114.372392, 22.32301], [114.372392, 22.323564], [114.373008, 22.323564], [114.372392, 22.32301]]], [[[112.472219, 5.73966], [112.498089, 5.775387], [112.496857, 5.736683], [112.472219, 5.73966]]], [[[112.612037, 5.367973], [112.62374, 5.401935], [112.690878, 5.406702], [112.685334, 5.371548], [112.640371, 5.347715], [112.612037, 5.367973]]], [[[113.217506, 6.306249], [113.243991, 6.325878], [113.230441, 6.285429], [113.217506, 6.306249]]], [[[116.152457, 9.579384], [116.187565, 9.595317], [116.189413, 9.565221], [116.152457, 9.579384]]], [[[114.948911, 7.508722], [115.013585, 7.525928], [115.012353, 7.484988], [114.960614, 7.484988], [114.948911, 7.508722]]], [[[111.553854, 7.807656], [111.603745, 7.861608], [111.619759, 7.840265], [111.585267, 7.771487], [111.553854, 7.807656]]], [[[113.938771, 15.8355], [113.9708, 15.83953], [113.973263, 15.805558], [113.938771, 15.8355]]], [[[114.926122, 16.036911], [114.910723, 16.001823], [114.895325, 16.036336], [114.926122, 16.036911]]], [[[114.323733, 22.297541], [114.323733, 22.298095], [114.324349, 22.297541], [114.323733, 22.297541]]], [[[116.749302, 9.056736], [116.740679, 9.028367], [116.70865, 9.024229], [116.699411, 9.049053], [116.749302, 9.056736]]], [[[112.64653, 16.385733], [112.660081, 16.426494], [112.681639, 16.400661], [112.64653, 16.385733]]], [[[115.758256, 10.461018], [115.801987, 10.463372], [115.776118, 10.434534], [115.758256, 10.461018]]], [[[111.203384, 19.92557], [111.204, 19.926132], [111.204, 19.92557], [111.203384, 19.925007], [111.203384, 19.92557]]], [[[117.21372, 10.735144], [117.206945, 10.707507], [117.187235, 10.741612], [117.21372, 10.735144]]], [[[115.782277, 10.541046], [115.805067, 10.524571], [115.795212, 10.499858], [115.782277, 10.541046]]], [[[112.671784, 16.331755], [112.677943, 16.35932], [112.701349, 16.331755], [112.671784, 16.331755]]], [[[113.586453, 22.201162], [113.575983, 22.194513], [113.575983, 22.201162], [113.586453, 22.201162]]], [[[112.512255, 9.544566], [112.567074, 9.554008], [112.568922, 9.516826], [112.50856, 9.525679], [112.512255, 9.544566]]], [[[114.610145, 15.649447], [114.610761, 15.615444], [114.581195, 15.625242], [114.610145, 15.649447]]], [[[117.299336, 11.077745], [117.304263, 11.027232], [117.284553, 11.02547], [117.264227, 11.063062], [117.299336, 11.077745]]], [[[117.691073, 11.048965], [117.690457, 11.016658], [117.655965, 11.024882], [117.653501, 11.046029], [117.691073, 11.048965]]], [[[114.166668, 9.38459], [114.194386, 9.391676], [114.195617, 9.350933], [114.175291, 9.342075], [114.166668, 9.38459]]], [[[114.714854, 9.736909], [114.704999, 9.700337], [114.680978, 9.707416], [114.693296, 9.741038], [114.714854, 9.736909]]], [[[112.554139, 5.97839], [112.575697, 5.971247], [112.553523, 5.942676], [112.554139, 5.97839]]], [[[122.51865306, 23.46078502], [122.51742454, 23.45790762], [122.51536697, 23.45555069], [122.51268178, 23.45394494], [122.50963181, 23.45324755], [122.5065156, 23.45352678], [122.5036382, 23.45475531], [122.50128127, 23.45681287], [122.49967552, 23.45949807], [122.49897813, 23.46254804], [122.49925737, 23.46566424], [122.77921829, 24.57855302], [122.78044682, 24.58143041], [122.78250438, 24.58378734], [122.78518957, 24.5853931], [122.78823955, 24.58609049], [122.79135575, 24.58581125], [122.79423315, 24.58458272], [122.79659008, 24.58252516], [122.79819583, 24.57983997], [122.79889322, 24.57678999], [122.79861399, 24.57367379], [122.51865306, 23.46078502]]], [[[121.17202617, 20.8054593], [121.16966862, 20.80340244], [121.16679085, 20.80217478], [121.16367457, 20.80189649], [121.1606248, 20.8025948], [121.1579401, 20.80420136], [121.15588324, 20.80655891], [121.15465558, 20.80943668], [121.15437729, 20.81255297], [121.1550756, 20.81560273], [121.15668216, 20.81828744], [121.89404403, 21.70026162], [121.89640158, 21.70231847], [121.89927934, 21.70354613], [121.90239563, 21.70382443], [121.9054454, 21.70312611], [121.9081301, 21.70151955], [121.91018696, 21.699162], [121.91141462, 21.69628423], [121.91169291, 21.69316794], [121.9109946, 21.69011818], [121.90938804, 21.68743347], [121.17202617, 20.8054593]]], [[[119.47366172, 18.00707291], [119.47175735, 18.00459056], [119.46917909, 18.0028182], [119.46617933, 18.0019293], [119.4630517, 18.00201089], [119.46010237, 18.00305497], [119.45762002, 18.00495935], [119.45584765, 18.00753761], [119.45495876, 18.01053737], [119.45504035, 18.01366499], [119.45608443, 18.01661433], [120.00812005, 19.0335793], [120.01002443, 19.03606165], [120.01260269, 19.03783401], [120.01560245, 19.03872291], [120.01873007, 19.03864132], [120.02167941, 19.03759723], [120.02416175, 19.03569286], [120.02593412, 19.0331146], [120.02682302, 19.03011484], [120.02674143, 19.02698721], [120.02569734, 19.02403788], [119.47366172, 18.00707291]]], [[[119.0726757, 15.04098494], [119.0726746, 15.04083704], [119.07218171, 15.00751424], [119.07164663, 15.00443165], [119.07018516, 15.00166528], [119.06794036, 14.99948592], [119.06513198, 14.99810691], [119.06203491, 14.99766324], [119.05895232, 14.99819832], [119.05618595, 14.99965979], [119.05400659, 15.00190458], [119.05262758, 15.00471297], [119.0521839, 15.00781004], [119.0526757, 15.04105889], [119.0526757, 16.04388528], [119.05316513, 16.04697545], [119.05458553, 16.04976313], [119.05679784, 16.05197545], [119.05958553, 16.05339584], [119.0626757, 16.05388528], [119.06576587, 16.05339584], [119.06855355, 16.05197545], [119.07076587, 16.04976313], [119.07218626, 16.04697545], [119.0726757, 16.04388528], [119.0726757, 15.04098494]]], [[[118.68646749, 11.18959191], [118.85557939, 11.6136711], [118.9698053, 11.99151854], [118.97116801, 11.99433487], [118.97333431, 11.99659227], [118.97609216, 11.99806975], [118.9791716, 11.99862269], [118.98227119, 11.99819697], [118.98508753, 11.99683427], [118.98734492, 11.99466796], [118.9888224, 11.99191011], [118.98937534, 11.98883067], [118.98894963, 11.98573108], [118.87459939, 11.60747236], [118.87431591, 11.606662], [118.70476212, 11.18147468], [118.70409227, 11.18010771], [118.54242469, 10.9053354], [118.54043581, 10.90292022], [118.53779795, 10.90123786], [118.53476931, 10.90045298], [118.53164636, 10.90064241], [118.5287348, 10.90178762], [118.52631962, 10.9037765], [118.52463726, 10.90641436], [118.52385237, 10.909443], [118.52404181, 10.91256595], [118.52518702, 10.91547751], [118.68646749, 11.18959191]]], [[[115.54466883, 7.14672265], [115.54229721, 7.14468204], [115.53941108, 7.14347417], [115.53629295, 7.14321728], [115.53324806, 7.14393652], [115.53057445, 7.14556148], [115.52853383, 7.1479331], [115.52732596, 7.15081924], [115.52706908, 7.15393736], [115.52778832, 7.15698226], [115.52941328, 7.15965587], [116.23523025, 7.99221221], [116.23760187, 7.99425282], [116.240488, 7.99546069], [116.24360613, 7.99571758], [116.24665102, 7.99499834], [116.24932463, 7.99337338], [116.25136525, 7.99100176], [116.25257312, 7.98811563], [116.25283001, 7.9849975], [116.25211077, 7.98195261], [116.2504858, 7.979279], [115.54466883, 7.14672265]]], [[[112.30705249, 3.53487257], [112.51501594, 3.59753306], [112.84361424, 3.7506962], [112.84662187, 3.75155809], [112.84974864, 3.7514484], [112.85268847, 3.75037785], [112.8551536, 3.74845124], [112.85690272, 3.74585715], [112.85776462, 3.74284952], [112.85765492, 3.73972276], [112.85658437, 3.73678292], [112.85465776, 3.7343178], [112.85206367, 3.73256867], [112.52281386, 3.57910186], [112.52147408, 3.5785908], [112.31248917, 3.51562254], [112.31181658, 3.51544515], [111.79132585, 3.39736822], [111.78820398, 3.39716187], [111.78517113, 3.39793033], [111.78252419, 3.39959839], [111.78052226, 3.40200275], [111.77936129, 3.40490807], [111.77915495, 3.40802995], [111.77992341, 3.41106279], [111.78159146, 3.41370973], [111.78399583, 3.41571167], [111.78690114, 3.41687263], [112.30705249, 3.53487257]]], [[[108.26055972, 6.08912451], [108.26004031, 6.09098419], [108.23638164, 6.22427602], [108.23630689, 6.22476797], [108.19687578, 6.53630242], [108.19679674, 6.53760583], [108.1987683, 6.95072469], [108.19897125, 6.95268198], [108.22460147, 7.07791743], [108.22570055, 7.08084671], [108.22765103, 7.083293], [108.230262, 7.08501682], [108.23327786, 7.08584944], [108.23640341, 7.08570936], [108.2393327, 7.08461028], [108.24177899, 7.0826598], [108.24350281, 7.08004883], [108.24433543, 7.07703297], [108.24419535, 7.07390742], [108.21876335, 6.94964057], [108.21679964, 6.53816468], [108.25611734, 6.22752625], [108.279563, 6.09543449], [108.30878645, 6.01987736], [108.30944469, 6.0168187], [108.30912553, 6.01370633], [108.30786022, 6.01084492], [108.30577262, 6.00851455], [108.30306706, 6.00694335], [108.3000084, 6.00628511], [108.29689603, 6.00660426], [108.29403462, 6.00786957], [108.29170425, 6.00995718], [108.29013305, 6.01266273], [108.26055972, 6.08912451]]], [[[110.12822847, 11.36894451], [110.18898148, 11.48996382], [110.23982347, 11.61066468], [110.28485499, 11.78705054], [110.3083549, 11.94803461], [110.3142445, 12.14195265], [110.312278, 12.23998238], [110.31270536, 12.24308175], [110.31406956, 12.24589736], [110.31623706, 12.2481536], [110.3189957, 12.24962962], [110.32207543, 12.25018094], [110.32517479, 12.24975358], [110.3279904, 12.24838938], [110.33024665, 12.24622187], [110.33172267, 12.24346324], [110.33227398, 12.24038351], [110.33424553, 12.14210167], [110.33424294, 12.14159753], [110.32832827, 11.94685414], [110.32822801, 11.94571326], [110.30456934, 11.78364161], [110.30436343, 11.7826124], [110.25901765, 11.60499559], [110.25854422, 11.60358735], [110.20728377, 11.48189306], [110.20700505, 11.48128846], [110.14588682, 11.35954163], [110.14541497, 11.35870461], [110.07246741, 11.24270688], [110.07040803, 11.24035153], [110.0677216, 11.23874785], [110.06467109, 11.23805281], [110.0615551, 11.23833444], [110.05867865, 11.23956519], [110.05632331, 11.24162456], [110.05471962, 11.24431099], [110.05402458, 11.2473615], [110.05430621, 11.25047749], [110.05553696, 11.25335394], [110.12822847, 11.36894451]]], [[[109.82951587, 15.22896754], [109.77065019, 15.44468789], [109.67264555, 15.66561455], [109.57455994, 15.82609887], [109.51574449, 15.91095759], [109.29314007, 16.19491896], [109.29161878, 16.19765288], [109.29101677, 16.20072311], [109.29139298, 16.2038291], [109.29271057, 16.20666681], [109.29484059, 16.20895848], [109.29757451, 16.21047978], [109.30064474, 16.21108179], [109.30375073, 16.21070558], [109.30658844, 16.20938798], [109.30888011, 16.20725797], [109.53166592, 15.92306523], [109.53201478, 15.92259221], [109.59116145, 15.8372556], [109.59147511, 15.83677407], [109.6900529, 15.67548445], [109.69066131, 15.67432448], [109.7892391, 15.45210582], [109.78974541, 15.45068337], [109.84889209, 15.23393326], [109.84903675, 15.23333003], [109.8648092, 15.15722425], [109.86495704, 15.15409906], [109.86413191, 15.15108113], [109.86241457, 15.1484659], [109.85997314, 15.14650935], [109.85704658, 15.145403], [109.85392139, 15.14525516], [109.85090347, 15.14608029], [109.84828823, 15.14779763], [109.84633168, 15.15023907], [109.84522534, 15.15316562], [109.82951587, 15.22896754]]]] } }, { type: "Feature", properties: { name: "\u5357\u6D77\u8BF8\u5C9B\u5341\u6BB5\u7EBF", adcode: "100000_JD" }, geometry: { type: "MultiPolygon", coordinates: [[[[122.51865306, 23.46078502], [122.51742454, 23.45790762], [122.51536697, 23.45555069], [122.51268178, 23.45394494], [122.50963181, 23.45324755], [122.5065156, 23.45352678], [122.5036382, 23.45475531], [122.50128127, 23.45681287], [122.49967552, 23.45949807], [122.49897813, 23.46254804], [122.49925737, 23.46566424], [122.77921829, 24.57855302], [122.78044682, 24.58143041], [122.78250438, 24.58378734], [122.78518957, 24.5853931], [122.78823955, 24.58609049], [122.79135575, 24.58581125], [122.79423315, 24.58458272], [122.79659008, 24.58252516], [122.79819583, 24.57983997], [122.79889322, 24.57678999], [122.79861399, 24.57367379], [122.51865306, 23.46078502]]], [[[121.17202617, 20.8054593], [121.16966862, 20.80340244], [121.16679085, 20.80217478], [121.16367457, 20.80189649], [121.1606248, 20.8025948], [121.1579401, 20.80420136], [121.15588324, 20.80655891], [121.15465558, 20.80943668], [121.15437729, 20.81255297], [121.1550756, 20.81560273], [121.15668216, 20.81828744], [121.89404403, 21.70026162], [121.89640158, 21.70231847], [121.89927934, 21.70354613], [121.90239563, 21.70382443], [121.9054454, 21.70312611], [121.9081301, 21.70151955], [121.91018696, 21.699162], [121.91141462, 21.69628423], [121.91169291, 21.69316794], [121.9109946, 21.69011818], [121.90938804, 21.68743347], [121.17202617, 20.8054593]]], [[[119.47366172, 18.00707291], [119.47175735, 18.00459056], [119.46917909, 18.0028182], [119.46617933, 18.0019293], [119.4630517, 18.00201089], [119.46010237, 18.00305497], [119.45762002, 18.00495935], [119.45584765, 18.00753761], [119.45495876, 18.01053737], [119.45504035, 18.01366499], [119.45608443, 18.01661433], [120.00812005, 19.0335793], [120.01002443, 19.03606165], [120.01260269, 19.03783401], [120.01560245, 19.03872291], [120.01873007, 19.03864132], [120.02167941, 19.03759723], [120.02416175, 19.03569286], [120.02593412, 19.0331146], [120.02682302, 19.03011484], [120.02674143, 19.02698721], [120.02569734, 19.02403788], [119.47366172, 18.00707291]]], [[[119.0726757, 15.04098494], [119.0726746, 15.04083704], [119.07218171, 15.00751424], [119.07164663, 15.00443165], [119.07018516, 15.00166528], [119.06794036, 14.99948592], [119.06513198, 14.99810691], [119.06203491, 14.99766324], [119.05895232, 14.99819832], [119.05618595, 14.99965979], [119.05400659, 15.00190458], [119.05262758, 15.00471297], [119.0521839, 15.00781004], [119.0526757, 15.04105889], [119.0526757, 16.04388528], [119.05316513, 16.04697545], [119.05458553, 16.04976313], [119.05679784, 16.05197545], [119.05958553, 16.05339584], [119.0626757, 16.05388528], [119.06576587, 16.05339584], [119.06855355, 16.05197545], [119.07076587, 16.04976313], [119.07218626, 16.04697545], [119.0726757, 16.04388528], [119.0726757, 15.04098494]]], [[[118.68646749, 11.18959191], [118.85557939, 11.6136711], [118.9698053, 11.99151854], [118.97116801, 11.99433487], [118.97333431, 11.99659227], [118.97609216, 11.99806975], [118.9791716, 11.99862269], [118.98227119, 11.99819697], [118.98508753, 11.99683427], [118.98734492, 11.99466796], [118.9888224, 11.99191011], [118.98937534, 11.98883067], [118.98894963, 11.98573108], [118.87459939, 11.60747236], [118.87431591, 11.606662], [118.70476212, 11.18147468], [118.70409227, 11.18010771], [118.54242469, 10.9053354], [118.54043581, 10.90292022], [118.53779795, 10.90123786], [118.53476931, 10.90045298], [118.53164636, 10.90064241], [118.5287348, 10.90178762], [118.52631962, 10.9037765], [118.52463726, 10.90641436], [118.52385237, 10.909443], [118.52404181, 10.91256595], [118.52518702, 10.91547751], [118.68646749, 11.18959191]]], [[[115.54466883, 7.14672265], [115.54229721, 7.14468204], [115.53941108, 7.14347417], [115.53629295, 7.14321728], [115.53324806, 7.14393652], [115.53057445, 7.14556148], [115.52853383, 7.1479331], [115.52732596, 7.15081924], [115.52706908, 7.15393736], [115.52778832, 7.15698226], [115.52941328, 7.15965587], [116.23523025, 7.99221221], [116.23760187, 7.99425282], [116.240488, 7.99546069], [116.24360613, 7.99571758], [116.24665102, 7.99499834], [116.24932463, 7.99337338], [116.25136525, 7.99100176], [116.25257312, 7.98811563], [116.25283001, 7.9849975], [116.25211077, 7.98195261], [116.2504858, 7.979279], [115.54466883, 7.14672265]]], [[[112.30705249, 3.53487257], [112.51501594, 3.59753306], [112.84361424, 3.7506962], [112.84662187, 3.75155809], [112.84974864, 3.7514484], [112.85268847, 3.75037785], [112.8551536, 3.74845124], [112.85690272, 3.74585715], [112.85776462, 3.74284952], [112.85765492, 3.73972276], [112.85658437, 3.73678292], [112.85465776, 3.7343178], [112.85206367, 3.73256867], [112.52281386, 3.57910186], [112.52147408, 3.5785908], [112.31248917, 3.51562254], [112.31181658, 3.51544515], [111.79132585, 3.39736822], [111.78820398, 3.39716187], [111.78517113, 3.39793033], [111.78252419, 3.39959839], [111.78052226, 3.40200275], [111.77936129, 3.40490807], [111.77915495, 3.40802995], [111.77992341, 3.41106279], [111.78159146, 3.41370973], [111.78399583, 3.41571167], [111.78690114, 3.41687263], [112.30705249, 3.53487257]]], [[[108.26055972, 6.08912451], [108.26004031, 6.09098419], [108.23638164, 6.22427602], [108.23630689, 6.22476797], [108.19687578, 6.53630242], [108.19679674, 6.53760583], [108.1987683, 6.95072469], [108.19897125, 6.95268198], [108.22460147, 7.07791743], [108.22570055, 7.08084671], [108.22765103, 7.083293], [108.230262, 7.08501682], [108.23327786, 7.08584944], [108.23640341, 7.08570936], [108.2393327, 7.08461028], [108.24177899, 7.0826598], [108.24350281, 7.08004883], [108.24433543, 7.07703297], [108.24419535, 7.07390742], [108.21876335, 6.94964057], [108.21679964, 6.53816468], [108.25611734, 6.22752625], [108.279563, 6.09543449], [108.30878645, 6.01987736], [108.30944469, 6.0168187], [108.30912553, 6.01370633], [108.30786022, 6.01084492], [108.30577262, 6.00851455], [108.30306706, 6.00694335], [108.3000084, 6.00628511], [108.29689603, 6.00660426], [108.29403462, 6.00786957], [108.29170425, 6.00995718], [108.29013305, 6.01266273], [108.26055972, 6.08912451]]], [[[110.12822847, 11.36894451], [110.18898148, 11.48996382], [110.23982347, 11.61066468], [110.28485499, 11.78705054], [110.3083549, 11.94803461], [110.3142445, 12.14195265], [110.312278, 12.23998238], [110.31270536, 12.24308175], [110.31406956, 12.24589736], [110.31623706, 12.2481536], [110.3189957, 12.24962962], [110.32207543, 12.25018094], [110.32517479, 12.24975358], [110.3279904, 12.24838938], [110.33024665, 12.24622187], [110.33172267, 12.24346324], [110.33227398, 12.24038351], [110.33424553, 12.14210167], [110.33424294, 12.14159753], [110.32832827, 11.94685414], [110.32822801, 11.94571326], [110.30456934, 11.78364161], [110.30436343, 11.7826124], [110.25901765, 11.60499559], [110.25854422, 11.60358735], [110.20728377, 11.48189306], [110.20700505, 11.48128846], [110.14588682, 11.35954163], [110.14541497, 11.35870461], [110.07246741, 11.24270688], [110.07040803, 11.24035153], [110.0677216, 11.23874785], [110.06467109, 11.23805281], [110.0615551, 11.23833444], [110.05867865, 11.23956519], [110.05632331, 11.24162456], [110.05471962, 11.24431099], [110.05402458, 11.2473615], [110.05430621, 11.25047749], [110.05553696, 11.25335394], [110.12822847, 11.36894451]]], [[[109.82951587, 15.22896754], [109.77065019, 15.44468789], [109.67264555, 15.66561455], [109.57455994, 15.82609887], [109.51574449, 15.91095759], [109.29314007, 16.19491896], [109.29161878, 16.19765288], [109.29101677, 16.20072311], [109.29139298, 16.2038291], [109.29271057, 16.20666681], [109.29484059, 16.20895848], [109.29757451, 16.21047978], [109.30064474, 16.21108179], [109.30375073, 16.21070558], [109.30658844, 16.20938798], [109.30888011, 16.20725797], [109.53166592, 15.92306523], [109.53201478, 15.92259221], [109.59116145, 15.8372556], [109.59147511, 15.83677407], [109.6900529, 15.67548445], [109.69066131, 15.67432448], [109.7892391, 15.45210582], [109.78974541, 15.45068337], [109.84889209, 15.23393326], [109.84903675, 15.23333003], [109.8648092, 15.15722425], [109.86495704, 15.15409906], [109.86413191, 15.15108113], [109.86241457, 15.1484659], [109.85997314, 15.14650935], [109.85704658, 15.145403], [109.85392139, 15.14525516], [109.85090347, 15.14608029], [109.84828823, 15.14779763], [109.84633168, 15.15023907], [109.84522534, 15.15316562], [109.82951587, 15.22896754]]]] } }] };

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
var CHINA_BOUNDARY = {
  type: "FeatureCollection",
  features: [china_boundary_default.features[0]]
};
var CHINA_TEN_DASH = {
  type: "FeatureCollection",
  features: [china_boundary_default.features[1]]
};
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
  const chinaBoundary = opts?.chinaBoundary ? path(CHINA_BOUNDARY) ?? "" : "";
  const chinaTenDash = opts?.chinaBoundary ? path(CHINA_TEN_DASH) ?? "" : "";
  const worldView = isWorldExtent(extent);
  const wideWorld = worldView && (!display || display.extent.maxLon - display.extent.minLon >= 300);
  const gratStepDeg = wideWorld ? info.category === "azimuthal" ? [15, 15] : [30, 30] : [10, 10];
  const gratGeo = graticule().step(gratStepDeg);
  if (region) {
    gratGeo.extent([
      [region.minLon, region.minLat],
      [region.maxLon, region.maxLat]
    ]);
  }
  const grat = path(gratGeo()) ?? "";
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
  return { sphere, land, grat, extentD, tissot, markerPt, chinaBoundary, chinaTenDash };
}
var PREVIEW_STYLE = {
  sphere: { fill: "#fbfcfa", stroke: "#c9d9c9", "stroke-width": 1 },
  land: { fill: "#e9f2e3", stroke: "#b9cfb2", "stroke-width": 0.6 },
  grat: { fill: "none", stroke: "#8bab98", "stroke-width": 0.7, "stroke-dasharray": "2.5 2.5" },
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
  const wideBand = display && display.extent.maxLon - display.extent.minLon >= 300;
  const region = display && !wideBand ? display.extent : clip ?? null;
  const gratLabels = [];
  const blocked = (x, y) => x < 26 && y < 26 || // 左上：指北针
  x < 104 && y > height - 22 || // 左下：比例尺
  x > width - 74 && y > height - 44;
  if (region) {
    const lonSpan = region.maxLon - region.minLon;
    const lonStep = gratStep(lonSpan);
    let lastLonX = Number.NEGATIVE_INFINITY;
    for (let lon = Math.ceil(region.minLon / lonStep) * lonStep; lon <= region.maxLon; lon += lonStep) {
      const pt = proj([lon, region.minLat]);
      if (!pt) continue;
      const x = pt[0];
      if (x - lastLonX < 16) continue;
      const y = Math.min(pt[1] - 2, height - 3);
      if (x < 11 || x > width - 11 || y < 9 || blocked(x, y)) continue;
      lastLonX = x;
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
    let lastLonX = Number.NEGATIVE_INFINITY;
    for (let lon = -120; lon <= 120; lon += 60) {
      const pt = proj([lon, 0]);
      if (!pt) continue;
      const x = pt[0];
      if (x - lastLonX < 16) continue;
      const y = pt[1] + 7;
      if (x < 12 || x > width - 12 || y > height - 4 || blocked(x, y)) continue;
      lastLonX = x;
      gratLabels.push({ x, y, text: fmtLonLabel(lon), anchor: "middle" });
    }
    const latStepDeg = info.category === "azimuthal" ? 60 : 30;
    for (let lat = -60; lat <= 60; lat += latStepDeg) {
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
