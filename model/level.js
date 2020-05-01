class Aabb {
  constructor(size, pos) {
    this.size = size;
    this.position = pos.clone();
  }

  get min() { return this.topLeftCorner; }
  get max() { return this.bottomRightCorner; }

  get topLeftCorner() { return this.position; }
  get bottomRightCorner() { return Vector.sumVecVec(this.position, this.size); }
  get topRightCorner() {
    const l = this.position.clone();
    l.x += this.size.y;
    return l;
  }
  get bottomLeftCorner() {
    const l = this.position.clone();
    l.y += this.size.y;
    return l;
  }

  get corners() {
    return [
      this.topLeftCorner,
      this.bottomLeftCorner,
      this.bottomRightCorner,
      this.topRightCorner
    ];
  }
}

class Gun {
  constructor(position = new Vector(0, 0), length = 1) {
    this.position = position;
    this.length = length;
    this.point = position.clone();
    this.point.x += length;
    this.balls = [];
  }
}

class Ball {
  constructor(radius, pos) {
    this.radius = radius;
    this.position = pos;
  }

  get aabb() {
    return new Aabb(
      new Vector(this.radius*2, this.radius*2),
      Vector.diffVecScal(this.position, this.radius));
  }
}

class Block {
  constructor(size, pos, health) {
    this.size = size;
    this.position = pos;
    this.health = health;
    this.dead = false;
    this.collided = false;
  }

  get aabb() { return new Aabb(this.size, this.position); }
}

class Level {
  constructor() {
    this.width = null;
    this.height = null;
    this.gun = new Gun();
    this.blocks = [];
    this.balls = [];
    this.timeQuant = 3;
    this.timeLimit = 12;
    this.time = this.timeLimit; // by value!
  }

  get size() { return new Vector(this.width, this.height); }

  fromSVGXML(svgXMLDoc) {
    let parser = new SVGParser();
    const svgLevel = parser.parseSVGXML(svgXMLDoc);

    function Transformer(p) {
      const m = Matrix.transform(p[0],p[1],p[2],p[3],p[4],p[5],p[6]);
      this.apply = shape => {
        ['x,y','cx,cy','width,height'].forEach(pair => { // full transformation apply
          const nm = pair.split(',');
          if (!shape[nm[0]]) return;
          const v = new Vector(shape[nm[0]], shape[nm[1]]);
          Matrix.apply(m, v);
          shape[nm[0]] = v.x;
          if (nm[0] != nm[1])
            shape[nm[1]] = v.y;
        });
        ['r', 'rx,ry'].forEach(pair => { // scale only
          if (pair == 'r' && shape.r) {
            shape.rx = shape.r;
            shape.ry = shape.r;
            delete shape.r;
            return;
          }
          const nm = pair.split(',');
          if (nm.length > 0 && shape[nm[0]]) shape[nm[0]] *= m[0][0];
          if (nm.length > 1 && shape[nm[1]]) shape[nm[1]] *= m[1][1];

        });
      };
    }

    function Translator(p) {
      const m = Matrix.translate(p[0],p[1]);
      const pairs = ['x,y','cx,cy'];
      this.apply = shape => {
        pairs.forEach(pair => {
          const nm = pair.split(',');
          if (!shape[nm[0]]) return;
          const v = new Vector(shape[nm[0]], shape[nm[1]]);
          Matrix.apply(m, v);
          shape[nm[0]] = v.x;
          shape[nm[1]] = v.y;
        });
      };
    }

    let transform = {
      stack: [],
      get last() { return this.stack[this.stack.length - 1]; },
      push: function(m) { this.stack.unshift(m); },
      pop: function() { this.stack.shift(); },
      apply: function(shape) {
        this.stack.forEach(tr => { tr.apply(shape); });
      },
      pushSVGTransform: function(tr) {
        this.push((function(t) {
          switch (t.type) {
            case "matrix": return new Transformer(t.parameters);
            case "translate": return new Translator(t.parameters);
            default: throw transform.type + " is not supported.";
          }})(tr) );
      }
    };

    const makeBlock = (r) => {
      transform.apply(r);
      let size = new Vector(r.width, r.height);
      let pos = new Vector(r.x, r.y);
      return new Block(size, pos, 100);
    };

    const makeBall = (e) => {
      transform.apply(e);
      let size = new Vector(e.rx, e.ry);
      let pos = new Vector(e.cx, e.cy);
      return new Ball(size.x, pos);
    };

    const makeBallFromCircle = (e) => {
      transform.apply(e);
      let pos = new Vector(e.cx, e.cy);
      let rad = 4;
      if (e.r) rad = e.r;
      if (e.rx) rad = e.rx;
      return new Ball(rad, pos);
    };

    const extractShapes = (node, m) => {
      if (node.transform) transform.pushSVGTransform(node.transform);

      if (node.rect && node.id == "blocksGroup")
        node.rect.forEach(r => {
          if (r.transform) transform.pushSVGTransform(r.transform);
          this.blocks.push(makeBlock(r));
          if (r.transform) transform.pop();
        });

      if (node.ellipse && node.id == "ballsGroup")
        node.ellipse.forEach(e => {
          if (e.transform) transform.pushSVGTransform(e.transform);
          this.balls.push(makeBall(e));
          if (e.transform) transform.pop();
        });

      if (node.circle && node.id == "ballsGroup")
        node.circle.forEach(e => {
          if (e.transform) transform.pushSVGTransform(e.transform);
          this.balls.push(makeBallFromCircle(e));
          if (e.transform) transform.pop();
        });

      if (node.g) node.g.forEach(g => { extractShapes(g); });
      if (node.transform) transform.pop();
    };

    svgLevel.svg.forEach(extractShapes);
    this.balls.forEach((ball, i) => {
      ball.position.reset(512, 740);
    });

    this.gun = new Gun(new Vector(512, 740), 70);
  }
}
