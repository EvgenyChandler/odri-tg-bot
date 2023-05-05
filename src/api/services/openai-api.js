import FormData from "form-data";

export class OpenaiApiService {
    constructor(instance) {
        this.api = instance;
    }

    async chatCompletions(body = {}) {
        try {
            const res = await this.api.post(
                "/v1/chat/completions",
                JSON.stringify(body),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            return res;
        } catch (error) {
            console.log("Error:", error);
        }
    }

    async voiceTranscription(file, model) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("model", model);

            return await this.api.post(`/v1/audio/transcriptions`, formData, {
                method: "POST",
                headers: {
                    ...formData.getHeaders(),
                },
            });
        } catch (error) {
            console.log("Error:", error);
        }
    }
}
