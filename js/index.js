import { web3Modal, ethereumClient, address, checkDefaultChainId, setDefaultChainIdAsync, createSignatureAsync } from './modules/web3modal.js';
import { getRaceInfoAsync } from './services/raceInfo.js';
import { getWinOddsAsync, getQuinellaOddsAsync, getTrifectaOddsAsync } from './services/oddsCalculator.js';
import { updateWinOddsList, updateQuinellaOdds, updateTrifectaOdds } from './services/oddsUpdater.js'
import { postEntryAsync } from './services/entry.js'
import { getUserAsync } from './services/user.js'

const HTML_BTN_LOADING = `<div class="btnLoading w-full"></div>`;
const HTML_BTN_INIT = `ENTRY`;

const SIG_BASE_MESSAGE = "署名テスト\n\n有効期限 : ";
const SIG_EXPIRATION = 60 * 60000; // 60min

var raceInfo = {};
var winOdds = {};
var quinellaOdds = {};
var trifectaOdds = {};

/////////////////////////////////////////////////////////////////////////////////////////
// Onclick event
/////////////////////////////////////////////////////////////////////////////////////////
document.getElementById('double-1').addEventListener('change', await updateQuinellaDisplayAsync);
document.getElementById('double-2').addEventListener('change', await updateQuinellaDisplayAsync);
document.getElementById('Entry__buttonColumn__submit').addEventListener('click', await submitEntryAsync);
document.getElementById('Entry__buttonColumn__open').addEventListener('click', await openEntryAsync);
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
    // オッズを反映
    updateWinOddsList(winOdds);
    updateQuinellaOdds(winOdds, quinellaOdds);
    updateTrifectaOdds(winOdds, trifectaOdds);
}

async function updateQuinellaDisplayAsync() {
    const value1 = document.getElementById('double-1').value;
    const value2 = document.getElementById('double-2').value;
    quinellaOdds = await getQuinellaOddsAsync(value1, value2);

    updateQuinellaOdds(winOdds, quinellaOdds);
}

async function openEntryAsync() {
    if (!isConnected()) {
        await connectWalletAsync();
    }

    await updateSignatureAsync();
    
    const storedSignature = localStorage.getItem('signature');
    const storedMessage = localStorage.getItem('message');
    const storedAccount = localStorage.getItem('account');
    const storedExpiration = localStorage.getItem('expiration');
    const data = {
            MessageValue: storedMessage,
            Signature: storedSignature,
            WalletAddress: storedAccount,
            Expiration: storedExpiration
        };
    var user = await getUserAsync(data);
    document.getElementById("EntryStatus__userInfoValue__contact").innerText = user.contactInfo;
    document.getElementById("EntryStatus__userInfoValue__address").innerText = user.transferAddress;

    openEntryDialog();
}

async function submitEntryAsync() {
    

    const submitButton = document.getElementById('Entry__buttonColumn__submit');

    submitButton.innerHTML = HTML_BTN_LOADING;

    const textarea = document.getElementById('amount');
    const enteredAmount = Number(textarea.value);

    let singleContent = document.getElementById("contentSingle");
    let doubleContent = document.getElementById("contentDouble");
    let betType = "123";
    let selection = "";
    if (singleContent.style.display == "block") {
        betType = "1"
        let elements = document.getElementsByName("single");
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].checked) {
                selection = (i + 1).toString();
            }
        }
    } else if (doubleContent.style.display == "block") {
        betType = "22"
        const value1 = document.getElementById('double-1').value;
        const value2 = document.getElementById('double-2').value;
        selection = value1 + "-" + value2;
    }

    try {
        const storedSignature = localStorage.getItem('signature');
        const storedMessage = localStorage.getItem('message');
        const storedAccount = localStorage.getItem('account');
        const storedExpiration = localStorage.getItem('expiration');

        const data = {
            Bet: {
              RaceId: raceInfo.raceID,
              BetTypeId: betType,
              Selection: selection,
              Amount: enteredAmount
            },
            Signature: {
              MessageValue: storedMessage,
              Signature: storedSignature,
              WalletAddress: storedAccount,
              Expiration: storedExpiration
            }
          };
        console.log("data:", data);
        const result = await postEntryAsync(data);
    } finally {
        submitButton.innerHTML = HTML_BTN_INIT;
    }
    
    closeEntryDialog();
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
    const storedExpiration = localStorage.getItem('expiration');
    const now = new Date();
    return storedExpiration && new Date(storedExpiration) > now;
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

/////////////////////////////////////////////////////////////////////////////////////////
// Util function
/////////////////////////////////////////////////////////////////////////////////////////
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

    // 初期表示であるオッズを取得
    winOdds = await getWinOddsAsync();
    quinellaOdds = await getQuinellaOddsAsync(1, 1);
    // trifectaOdds = await getTrifectaOddsAsync(1, 1, 1);
    
    // 初期表示
    document.getElementById("contentSingle").style.display = "block";
    await updateFormAsync();
}