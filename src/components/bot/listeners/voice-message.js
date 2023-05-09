import { Message } from "../../../models/message.js";
import { message } from "telegraf/filters";
import { code } from "telegraf/format";
import { INIT_SESSION } from "../../../constants.js";
import { checkTokensLimit, removeFile } from "../../../utils/helpers.js";
import { voiceConverter } from "../../voice-converter/voice-converter.js";
import { openai } from "../../openai/openai.js";

export class VoiceMessage extends Message {
    constructor(bot) {
        super(bot);
    }

    listen() {
        console.log("Init voice message listener");

        this.bot.on(message("voice"), async (ctx) => {
            ctx.session ??= INIT_SESSION;

            try {
                await ctx.reply(
                    code("Принял. Пытаюсь разобрать что вы сказали...")
                );

                const userId = String(ctx.message.from.id);
                const fileId = ctx.message.voice.file_id;

                const fileURL = await ctx.telegram.getFileLink(fileId);

                const voiceOggPath = await voiceConverter.create(
                    fileURL.href,
                    userId
                );
                const voiceMp3Path = await voiceConverter.oggToMp3(
                    voiceOggPath,
                    userId
                );

                const text = await openai.transcription(voiceMp3Path);
                await ctx.reply(code(`Ваше сообщение:\n ${text}`));

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

                removeFile(voiceMp3Path);
            } catch (error) {
                console.error("Error in voice message");
                await ctx.reply(
                    "Ошибка в голосовом сообщении, попробуйте сбросить контекст командой /new"
                );
            }
        });
    }
}
