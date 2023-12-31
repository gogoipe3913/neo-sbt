import { web3Modal, ethereumClient, address, checkDefaultChainId, setDefaultChainIdAsync, createSignatureAsync } from './modules/web3modal.js';
import { getRaceInfoAsync, updateRaceInfo } from './services/race.js';
import { updateWinOddsListAsync, updateQuinellaOddsAsync, updateTrifectaOddsAsync } from './services/oddsUpdater.js'
import { postEntryAsync } from './services/entry.js'
import { getUserAsync, getMyBettedAsync, postEntryStatusAsync } from './services/user.js'
import { updateMessageAsync } from './services/messageUpdater.js'
import { updateMyBettedListAsync } from './services/myBettedUpdater.js'

const HTML_BTN_LOADING = `<div class="btnLoading w-full"></div>`;
const HTML_BTN_INIT = `ENTRY`;

const SIG_BASE_MESSAGE = "本人確認のため署名を作成します。\n署名データは有効期限内のみ有効です。\n\n有効期限 : ";
const SIG_EXPIRATION = 60 * 60000; // 60min

var raceInfo = {};
var winOdds = {};

/////////////////////////////////////////////////////////////////////////////////////////
// Onclick event
/////////////////////////////////////////////////////////////////////////////////////////
document.getElementById('double-1').addEventListener('change', await updateQuinellaOddsAsync);
document.getElementById('double-2').addEventListener('change', await updateQuinellaOddsAsync);
document.getElementById('triple-1').addEventListener('change', await updateTrifectaOddsAsync);
document.getElementById('triple-2').addEventListener('change', await updateTrifectaOddsAsync);
document.getElementById('triple-3').addEventListener('change', await updateTrifectaOddsAsync);
document.getElementById('Entry__buttonColumn__open').addEventListener('click', await openEntryDialogAsync);
document.getElementById('Entry__buttonColumn__submit').addEventListener('click', await submitEntryAsync);
document.getElementById('EntryStatus__buttonColumn__open').addEventListener('click', await openEntryStatusDialogAsync);
document.getElementById('EntryStatus__buttonColumn_submit').addEventListener('click', await submitEntryStatusDialogAsync);
document.getElementById('amount').addEventListener('input', function(event) {
    const value = event.target.value;
    const maxLength = 9;
    const numericPattern = /^\d{0,9}$/;

    if (!numericPattern.test(value) || value.length > maxLength) {
        event.target.value = value.slice(0, maxLength);
    }
});

/////////////////////////////////////////////////////////////////////////////////////////
// private function
/////////////////////////////////////////////////////////////////////////////////////////
async function connectWalletAsync() {
    if (isConnected()) {
        await updateFormAsync();
    } else {
        await web3Modal.openModal();
    }

    await setDefaultChainIdAsync();
    
    ethereumClient.watchAccount(async () => {
        await updateFormAsync();
    });
    ethereumClient.watchNetwork(async () => {
        if (!checkDefaultChainId()) {
            await setDefaultChainIdAsync();
        } else {
            await updateFormAsync();
        }
    });
}

async function updateFormAsync() {
    // レースを反映
    updateRaceInfo(raceInfo);

    // オッズを反映
    winOdds = await updateWinOddsListAsync();
    await updateQuinellaOddsAsync();
    await updateTrifectaOddsAsync();
}

async function openEntryDialogAsync() {
    if (!isConnected()) {
        await connectWalletAsync();
    }

    await updateSignatureAsync();

    openEntryDialog();
}

async function submitEntryAsync() {
    const elementId = 'Entry__buttonColumn__submit';
    if (isLoading(elementId)) { return; }
    startLoading(elementId);

    const [enteredAmount, betType, selection] = getBettingInfo();

    try {
        const data = {
            Bet: {
              RaceId: raceInfo.raceID,
              BetTypeId: betType,
              Selection: selection,
              Amount: enteredAmount
            },
            Signature: {
              MessageValue: localStorage.getItem('message'),
              Signature: localStorage.getItem('signature'),
              WalletAddress: address(),
              Expiration: localStorage.getItem('expiration')
            }
          };
        console.log("data:", data);
        await postEntryAsync(data);
    } finally {
        await updateUserInfoAsync();
        await updateFormAsync();
        endLoading(elementId);
    }

    closeEntryDialog();
}
function getBettingInfo() {
    const textarea = document.getElementById('amount');
    const enteredAmount = Number(textarea.value);

    let singleContent = document.getElementById("contentSingle");
    let doubleContent = document.getElementById("contentDouble");
    let tripleContent = document.getElementById("contentTriple");
    let betType = "123";
    let selection = "";
    if (singleContent.style.display == "block") {
        betType = "1";
        let elements = document.getElementsByName("single");
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].checked) {
                selection = (i).toString();
            }
        }
    } else if (doubleContent.style.display == "block") {
        betType = "22";
        const value1 = document.getElementById('double-1').value;
        const value2 = document.getElementById('double-2').value;
        selection = value1 + "-" + value2;
    } else if (tripleContent.style.display == "block") {
        betType = "123";
        const value1 = document.getElementById('triple-1').value;
        const value2 = document.getElementById('triple-2').value;
        const value3 = document.getElementById('triple-3').value;
        selection = value1 + "-" + value2 + "-" + value3;
    }

    return [enteredAmount, betType, selection];
}

async function updateSignatureAsync() {
    if (isSignatureValid()) {
        console.log("署名の有効期限内");
        return;
    }
    
    const sixtyMinutesLater = new Date(Date.now() + SIG_EXPIRATION).toISOString();
    const messageWithExpiration = createMessageWithExpiration(sixtyMinutesLater);
    const signature = await createSignatureAsync(messageWithExpiration);

    updateLocalStorage(signature, messageWithExpiration, sixtyMinutesLater);
}
function isSignatureValid() {
    const storedAccount = localStorage.getItem('account');
    const storedExpiration = localStorage.getItem('expiration');
    const now = new Date();
    return ((storedExpiration && new Date(storedExpiration) > now) && (storedAccount == address()));
}
function createMessageWithExpiration(sixtyMinutesLater) {
    return SIG_BASE_MESSAGE + sixtyMinutesLater;
}
function updateLocalStorage(signature, messageWithExpiration, sixtyMinutesLater) {
    localStorage.setItem('signature', signature);
    localStorage.setItem('message', messageWithExpiration);
    localStorage.setItem('account', address());
    localStorage.setItem('expiration', sixtyMinutesLater);
}

async function updateUserInfoAsync(isUpdateBetted = true) {
    if (isUpdateBetted) {
        if (!isConnected()) { return; }
        var myBetted = await getMyBettedAsync(address());
        updateMyBettedListAsync(myBetted, winOdds);
    }

    if (!isSignatureValid()) { return; }
    const data = {
        MessageValue: localStorage.getItem('message'),
        Signature: localStorage.getItem('signature'),
        WalletAddress: address(),
        Expiration: localStorage.getItem('expiration')
    };
    var user = await getUserAsync(data);
    if (user == null) { 
        document.getElementById("EntryStatus__userInfoValue__contact").innerText = "－";
        document.getElementById("EntryStatus__userInfoValue__address").innerText = "－";
    } else {
        document.getElementById("EntryStatus__userInfoValue__contact").innerText = user.contactInfo;
        document.getElementById("EntryStatus__userInfoValue__address").innerText = user.transferAddress;
    }
}

async function openEntryStatusDialogAsync() {
    if (!isConnected()) {
        await connectWalletAsync();
    }

    await updateSignatureAsync();
    if (!isSignatureValid()) { return; }
    const data = {
        MessageValue: localStorage.getItem('message'),
        Signature: localStorage.getItem('signature'),
        WalletAddress: address(),
        Expiration: localStorage.getItem('expiration')
    };

    var user = await getUserAsync(data);
    if (user == null) {
        document.getElementById("EntryStatus__userInfoValue__contact").innerText = "－";
        document.getElementById("EntryStatus__userInfoValue__address").innerText = "－";
        document.getElementById("mail").value = "";
        document.getElementById("account").value = address();
    } else {
        document.getElementById("EntryStatus__userInfoValue__contact").innerText = user.contactInfo;
        document.getElementById("EntryStatus__userInfoValue__address").innerText = user.transferAddress;
        document.getElementById("mail").value = user.contactInfo;
        document.getElementById("account").value = user.transferAddress;
    }

    openUserInfoDialog();
}

async function submitEntryStatusDialogAsync() {
    const elementId = 'EntryStatus__buttonColumn_submit';
    if (isLoading(elementId)) { return; }
    startLoading(elementId);

    const mail = document.getElementById("mail").value;
    const account = document.getElementById("account").value;

    try {
        const data = {
            User: {
                UserAddress: address(),
                ContactInfo: mail,
                TransferAddress: account,
            },
            Signature: {
                MessageValue: localStorage.getItem('message'),
                Signature: localStorage.getItem('signature'),
                WalletAddress: address(),
                Expiration: localStorage.getItem('expiration')
            }
          };
        // console.log("data:", data);
        await postEntryStatusAsync(data);
    } finally {
        await updateUserInfoAsync(false);
        endLoading(elementId);
    }

    closeUserInfoDialog();
}

/////////////////////////////////////////////////////////////////////////////////////////
// Util function
/////////////////////////////////////////////////////////////////////////////////////////
function startLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = HTML_BTN_LOADING;
}
function endLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = HTML_BTN_INIT;
}
function isLoading(elementId) {
    const element = document.getElementById(elementId);
    return element.innerHTML === HTML_BTN_LOADING;
}
function isConnected() {
    return address() !== undefined
}

/////////////////////////////////////////////////////////////////////////////////////////
// Onload
/////////////////////////////////////////////////////////////////////////////////////////
window.onload = async function() {
    // 開催中のレース情報を取得
    const raceInfoTemp = await getRaceInfoAsync(API_BASEURL + "race/raceinfo");
    raceInfo = raceInfoTemp.race;
    console.log("raceInfo :", raceInfo);
    
    // 初期表示
    document.getElementById("contentSingle").style.display = "block";
    await updateFormAsync();
    await updateMessageAsync();
    await updateUserInfoAsync();
}