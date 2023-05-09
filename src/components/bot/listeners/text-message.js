import { Message } from "../../../models/message.js";
import { message } from "telegraf/filters";
import { code } from "telegraf/format";
import { INIT_SESSION } from "../../../constants.js";
import { checkTokensLimit } from "../../../utils/helpers.js";
import { openai } from "../../openai/openai.js";

export class TextMessage extends Message {
    constructor(bot) {
        super(bot);
    }

    listen() {
        console.log("Init text message listener");

        this.bot.on(message("text"), async (ctx) => {
            ctx.session ??= INIT_SESSION;
            try {
                await ctx.reply(code("Принял. Дайте подумать..."));

                const text = ctx.message.text;

                ctx.session.messages.push({
                    role: openai.roles.USER,
                    content: text,
                });

                ctx.session.messages = checkTokensLimit(ctx.session.messages);

                const response = await openai.chat(ctx.session.messages);

                ctx.session.messages.push({
                    role: openai.roles.ASSISTANT,
                    content: response.content,
                });
                await ctx.reply(response.content);
            } catch (error) {
                console.error("Error in text message:", error.message);
                await ctx.reply(
                    "Ошибка, опробуйте сбросить контекст командой /new"
                );
            }
        });
    }
}
