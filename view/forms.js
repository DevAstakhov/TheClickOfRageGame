class Forms {
  constructor() {
    this.onCountdownEnd = null;
    this.onWinAccepted = null;
    this.onLooseAccepted = null;

    this.body = document.getElementsByTagName('BODY')[0];

    this.overlay = document.createElement("DIV");
    this.overlay.className = 'overlay';

    this.window = document.createElement("DIV");
    this.window.className = 'window';
    this.overlay.appendChild(this.window);

    this.caption = document.createElement("DIV");
    this.caption.className = 'windowCaption';
    this.window.appendChild(this.caption);

    this.img = document.createElement("IMG");
    this.img.className = 'windowIcon';
    this.img.src = 'resources/cup.svg';
    this.window.appendChild(this.img);

    this.winImg = document.createElement("IMG");
    this.winImg.className = 'windowIcon';
    this.winImg.src = 'resources/cup.svg';

    this.looseImg = document.createElement("IMG");
    this.looseImg.className = 'windowIcon';
    this.looseImg.src = 'resources/fish.svg';

    this.button = document.createElement('BUTTON');
    this.button.className = 'formButton';
    this.window.appendChild(this.button);
  }

  showWin() {
    this.caption.innerText = 'You are Awesome!';
    this.img.src = 'resources/cup.svg'
    this.button.innerText = 'Again';
    this.button.onclick = this.onWinAccepted;
    this.show();
  }

  showLoose() {
    this.caption.innerText = 'One more time?';
    this.img.src = 'resources/fish.svg'
    this.button.innerText = 'yep';
    this.button.onclick = this.onLooseAccepted;
    this.show();
  }

  show() { this.body.appendChild(this.overlay); }
  hide() { this.body.removeChild(this.overlay); }

  showCountdown() {
    this.img.src = 'resources/mainicon.svg';
    this.button.innerText = 'GET OUT!';
    this.button.onclick = () => {
      clearInterval(interval);
      this.hide();
      this.onCountdownEnd();
    };
    let i = 0;
    const v = ['SET', 'READY', 'KILL'];
    this.caption.innerText = v[i++];
    this.show();
    const interval = setInterval(() => {
      this.caption.innerText = v[i++];
      if (i < 4) return;
      this.button.onclick();
    }, 1000);
  }
}
