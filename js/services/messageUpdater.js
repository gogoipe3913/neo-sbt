import { fetchGETWithRetryAsync, fetchPOSTWithRetryAsync } from '../modules/fetch.js';

export async function updateMessageAsync(data) {
    const [result, msg] = await fetchGETWithRetryAsync(API_BASEURL + "message");

    document.getElementById("Info__text__1").innerText = msg[0].content;
    document.getElementById("Info__text__2").innerText = msg[1].content;
    document.getElementById("Info__text__3").innerText = msg[2].content;
}
