"use strict";
window.browser = window.browser || window.chrome;

import utils from "../../../assets/javascripts/utils.js";
import generalHelper from "../../../assets/javascripts/general.js";

import youtubeHelper from "../../../assets/javascripts/youtube/youtube.js";
import youtubeMusicHelper from "../../../assets/javascripts/youtubeMusic.js";
import twitterHelper from "../../../assets/javascripts/twitter.js";
import instagramHelper from "../../../assets/javascripts/instagram.js";
import redditHelper from "../../../assets/javascripts/reddit.js";
import searchHelper from "../../../assets/javascripts/search.js";
import translateHelper from "../../../assets/javascripts/translate/translate.js";
import mapsHelper from "../../../assets/javascripts/maps.js";
import wikipediaHelper from "../../../assets/javascripts/wikipedia.js";
import mediumHelper from "../../../assets/javascripts/medium.js";
import imgurHelper from "../../../assets/javascripts/imgur.js";
import tiktokHelper from "../../../assets/javascripts/tiktok.js";
import sendTargetsHelper from "../../../assets/javascripts/sendTargets.js";
import peertubeHelper from "../../../assets/javascripts/peertube.js";
import lbryHelper from "../../../assets/javascripts/lbry.js";

let updateInstancesElement = document.getElementById("update-instances");
updateInstancesElement.addEventListener("click", () => {
  let oldHtml = updateInstancesElement.innerHTML
  updateInstancesElement.innerHTML = '...';
  if (utils.updateInstances()) {
    updateInstancesElement.innerHTML = 'Done!';
    new Promise(resolve => setTimeout(resolve, 1500)).then( // sleep 1500ms
      () => updateInstancesElement.innerHTML = oldHtml
    )
  }
  else
    updateInstancesElement.innerHTML = 'Failed Miserabely';
});

let exportSettingsElement = document.getElementById("export-settings");

function exportSettings() {
  browser.storage.local.get(
    null,
    result => {
      let resultString = JSON.stringify(result, null, '  ');
      exportSettingsElement.href = 'data:application/json;base64,' + btoa(resultString);
      exportSettingsElement.download = 'libredirect-settings.json';
    }
  );
}
exportSettings();

browser.storage.onChanged.addListener(exportSettings);

let importSettingsElement = document.getElementById("import-settings");
let importSettingsElementText = document.getElementById('import_settings_text');
importSettingsElement.addEventListener("change",
  () => {
    let file = importSettingsElement.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async () => {
      const data = JSON.parse(reader.result)
      if (
        "theme" in data &&
        "disableImgur" in data &&
        "cloudflareList" in data &&
        "imgurRedirects" in data
      ) {
        await browser.storage.local.clear();
        await browser.storage.local.set({ ...data })
        location.reload();
      } else
        importError()
    }
    reader.onerror = error => importError();
  }
);
function importError() {
  const oldHTML = importSettingsElementText.innerHTML;
  importSettingsElementText.innerHTML = '<span style="color:red;">Error!</span>';
  setTimeout(() => importSettingsElementText.innerHTML = oldHTML, 1000);
}

document.getElementById("reset-settings").addEventListener("click",
  async () => {
    await browser.storage.local.clear();
    fetch('/instances/blocklist.json').then(response => response.text()).then(async data => {
      await browser.storage.local.set({ cloudflareList: JSON.parse(data) })
      await generalHelper.initDefaults();
      await youtubeHelper.initDefaults();
      await youtubeMusicHelper.initDefaults();
      await twitterHelper.initDefaults();
      await instagramHelper.initDefaults();
      await mapsHelper.initDefaults();
      await searchHelper.initDefaults();
      await translateHelper.initDefaults();
      await mediumHelper.initDefaults();
      await redditHelper.initDefaults();
      await wikipediaHelper.initDefaults();
      await imgurHelper.initDefaults();
      await tiktokHelper.initDefaults();
      await sendTargetsHelper.initDefaults();
      await peertubeHelper.initDefaults();
      await lbryHelper.initDefaults();
      location.reload();
    })
  }
);

let autoRedirectElement = document.getElementById("auto-redirect")
autoRedirectElement.addEventListener("change",
  event => browser.storage.local.set({ autoRedirect: event.target.checked })
);

let themeElement = document.getElementById("theme");
themeElement.addEventListener("change", event => {
  const value = event.target.options[theme.selectedIndex].value;
  browser.storage.local.set({ theme: value });
  location.reload();
})

let nameCustomInstanceInput = document.getElementById("exceptions-custom-instance");
let instanceTypeElement = document.getElementById("exceptions-custom-instance-type");
let instanceType = "url"

let popupFrontends;
for (const frontend of generalHelper.allPopupFrontends)
  document.getElementById(frontend).addEventListener("change",
    event => {
      if (event.target.checked && !popupFrontends.includes(frontend))
        popupFrontends.push(frontend)
      else if (popupFrontends.includes(frontend)) {
        var index = popupFrontends.indexOf(frontend);
        if (index !== -1) popupFrontends.splice(index, 1);
      }
      browser.storage.local.set({ popupFrontends })
    }
  )


browser.storage.local.get(
  [
    'theme',
    'autoRedirect',
    'exceptions'
  ],
  r => {
    autoRedirectElement.checked = r.autoRedirect;
    themeElement.value = r.theme;
    instanceTypeElement.addEventListener("change",
      event => {
        instanceType = event.target.options[instanceTypeElement.selectedIndex].value
        if (instanceType == 'url') {
          nameCustomInstanceInput.setAttribute("type", "url");
          nameCustomInstanceInput.setAttribute("placeholder", "https://www.google.com");
        }
        else if (instanceType == 'regex') {
          nameCustomInstanceInput.setAttribute("type", "text");
          nameCustomInstanceInput.setAttribute("placeholder", "https?:\/\/(www\.|)youtube\.com\/");
        }
      }
    )
    let exceptionsCustomInstances = r.exceptions;
    function calcExceptionsCustomInstances() {
      document.getElementById("exceptions-custom-checklist").innerHTML =
        [...exceptionsCustomInstances.url, ...exceptionsCustomInstances.regex].map(
          (x) => `<div>
                      ${x}
                      <button class="add" id="clear-${x}">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px"
                        fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                        </svg>
                      </button>
                    </div>
                    <hr>`
        ).join('\n');

      for (const x of [...exceptionsCustomInstances.url, ...exceptionsCustomInstances.regex]) {
        document.getElementById(`clear-${x}`).addEventListener("click",
          () => {
            console.log(x);
            let index;
            index = exceptionsCustomInstances.url.indexOf(x);
            if (index > -1)
              exceptionsCustomInstances.url.splice(index, 1);
            else {
              index = exceptionsCustomInstances.regex.indexOf(x);
              if (index > -1)
                exceptionsCustomInstances.regex.splice(index, 1);
            }
            browser.storage.local.set({ exceptions: exceptionsCustomInstances })
            calcExceptionsCustomInstances();
          });
      }
    }
    calcExceptionsCustomInstances();
    document.getElementById("custom-exceptions-instance-form").addEventListener("submit", (event) => {
      event.preventDefault();

      let val
      if (instanceType == 'url') {
        if (nameCustomInstanceInput.validity.valid) {
          let url = new URL(nameCustomInstanceInput.value);
          val = `${url.protocol}//${url.host}`
          if (!exceptionsCustomInstances.url.includes(val)) exceptionsCustomInstances.url.push(val)
        }
      } else if (instanceType == 'regex') {
        val = nameCustomInstanceInput.value
        if (val.trim() != '' && !exceptionsCustomInstances.regex.includes(val)) exceptionsCustomInstances.regex.push(val)
      }
      if (val) {
        browser.storage.local.set({ exceptions: exceptionsCustomInstances })
        nameCustomInstanceInput.value = '';
      }
      calcExceptionsCustomInstances();
    })

    browser.storage.local.get('popupFrontends',
      r => {
        popupFrontends = r.popupFrontends;
        for (const frontend of generalHelper.allPopupFrontends)
          document.getElementById(frontend).checked = popupFrontends.includes(frontend);
      }
    )
  })
