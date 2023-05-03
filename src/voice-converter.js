import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";
import { createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { removeFile } from "./utils/helpers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

class VoiceConverter {
	constructor() {
		ffmpeg.setFfmpegPath(installer.path);
	};

	async oggToMp3(input, output) {
		try {
			const outputPath = resolve(dirname(input), `${output}.mp3`);
			return new Promise((resolve, reject) => {
				ffmpeg(input)
					.inputOption("-t 30")
					.output(outputPath)
					.on("end", () => {
						removeFile(input);
						resolve(outputPath);
					})
					.on("error", (error) => reject(error.message))
					.run();
			});
		} catch (error) {
			console.error(error.message);
		};
	};

	async create(url, fileName) {
		try {
			const voiceFilePath = resolve(__dirname, "../voices", `${fileName}.ogg`);

			const response = await axios({
				method: "get",
				url,
				responseType: "stream"
			});
			return new Promise((resolve) => {

				const stream = createWriteStream(voiceFilePath);
				
				response.data.pipe(stream);
				
				stream.on("finish", () => {
					resolve(voiceFilePath);
				});
			});
			
		} catch (error) {
			console.error("Error in creatig voice converter:", error.message);
		};
	};
};

export const voiceConverter = new VoiceConverter();