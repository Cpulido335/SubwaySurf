export class CoinOverlay {
    constructor() {
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.top = 'calc(50% + 10px)'; //10px below halfway point of screen
        this.element.style.right = '10px';            //right edge of the screen
        this.element.style.background = 'rgba(255, 215, 0, 0.9)';
        this.element.style.color = 'black';
        this.element.style.padding = '8px 12px';
        this.element.style.fontFamily = 'monospace';
        this.element.style.fontSize = '16px';
        this.element.style.fontWeight = 'bold';
        this.element.style.borderRadius = '5px';
        this.element.style.zIndex = '1000';
        this.element.innerText = 'Coins: 0';

        document.body.appendChild(this.element);
    }

    update(player) {
        this.element.innerText = `Coins: ${player.coinsCollected}`;
    }
}
