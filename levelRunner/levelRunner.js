class LevelView {
  constructor(level) {
    this.canvas = Canvas.createNew(1024, 768);
    document.getElementsByTagName('body')[0].appendChild(this.canvas.domElement);

    this.level = level;

    this.styles = {
      environment: {
        background: '#47847F',
        border: '2px solid #1D2B2A'
      },
      block: {
        fill: '#335C59',
        stroke: '#1D2B2A',
        strokeWidth: 3
      },
      ball: {
        fill: '#FFFFFFBC',
        stroke: '#00000055',
        strokeWidth: 1
      },
      timeLine: {
        stroke: '#d5eb34',
        strokeWidth: 3
      }
    };

    document.getElementsByTagName('BODY')[0].style['background-color'] = this.styles.environment.background;
    this.canvas.domElement.style.border = this.styles.environment.border;
  }

  dispose() {
    document.getElementsByTagName('body')[0].removeChild(this.canvas.domElement);
    delete this.canvas;
  }

  update() {
    this.canvas.clear();
    const ctx = this.canvas.context;

    const drawAabb = aabb => {
      ctx.beginPath();
      ctx.moveTo(aabb.min.x, aabb.min.y);
      ctx.lineTo(aabb.min.x, aabb.max.y);
      ctx.lineTo(aabb.max.x, aabb.max.y);
      ctx.lineTo(aabb.max.x, aabb.min.y);
      ctx.lineTo(aabb.min.x, aabb.min.y);
      ctx.strokeStyle = '#cbc1d9';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawBlock = block => {
      if (block.dead) return;
      ctx.beginPath();
      ctx.rect(block.position.x, block.position.y, block.size.x, block.size.y);
      ctx.fillStyle = this.styles.block.fill;
      ctx.strokeStyle = this.styles.block.stroke;
      ctx.lineWidth = this.styles.block.strokeWidth;
      ctx.fill();
      ctx.stroke();
    };

    const drawBall = ball => {
      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI);
      ctx.lineWidth = this.styles.ball.strokeWidth;
      ctx.strokeStyle = this.styles.ball.stroke;
      ctx.fillStyle = this.styles.ball.fill;
      ctx.stroke();
      ctx.fill();
    };

    this.level.blocks.forEach(drawBlock)
    this.level.balls.forEach(drawBall);
    this.level.gun.balls.forEach(drawBall);

    ctx.beginPath();
    ctx.moveTo(this.level.gun.position.x, this.level.gun.position.y);
    ctx.lineTo(this.level.gun.point.x, this.level.gun.point.y);
    ctx.strokeStyle = '#d5eb34';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(this.level.time/this.level.timeLimit * 1024, 1);
    ctx.strokeStyle = this.styles.timeLine.stroke;
    ctx.lineWidth = this.styles.timeLine.strokeWidth;
    ctx.stroke();
  }
}

class GunCtrl {
  constructor(gun) {
    this.gun = gun;
  }

  get empty() { return this.gun.balls.length == 0; }
  get direction() { return Vector.diffVecVec(this.gun.point, this.gun.position); }

  fire(power = 2) {
    const ball = this.gun.balls.pop();
    ball.velocity = this.direction.unit;
    ball.velocity.length = power;
    return ball;
  }

  moveTo(x, y) {
    let off = new Vector(x, y);
    off.subVec(this.position);
    off.y = 0;

    this.position.addVec(off);
    this.barrel.p0.addVec(off);
    this.barrel.p1.addVec(off);
  }

  pointTo(x, y) {
    const offset = Vector.diffVecVec(new Vector(x, y), this.gun.position);
    offset.length = this.gun.length;
    this.gun.point = Vector.sumVecVec(this.gun.position, offset);
  }
}

class LevelCtrl {
  constructor(level, frameRate) {
    this.level = level;
    this.gunctrl = new GunCtrl(this.level.gun);
    this.level.gun.balls = this.level.balls;
    this.level.balls = [];
    this.frameRate = frameRate;
    this.gameover = false;
    this.onWin = null;
    this.onLoose = null;
  }

  reset() {
    this.gameover = false;
    this.level.time = this.level.timeLimit;
    this.level.blocks.forEach(block => {
      block.health = 100;
      block.dead = false;
      block.collided = false;
    });
    this.level.balls.forEach(ball => {
      delete ball.velocity;
      ball.position = this.level.gun.position.clone();
      this.level.gun.balls.push(ball);
    });
    this.level.balls = [];
  }

  update() {
    if (!this.gameover) {
      this.decrementTime();
      if (this.isTimeElapsed()) { this.onLoose(); this.gameover = true; }
      if (this.areAllBlocksDead()) { this.onWin(); this.gameover = true; }
    }

    this.level.blocks.forEach(block => { block.collided = false; });

    let balls = [];
    this.level.balls.forEach(ball => {
      ball.position.addVec(ball.velocity);

      if (ball.position.y >= 768) {
        delete ball.velocity;
        ball.position = this.level.gun.position.clone();
        this.level.gun.balls.push(ball);
        return;
      } else balls.push(ball);

      Collisions.ResolveObjWall(ball);
      this.level.blocks.forEach(block => {
        if (block.dead) return;
        if (!Collisions.checkAabbAabb(ball.aabb, block.aabb)) return;
        this.hitBlock(block);
        Collisions.ResolveBlockBall(block, ball);
      });
    });

    this.level.balls = balls;
  }

  runBall(mouseEvent) {
    if (!this.gunctrl.empty)
      this.level.balls.push(this.gunctrl.fire(this.frameRate*0.2));
  }

  hitBlock(block) {
    block.health--;
    block.collided = true;
    if (block.health <= 0) {
      block.dead = true;
      this.incrementTime();
    }
  }

  areAllBlocksDead() {
    return this.level.blocks.every(block => { return block.dead; });
  }

  decrementTime() {
    this.level.time -= 1/this.frameRate;
  }

  incrementTime() {
    if (this.gameover) return;
    this.level.time += this.level.timeQuant;
    this.level.time = Math.min(this.level.time, this.level.timeLimit);
  }

  isTimeElapsed() {
    return this.level.time <= 0;
  }

  pointGun(mouseEvent) {
    this.gunctrl.pointTo(mouseEvent.offsetX, mouseEvent.offsetY);
  }
}

class LevelRunner {
  constructor() {
    this.view = null;
    this.ctrl = null;
    this.frameRate = 60;
    this.onLevelReset = null;
    this.onWin = null;
    this.onLoose = null;
  }

  reset(level) {
    if (this.stop) this.stop();
    if (level) {
      this.view = new LevelView(level);
      this.ctrl = new LevelCtrl(level, this.frameRate);
      this.ctrl.onWin = () => {
        this.detachControls();
        this.onWin();
      };
      this.ctrl.onLoose = () => {
        this.detachControls();
        this.onLoose();
      };
    } else this.ctrl.reset();

    this.ctrl.update(); // return all balls to the gun
    this.view.update(); // redraw the scene

    this.onLevelReset();
  }

  run() {
    if (!this.ctrl || !this.view)
      throw "Cannot run level since LevelRunner is not initialized";

    this.attachControls();
    const interval = window.setInterval(() => {
      this.ctrl.update();
      this.view.update();
    }, 1000 / this.frameRate);

    this.stop = () => {
      window.clearInterval(interval);
      delete this.stop;
    };
  }

  attachControls() {
    this.view.canvas.onMouseDown = this.ctrl.runBall.bind(this.ctrl);
    this.view.canvas.onMouseMove = this.ctrl.pointGun.bind(this.ctrl);
  }

  detachControls() {
    this.view.canvas.onMouseDown = null;
    this.view.canvas.onMouseMove = null;
  }

  dispose() {
    detachControls();
    this.view.dispose();
    this.view = null;
    this.ctrl = null;
  }
}
