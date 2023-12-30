import { fetchGETWithRetryAsync, fetchPOSTWithRetryAsync } from '../modules/fetch.js';

export async function postEntryAsync(data) {
    const [result, errorMsg] =
        await fetchPOSTWithRetryAsync(API_BASEURL + "entry/purchase", data);

    return result
}
