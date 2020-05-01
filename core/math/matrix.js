class Matrix {
  static multiply(a, b) {
    let mult = (a,b,i,j) => {
      return a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j];
    }

    return [
      [mult(a,b,0,0), mult(a,b,0,1), mult(a,b,0,2)],
      [mult(a,b,1,0), mult(a,b,1,1), mult(a,b,1,2)],
      [mult(a,b,2,0), mult(a,b,2,1), mult(a,b,2,2)]
    ];
  }

  static apply(m, p) {
    let v = [p.x, p.y, 1];

    let mult = (v, m, i) => {
      return v[0]*m[i][0] + v[1]*m[i][1] + v[2]*m[i][2];
    }
    let res = [mult(v, m, 0), mult(v, m, 1), mult(v, m, 2)];
    p.x = res[0];
    p.y = res[1];
  }

  static identity() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  static rotate(angle) {
    let sinA = Math.sin(angle);
    let cosA = Math.cos(angle);

    return [
      [cosA, -sinA,  0],
      [sinA,  cosA,  0],
      [   0,     0,  1]
    ];
  }

  static scale(sX, sY) {
    return [
      [sX,   0,   0],
      [ 0,  sY,   0],
      [ 0,   0,   1]
    ];
  }

  static translate(tX, tY) {
    return [
      [1,   0,   tX],
      [0,   1,   tY],
      [0,   0,   1]
    ];
  }

  static transform(a,b,c,d,e,f) {
    return [
      [a, c, e],
      [b, d, f],
      [0, 0, 1]
    ];
  }
}
