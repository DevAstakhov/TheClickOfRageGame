export default class Settings {
  constructor() {
    this.gameFrameRate = 120;
  }

  set frameRate(framesPerSec) {
    this.gameFrameRate = framesPerSec;
  }

  get updateIntervalMs() {
    return 1000/this.gameFrameRate;
  }

  get updateIntervalSec() {
    return 1/this.gameFrameRate;
  }
}
