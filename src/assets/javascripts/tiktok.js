window.browser = window.browser || window.chrome;

import utils from './utils.js'

const targets = [
    /^https?:\/{2}(www\.|)tiktok\.com.*/
];

let redirects = {
    "proxiTok": {
        "normal": [],
        "tor": []
    }
}
function setRedirects(val) {
    browser.storage.local.get('cloudflareList', r => {
        redirects.proxiTok = val;
        proxiTokNormalRedirectsChecks = [...redirects.proxiTok.normal];
        for (const instance of r.cloudflareList) {
            const a = proxiTokNormalRedirectsChecks.indexOf(instance);
            if (a > -1) proxiTokNormalRedirectsChecks.splice(a, 1);
        }
        browser.storage.local.set({
            tiktokRedirects: redirects,
            proxiTokNormalRedirectsChecks
        })
    })
}

function initProxiTokCookies(test, from) {
    return new Promise(async resolve => {
        await init();
        let protocolHost = utils.protocolHost(from);
        if (![
            ...proxiTokNormalRedirectsChecks,
            ...proxiTokNormalCustomRedirects,
            ...proxiTokTorRedirectsChecks,
            ...proxiTokTorCustomRedirects,
        ].includes(protocolHost)) resolve();

        if (!test) {
            let checkedInstances;
            if (tiktokProtocol == 'normal') checkedInstances = [...proxiTokNormalRedirectsChecks, ...proxiTokNormalCustomRedirects]
            else if (tiktokProtocol == 'tor') checkedInstances = [...proxiTokTorRedirectsChecks, ...proxiTokTorCustomRedirects]
            await utils.copyCookie('proxitok', from, checkedInstances, 'theme');
            await utils.copyCookie('proxitok', from, checkedInstances, 'api-legacy');
        }
        resolve(true);
    })
}

function setProxiTokCookies() {
    return new Promise(async resolve => {
        await init();
        if (disableTiktok || tiktokProtocol === undefined) { resolve(); return; }
        let checkedInstances;
        if (tiktokProtocol == 'normal') checkedInstances = [...proxiTokNormalRedirectsChecks, ...proxiTokNormalCustomRedirects]
        else if (tiktokProtocol == 'tor') checkedInstances = [...proxiTokTorRedirectsChecks, ...proxiTokTorCustomRedirects]
        for (const to of checkedInstances) {
            utils.getCookiesFromStorage('proxitok', to, 'theme');
            utils.getCookiesFromStorage('proxitok', to, 'api-legacy');
        }
        resolve();
    })
}

let
    disableTiktok,
    tiktokProtocol,
    tiktokRedirects,
    proxiTokNormalRedirectsChecks,
    proxiTokNormalCustomRedirects,
    proxiTokTorRedirectsChecks,
    proxiTokTorCustomRedirects;

function init() {
    return new Promise(async resolve => {
        browser.storage.local.get(
            [
                "disableTiktok",
                "tiktokProtocol",
                "tiktokRedirects",
                "proxiTokNormalRedirectsChecks",
                "proxiTokNormalCustomRedirects",
                "proxiTokTorRedirectsChecks",
                "proxiTokTorCustomRedirects",
            ],
            r => {
                disableTiktok = r.disableTiktok;
                tiktokProtocol = r.tiktokProtocol;
                tiktokRedirects = r.tiktokRedirects;
                proxiTokNormalRedirectsChecks = r.proxiTokNormalRedirectsChecks;
                proxiTokNormalCustomRedirects = r.proxiTokNormalCustomRedirects;
                proxiTokTorRedirectsChecks = r.proxiTokTorRedirectsChecks;
                proxiTokTorCustomRedirects = r.proxiTokTorCustomRedirects;
                resolve();
            }
        )
    })
}

init();
browser.storage.onChanged.addListener(init)

// https://www.tiktok.com/@keysikaspol/video/7061265241887345946
// https://www.tiktok.com/@keysikaspol
function redirect(url, type, initiator) {
    if (disableTiktok) return;
    if (type != "main_frame") return;
    const all = [
        ...tiktokRedirects.proxiTok.normal,
        ...proxiTokNormalCustomRedirects
    ];
    if (initiator && (all.includes(initiator.origin) || targets.includes(initiator.host))) return;
    if (!targets.some(rx => rx.test(url.href))) return;

    let instancesList;
    if (tiktokProtocol == 'normal') instancesList = [...proxiTokNormalRedirectsChecks, ...proxiTokNormalCustomRedirects];
    if (tiktokProtocol == 'tor') instancesList = [...proxiTokTorRedirectsChecks, ...proxiTokTorCustomRedirects];
    if (instancesList.length === 0) return;

    const randomInstance = utils.getRandomInstance(instancesList);
    return `${randomInstance}${url.pathname}`;
}

function reverse(url) {
    return new Promise(async resolve => {
        await init();
        let protocolHost = utils.protocolHost(url);
        const all = [
            ...tiktokRedirects.proxiTok.normal,
            ...tiktokRedirects.proxiTok.tor,
            ...proxiTokNormalCustomRedirects,
            ...proxiTokTorCustomRedirects
        ];
        if (!all.includes(protocolHost)) { resolve(); return; }

        resolve(`https://tiktok.com${url.pathname}${url.search}`);
    })
}

function initDefaults() {
    return new Promise(async resolve => {
        fetch('/instances/data.json').then(response => response.text()).then(async data => {
            let dataJson = JSON.parse(data);
            redirects.proxiTok = dataJson.proxiTok;
            await browser.storage.local.set({
                disableTiktok: false,
                tiktokProtocol: "normal",

                tiktokRedirects: redirects,

                proxiTokNormalRedirectsChecks: [...redirects.proxiTok.normal],
                proxiTokNormalCustomRedirects: [],

                proxiTokTorRedirectsChecks: [...redirects.proxiTok.tor],
                proxiTokTorCustomRedirects: [],
            });
            resolve();
        });
    })
}

export default {
    setRedirects,

    redirect,
    reverse,

    initProxiTokCookies,
    setProxiTokCookies,

    initDefaults
};
