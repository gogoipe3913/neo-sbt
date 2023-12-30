import { fetchGETWithRetryAsync, fetchPOSTWithRetryAsync } from '../modules/fetch.js';

export async function getWinOddsAsync() {
    const [result, odds] =
        await fetchGETWithRetryAsync(API_BASEURL + "entry/winodds");
    if (!result) { return null; }
    
    odds.odds.sort(function(a, b) {
        return a.teamId - b.teamId;
    });
    console.log("WinOdds :", odds.odds);

    return odds.odds;
}

export async function getQuinellaOddsAsync(team1, team2) {
    const [result, odds] =
        await fetchGETWithRetryAsync(API_BASEURL + `entry/quinellaodds?teamId1=${team1}&teamId2=${team2}`);
    if (!result) { return null; }

    console.log("QuinellaOdds :", odds);

    return odds.odds;
}

export async function getTrifectaOddsAsync(team1, team2, team3) {
    const [result, odds] =
        await fetchGETWithRetryAsync(API_BASEURL + `entry/trifectaodds?teamId1=${team1}&teamId2=${team2}&teamId3=${team3}`);
    if (!result) { return null; }

    console.log("TrifectaOdds :", odds);

    return odds.odds;
}