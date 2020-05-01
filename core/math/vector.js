class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set length(val) {
    //if (this.x == 0) { this.y = val; return; }     
    const k = this.y/this.x;
    const r2 = val*val;
    const x2 = r2/(1 + k*k);
    this.x = Math.sqrt(x2)*Math.sign(this.x);
    this.y = Math.sqrt(r2 - x2)*Math.sign(this.y);
  }

  get unit() {
    let l = this.length;
    return new Vector(this.x / l, this.y / l);
  }

  distance(other) {
    const x0 = this.x;
    const y0 = this.y;
    const x1 = other.x;
    const y1 = other.y;

    return Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2));
  }

  sqrDistance(other) {
    const x0 = this.x;
    const y0 = this.y;
    const x1 = other.x;
    const y1 = other.y;

    return Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2);
  }

  addVec(other) {
    this.x += other.x;
    this.y += other.y;
  }

  subVec(other) {
    this.x -= other.x;
    this.y -= other.y;
  }

  addScal(a) {
    this.x += a;
    this.y += a;
  }

  subScal(a) {
    this.x -= a;
    this.y -= a;
  }

  multScal(a) {
    this.x *= a;
    this.y *= a;
  }

  dotVec(other) {
    return this.x * other.x + this.y * other.y;
  }

  angle(other) {
    return Math.acos(this.dotVec(other) / (this.length * other.length));
  }

  static sumVecVec(v1, v2) {
    let res = v1.clone();
    res.addVec(v2);
    return res;
  }

  static diffVecVec(v1, v2) {
    let res = v1.clone();
    res.subVec(v2);
    return res;
  }

  static multVecScal(vec, a) {
    let res = vec.clone();
    res.multScal(a);
    return res;
  }

  static sumVecScal(vec, a) {
    let res = vec.clone();
    res.addScal(a);
    return res;
  }

  static diffVecScal(v1, a) {
    let res = v1.clone();
    res.subScal(a);
    return res;
  }

  static revive({x, y}) {
    return new Vector(x, y);
  }
}
