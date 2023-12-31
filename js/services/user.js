import { fetchGETWithRetryAsync, fetchPOSTWithRetryAsync } from '../modules/fetch.js';

export async function getUserAsync(data) {
    const [result, user] = await fetchPOSTWithRetryAsync(API_BASEURL + "user", data);
    if (!result) { return null; }

    return user
}

export async function getMyBettedAsync(walletAddress) {
    const [result, betted] = await fetchGETWithRetryAsync(API_BASEURL + "entry/myentry?walletAddress=" + walletAddress);
    console.log("betted :", betted.entries);
    return betted.entries
}

export async function postEntryStatusAsync(data) {
    const [result, errorMsg] = await fetchPOSTWithRetryAsync(API_BASEURL + "register", data);
    return result
}
