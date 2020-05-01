class Collisions {
  constuctor() {}

  static checkAabbPoint(aabb, point) {
    return (aabb.min.x < point.x && point.x < aabb.max.x && aabb.min.y < point.y && point.y < aabb.max.y);
  }

  static checkAabbAabb(aabb1, aabb2) {
    return !(
      aabb1.max.x < aabb2.min.x ||
      aabb2.max.x < aabb1.min.x ||
      aabb1.max.y < aabb2.min.y ||
      aabb2.max.y < aabb1.min.y );
  }

  static overlapAabbAabb(aabb1, aabb2) {
    return new Vector(
      Math.max(aabb1.min.x - aabb2.max.x, aabb2.min.x - aabb1.max.x),
      Math.max(aabb1.min.y - aabb2.max.y, aabb2.min.y - aabb1.max.y));
  }

  static ResolveObjWall(obj) {
    if (obj.aabb.min.x <= 0 || obj.aabb.max.x > 1024)
      obj.velocity.x = -obj.velocity.x;
    if (obj.aabb.min.y <= 0)
      obj.velocity.y = -obj.velocity.y;
  }

  static ResolveBlockBall(block, ball) {
    let overlap = Collisions.overlapAabbAabb(ball.aabb, block.aabb);
    if (overlap.x > overlap.y) ball.velocity.x = -ball.velocity.x;
    else ball.velocity.y = -ball.velocity.y;
  }
}
