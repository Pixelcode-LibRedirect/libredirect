import utils from "../../../assets/javascripts/utils.js";

const enable = document.getElementById("twitter-enable");
const protocol = document.getElementById("twitter-protocol");
const twitter = document.getElementById('twitter_page');

function changeProtocolSettings() {
    let normalDiv = twitter.getElementsByClassName("normal")[0];
    let torDiv = twitter.getElementsByClassName("tor")[0];
    if (protocol.value == 'normal') {
        normalDiv.style.display = 'block';
        torDiv.style.display = 'none';
    }
    else if (protocol.value == 'tor') {
        normalDiv.style.display = 'none';
        torDiv.style.display = 'block';
    }
}

browser.storage.local.get(
    [
        "disableTwitter",
        "twitterProtocol",
    ],
    r => {
        enable.checked = !r.disableTwitter;
        protocol.value = r.twitterProtocol;
        changeProtocolSettings();
    }
)

twitter.addEventListener("change", () => {
    browser.storage.local.set({
        disableTwitter: !enable.checked,
        twitterProtocol: protocol.value,
    });
    changeProtocolSettings();
})

utils.processDefaultCustomInstances('twitter', 'nitter', 'normal', document);
utils.processDefaultCustomInstances('twitter', 'nitter', 'tor', document)

utils.latency('twitter', 'nitter', document, location, true)