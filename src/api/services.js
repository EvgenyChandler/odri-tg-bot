import { createApi } from "./http.js";
import config from "config";
import { OpenaiApiService } from "./services/openai-api.js";

function createServices() {
    return {
        openaiApi: createApi(
            OpenaiApiService,
            config.get("BASE_OPENAI_URL"),
            config.get("OPENAI_KEY")
        ),
    };
}

export const services = createServices();
