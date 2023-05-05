import { Configuration, OpenAIApi } from "openai";
import config from "config";
import { createReadStream } from "fs";
import { services } from "./api/services.js";

class OpenAI {

	roles = {
		ASSISTANT: "assistant",
		USER: "user",
		SYSTEM: "system",
	}

	constructor(apiKey) {
		const configuration = new Configuration({
			apiKey,
		});
		this.openai = new OpenAIApi(configuration);
	};

	async chat(messages) {
		try {

			const response = await services.openaiApi.chatCompletions({
				model: "gpt-3.5-turbo",
				messages,
			});

			if (response.data.choices[0].finish_reason === "length") {
				throw new Error("Контекст сообщений переполнен, сбросьте контекст командой: /new, и повторите запрос");
			};

			return response.data.choices[0].message
		} catch (error) {
			console.error("Error in chat request:", error.message);
		}
	};

	async transcription(voiceFilePath) {
		try {

			const response = await services.openaiApi.voiceTranscription(
				createReadStream(voiceFilePath),
				"whisper-1"
			);

			return response.data.text
		} catch (error) {
			console.error("Error in transcription:", error.message);
		}
	};
};

export const openai = new OpenAI(config.get("OPENAI_KEY"));