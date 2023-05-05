import { unlink } from "fs/promises";

export async function removeFile(path) {
	try {
		await unlink(path);
	} catch (error) {
		console.error("Error when file remove:", error.message);
	}
};

export const delay = (ms) => new Promise((r) => setTimeout(r,ms));

export const retryDelayTime = (attemptNumber) => {
	return Math.pow(2, attemptNumber) * 1000;
  };

export const checkTokensLimit = (messages) => {
	let sum = 0;
	const arr = messages;
  
	arr.forEach((m) => {
	  const length = m.content.length;
	  sum = sum + length;
	});
  
	while (sum > 12000 && arr.length > 2) {
	  arr.splice(0, 2);
	  sum = arr.reduce((a, b) => a + b.content.length, 0);
	}
	return arr;
  };
  