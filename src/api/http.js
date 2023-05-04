import axios from "axios";

const MAX_RETRIES = 20;
const RETRY_DELAY_MS = 2000;

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
		originalRequest.retryCount = 0;
		const shouldRetry = originalRequest && error.response && error.response.status === 429;

		if (shouldRetry && originalRequest.retryCount < MAX_RETRIES) {
			
			try {
				return api.request(originalRequest);
				
			} catch (e) {
				console.error("Error:", error);
			}

			originalRequest.retryCount += 1;
		}
	});

	return new Service(api);
};

export { createApi };