import { fetchGETWithRetryAsync, fetchPOSTWithRetryAsync } from '../modules/fetch.js';

export async function getRaceInfoAsync() {
    const [raceInfoResult, raceInfo] = await fetchGETWithRetryAsync(API_BASEURL + "race/raceinfo");
    return raceInfo
}

export function updateRaceInfo(raceInfo) {
    document.getElementById("Entry__subTitle_raceName").innerText = raceInfo.raceName;
}