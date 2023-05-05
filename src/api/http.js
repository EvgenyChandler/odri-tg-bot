import axios from "axios";
import { retryDelayTime, delay } from "../utils/helpers.js";

const MAX_RETRIES = 20;

const createApi = ( Service, baseURL, beaereToken ) => {

	const api = axios.create({
		timeout: 59000,
		withCredentials: true,
		baseURL,
		maxBodyLength: Infinity,
		maxHeaderSize: Infinity,
		maxContentLength: Infinity, 
	});
	
	api.interceptors.request.use((config) => {
		const token = beaereToken;
		config.headers.Authorization = `Bearer ${token}`
		return config;
	})
	
	api.interceptors.response.use((config) => {
		return config;
	}, async (error) => {
		console.error("Error:", error);

		const originalRequest = error.config;
		originalRequest.retryCount = originalRequest.retryCount || 0;
		const shouldRetry = originalRequest && error.response && error.response.status === 429;

		if (shouldRetry && originalRequest.retryCount < MAX_RETRIES) {
			
			try {

				const delayTime = retryDelayTime(originalRequest.retryCount);

				console.log(`Rate limit exceeded. Retrying in ${delayTime}ms.`);

				await delay(delayTime);
				originalRequest.retryCount += 1;

				console.log(`Retrying request ${originalRequest.retryCount}...`);

				return api.request(originalRequest);

						
			} catch (e) {
				console.error("Error:", error);
			}
		}
	});

	return new Service(api);
};

export { createApi };