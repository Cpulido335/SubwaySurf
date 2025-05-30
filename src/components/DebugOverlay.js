let debugOverlayEnabled = false;

export class DebugOverlay {
  

    constructor() {
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.top = '10px';
        this.element.style.left = '10px';
        this.element.style.background = 'rgba(0, 0, 0, 0.7)';
        this.element.style.color = 'lime';
        this.element.style.padding = '10px';
        this.element.style.fontFamily = 'monospace';
        this.element.style.fontSize = '14px';
        this.element.style.zIndex = '999';
        this.element.innerText = 'Debug Info Loading...';

        // Only append the element if enabled
        if (debugOverlayEnabled) {
            document.body.appendChild(this.element);
        }
    }

    update(player, game) {
        if (!debugOverlayEnabled) return; // Don't update if disabled

        this.element.innerText = `
        Jumping: ${player.startedJump}
        Falling: ${player.startedFall}
        Ended Jump: ${player.endedJump}
        player.jumpStartingHeight: ${player.jumpStartingHeight}
        CoinsCollected: ${player.coinsCollected}
        LengthSurfaceObjectMeshQueue: ${game.surfaceObjectMeshQueue.length}
        LengthModelMeshQueue: ${game.modelMeshQueue.length}
        LengthSurfaceObjectBoundingBoxQueue: ${game.surfaceObjectBoundingBoxQueue.length}
        LengthDeathObjectMeshQueue: ${game.deathObjectMeshQueue.length}
        LengthDeathObjectBoundingBoxQueue: ${game.deathObjectBoundingBoxQueue.length}
        LengthCoinMeshQueue: ${game.coinQueue.length}
        LengthCoinBoundingBoxQueue: ${game.coinBoundingBoxQueue.length}
        `;
    }
}
