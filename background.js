const targetEndpoint = "Util/Homepage/Submissions";
const encoding = "utf-8";
const host = "*://gamebanana.com/*";

let gamesList = ",".repeat(4).split(",");
let gamesListStr = gamesList.join("");

browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({
        gamesList: gamesList
    });
});

browser.storage.local.get((data) => {
    if (data.gamesList) {
        gamesListStr = (data.gamesList).join("").toLowerCase();
    }
});

browser.storage.onChanged.addListener((changes) => {
    if (changes.gamesList) {
        gamesListStr = (changes.gamesList.newValue).join("").toLowerCase();
    }
});

function filterSubmissions(arr) {
    let result = new Array();

    for (let item of arr) {
        try {
            let gameName = item["_aGame"]["_sName"].toLowerCase();

            if (gamesListStr.indexOf(gameName) > -1) {
                continue;
            }

            result.push(item);
        } catch {
            result.push(item);
        }
    }

    return result;
}

function setResponse(requestDetails) {
    if (gamesListStr.length == 0) {
        return;
    }

    if ((requestDetails.url).indexOf(targetEndpoint) > -1) {
        let filter = browser.webRequest.filterResponseData(requestDetails.requestId);

        let decoder = new TextDecoder(encoding);
        let encoder = new TextEncoder();

        let responseBody = "";

        filter.ondata = (event) => {
            let dataChunk = decoder.decode(event.data, {stream: true});
            responseBody += dataChunk;
        }

        filter.onstop = (event) => {
            let submissions = JSON.parse(responseBody);
            let submissionsMod = JSON.stringify(filterSubmissions(submissions));
            filter.write(encoder.encode(submissionsMod));
            filter.disconnect();
        }
    }
}

browser.webRequest.onBeforeRequest.addListener(
    setResponse,
    {
        urls: [host],
        types: ["xmlhttprequest"]
    },
    [
        "blocking"
    ]
);