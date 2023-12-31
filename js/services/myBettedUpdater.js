export async function updateMyBettedListAsync(myBetted, winOdds) {
    var ul = document.getElementById('EntryStatus__content__list');
    ul.innerHTML = '';

    var totalBetCount = 0;
    myBetted.forEach(function(item) {
        var date = timestampToDate(item.timestamp);
        var betType = betTypeIDToString(item.betTypeID);
        var teamName = selectionsToOdds(item.selection, item.betTypeID, winOdds);
        var odds = oddsValue(item.odds);

        // Create li element
        var li = document.createElement('li');
        li.className = "EntryStatus__contentSingleItem";

        li.innerHTML = `
            <span class="EntryStatus__listLeftColumn">
                <span class="EntryStatus__date">${date}</span>
                <span class="EntryStatus__type">${betType}</span>
                <span class="EntryStatus__teamName">${teamName}</span>
            </span>
            <span class="EntryStatus__listRightColumn">
                <span class="EntryStatus__sold">${item.amount}</span>
                <span class="EntryStatus__odds">${odds}</span>
            </span>
        `;

        // Append the new li element to the ul
        ul.appendChild(li);

        totalBetCount += Number(item.amount);
    });

    document.getElementById('EntryStatus__statusItemValue__total').innerText = totalBetCount;
}

function betTypeIDToString(betTypeId) {
    return BETTYPEID_MAP[betTypeId] || "Unknown Bet Type";
}

function selectionsToOdds(selection, betTypeId, winOdds) {
    if (betTypeId == BETTYPEID.WIN) {
        return fromWinOdds(selection, winOdds);
    } else if (betTypeId == BETTYPEID.QUINELLA) {
        var selections = selection.split('-');
        return fromQuinellaOdds(selections[0], selections[1], winOdds);
    } else if (betTypeId == BETTYPEID.TRIFECTA) {
        var selections = selection.split('-');
        return fromTrifectaOdds(selections[0], selections[1], selections[2], winOdds);
    } else {
        return null;
    }
}
function fromWinOdds(selection, winOdds) {
    const team = winOdds.find(team => team.teamId.toString() === selection);
    return team.teamName;
}
function fromQuinellaOdds(selection1, selection2, winOdds) {
    const team1 = winOdds.find(team => team.teamId.toString() === selection1);
    const team2 = winOdds.find(team => team.teamId.toString() === selection2);
    return `${team1.teamName}-${team2.teamName}`;
}
function fromTrifectaOdds(selection1, selection2, selection3, winOdds) {
    const team1 = winOdds.find(team => team.teamId.toString() === selection1);
    const team2 = winOdds.find(team => team.teamId.toString() === selection2);
    const team3 = winOdds.find(team => team.teamId.toString() === selection3);
    return `${team1.teamName}-${team2.teamName}-${team3.teamName}`;
}

function timestampToDate(timestamp) {
    return timestamp.substring(4, 6) + "." + timestamp.substring(6, 8);
}

function oddsValue(odds) {
    if (odds <= 1.0) {
        return 1.0;
    }

    return odds;
}