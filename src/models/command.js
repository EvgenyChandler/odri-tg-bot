export class Command {
    constructor(bot) {
        this.bot = bot;
    }

    handle() {
        throw new Error("Abstract method handle must be implemented");
    }
}
