import { globalState,serverAddr } from "./script.js";

export async function fetchJwt(url, options = {}, maxRetries = 3, backoffMs = 500) {
    const reqId = crypto.randomUUID();    
    const headers = {
        ...options.headers,
        "X-Request-Id": reqId,
    };
    
    let attempt = 0;
    while (true) {
        try {

            const timestamp = new Date().toISOString();
            headers["X-Timestamp"] = timestamp;
            const response = await fetch(`${serverAddr}${url}`, {
                ...options,
                headers,
                credentials: "include",
            });

            console.log(`${serverAddr}${url},`, options,headers) // debug

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }
            return response
        } catch (error) {
            // Only retry on network errors (TypeError) or failed fetch, not HTTP errors
            if (error instanceof TypeError && attempt < maxRetries) {
                attempt++;
                const delay = backoffMs * Math.pow(2, attempt - 1); // exponential backoff
                console.warn(`Network error, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.log(error)
                throw error;
            }
        }
    }
}