export class Message {
    constructor(bot) {
        this.bot = bot;
    }

    listen() {
        throw new Error("Abstract method listen must be implemented");
    }
}
