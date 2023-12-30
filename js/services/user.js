import { fetchGETWithRetryAsync, fetchPOSTWithRetryAsync } from '../modules/fetch.js';

export async function getUserAsync(data) {
    const [result, user] = await fetchPOSTWithRetryAsync(API_BASEURL + "user", data);
    return user
}
