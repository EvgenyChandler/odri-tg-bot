import { Telegraf, session } from "telegraf";
import { Redis } from "@telegraf/session/redis";
import config from "config";
import { StartCommand } from "./commands/start-command.js";
import { NewCommand } from "./commands/new-command.js";
import { TextMessage } from "./listeners/text-message.js";
import { VoiceMessage } from "./listeners/voice-message.js";

export class Bot {
    constructor() {
        this.bot = new Telegraf(config.get("TELEGRAM_TOKEN"));
        this.commands = [];
        this.messageListeners = [];

        const store = Redis({
            url: "redis://127.0.0.1:6379",
            ttl: 3600 * 2,
        });

        this.bot.use(session({ store }));
    }

    init() {
        this.commands = [ new StartCommand(this.bot), new NewCommand(this.bot) ];

        for (const command of this.commands) {
            command.handle();
        }

        this.messageListeners = [
            new TextMessage(this.bot),
            new VoiceMessage(this.bot),
        ];

        for (const messageListen of this.messageListeners) {
            messageListen.listen();
        }
        this.bot.launch();

        process.once("SIGINT", () => this.bot.stop("SIGINT"));
        process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
    }
}
