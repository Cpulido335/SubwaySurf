export class RandomEventTimer {
    constructor(callback, interval = 2000) {
        this.callback = callback; //Function to execute
        this.interval = interval; 
        this.timer = null;
    }

    start() {
        if (this.timer === null) {
            this.timer = setInterval(() => {
                this.callback(); //execute the function every interval
                console.log("Callback function set");
            }, this.interval);
        }
        console.log("Timer started");
    }

    stop() {
        if (this.timer !== null) { //how do I even do this
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}