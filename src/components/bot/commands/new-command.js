import { INIT_SESSION } from "../../../constants.js";
import { Command } from "../../../models/command.js";

export class NewCommand extends Command {
    constructor(bot) {
        super(bot);
    }

    handle() {
        this.bot.command("new", async (ctx) => {
            ctx.session = INIT_SESSION;
            await ctx.reply("Просто спроси или напиши, расскажу всё, что знаю");
        });
    }
}
