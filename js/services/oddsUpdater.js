import { getWinOddsAsync, getQuinellaOddsAsync, getTrifectaOddsAsync } from './oddsCalculator.js';
var winOdds = {};

export async function updateWinOddsListAsync() {
    
    winOdds = await getWinOddsAsync();

    // エントリー数に応じて表示数を変更
    for (let i = winOdds.length + 1; i <= 10; i++) {
        const item = document.getElementById(`Entry__contentSingleItem${i}`);
        if (item) {
            item.remove();
        }
    }

    // エントリー内容を表示
    for (let i = 0; i < winOdds.length; i++) {
        const item = document.getElementById(`Entry__contentSingleItem${i + 1}`);
        const teamNameLabel = item.querySelector(".Entry__teamName");
        const teamOddsSpan = item.querySelector(".Entry__teamOdds");
        teamNameLabel.innerText = winOdds[i].teamName;
        teamOddsSpan.innerText = winOdds[i].oddsValue;
    }

    return winOdds
}

export async function updateQuinellaOddsAsync() {

    const elementDouble1 = document.getElementById('double-1');
    const elementDouble2 = document.getElementById('double-2');

    const quinellaOdds = await getQuinellaOddsAsync(elementDouble1.value, elementDouble2.value);

    // エントリー数に応じて表示数を変更
    let i = winOdds.length;
    while (elementDouble1.options.length > i) {
        elementDouble1.remove(i);
    }
    let k = winOdds.length;
    while (elementDouble2.options.length > k) {
        elementDouble2.remove(k);
    }

    // エントリー内容を表示
    const options1 = elementDouble1.options;
    for (let i = 0; i < options1.length && i < winOdds.length; i++) {
        options1[i].text = winOdds[i].teamName;
    }
    const options2 = elementDouble2.options;
    for (let i = 0; i < options2.length && i < winOdds.length; i++) {
        options2[i].text = winOdds[i].teamName;
    }

    const item = document.getElementById("Entry__contentDoubleInfo__oddsValue");
    if (item) {
        item.innerText = oddsValue(quinellaOdds.oddsValue);
    }

    return quinellaOdds;
}

export function updateTrifectaOddsAsync() {

    // trifectaOdds = await getTrifectaOddsAsync(team1, team2, team3);

}

function oddsValue(odds) {
    if (odds <= 1.0) {
        return 1.0;
    }

    return odds;
}
