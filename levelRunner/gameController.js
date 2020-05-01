class GameController {
  constructor(level) {
    this.level = level;
    this.gun = new GunController(this.level.gun);

    this.view.onMouseDown = this.startNextBall.bind(this);
    this.cursorPosition = new Vector(0, 0);
  }

  update(timeStep) {
    this.gun.headBarrelToDirection(this.cursorPosition.x, this.cursorPosition.y);

    this.level.balls.forEach((ball) => {
        Physics.moveOn(ball, timeStep)
      });

    this.level.balls.forEach((ball) => {
        Collision.ballWall(ball, this.level.walls);
      });

    this.level.balls.forEach((ball) => {
        Collision.ballBlocks(ball, this.level.blocks);
      });

    let allBlocksAreDead = true;
    this.level.blocks.forEach((block) => {
      if (block.dead) {
        block.fillStyle = '#2E5359';
        block.strokeStyle = '#2E4359';
        block.fontStyle = '#2E5359';
      } else {
        allBlocksAreDead = false;
      }
    });

    this.view.update();

    if (allBlocksAreDead)
      this.onWin();
  }

  startNextBall() {
    const ball = this.level.gun.balls.pop();
    if (ball === undefined)
      return;

    Physics.startMovement(ball, this.cursorPosition, 3);
    this.level.balls.push(ball);
  }
}
