import { Telegraf, session } from "telegraf";
import { code } from "telegraf/format";
import { message } from "telegraf/filters";
import { Redis } from "@telegraf/session/redis";
import config from "config";
import { voiceConverter } from "./voice-converter.js";
import { openai } from "./openai.js";
import { removeFile, checkTokensLimit } from "./utils/helpers.js";

const INIT_SESSION = {
	messages: [],
};

const store = Redis({
	url: "redis://127.0.0.1:6379",
	ttl: 3600*2,
});

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.use(session({ store }));

bot.command("new", async (ctx) => {
	ctx.session = INIT_SESSION;
	await ctx.reply("Просто спроси или напиши, расскажу всё, что знаю");
});

bot.command("start", async (ctx) => {
	ctx.session = INIT_SESSION;
	await ctx.reply("Просто спроси или напиши, расскажу всё, что знаю");
});

bot.on(message("voice"), async (ctx) => {
	ctx.session ??= INIT_SESSION;

	try {
		await ctx.reply(code("Принял. Пытаюсь разобрать что вы сказали..."));

		const userId = String(ctx.message.from.id);
		const fileId = ctx.message.voice.file_id;

		const fileURL = await ctx.telegram.getFileLink(fileId);

		const voiceOggPath = await voiceConverter.create(fileURL.href, userId);
		const voiceMp3Path = await voiceConverter.oggToMp3(voiceOggPath, userId);

		const text = await openai.transcription(voiceMp3Path);
		await ctx.reply(code(`Ваше сообщение:\n ${text}`));

		ctx.session.messages.push({ role: openai.roles.USER, content: text });

		ctx.session.messages = checkTokensLimit(ctx.session.messages);
		const response = await openai.chat(ctx.session.messages);

		ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content });
		await ctx.reply(response.content);

		removeFile(voiceMp3Path);
	} catch (error) {
		console.error('Error in voice message');
		await ctx.reply('Ошибка в голосовом сообщении, попробуйте сбросить контекст командой /new');
	}
});

bot.on(message("text"), async (ctx) => {
	ctx.session ??= INIT_SESSION;
	try {
		await ctx.reply(code("Принял. Дайте подумать..."));

		const text = ctx.message.text;

		ctx.session.messages.push({ role: openai.roles.USER, content: text });
		
		ctx.session.messages = checkTokensLimit(ctx.session.messages);

		const response = await openai.chat(ctx.session.messages);

		ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content });
		await ctx.reply(response.content);

	} catch (error) {
		console.error('Error in text message:', error.message);
		await ctx.reply('Ошибка, опробуйте сбросить контекст командой /new');
	}
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
