import { Game } from './components/Game.js'
import { Animation } from './components/Animation.js';

let game = new Game('three-container');


function main() {
    Animation.animate(game);  //animation loops internally
}

//start game
main();
