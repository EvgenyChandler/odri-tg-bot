import { Configuration, OpenAIApi } from "openai";
import config from "config";
import { createReadStream } from "fs";
import { delay } from "./utils/helpers.js";

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
			const response = await this.openai.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages,
			});

			return response.data.choices[0].message
		} catch (error) {
			if (response.status === 429) {
				await delay(5000);
				return this.chat(messages);
			}
			console.error("Error in chat request:", error.message);
		}
	};

	async transcription(voiceFilePath) {
		try {

			const response = await this.openai.createTranscription(
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