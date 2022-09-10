console.log("hello background");

const timer = ms => new Promise(res => setTimeout(res, ms))

async function load () { // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < 3; i++) {
    console.log(i);
    await timer(3000); // then the created Promise can be awaited
  }
}

load();


import { ChromeRuntimeMessage } from './types/base';

//(async () => {
// Contents : Receiving events
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    // Issue Token
    if (request.type == ChromeRuntimeMessage.ISSUE_AUTH_TOKEN){
      console.log(request)
      sendAuthTokenToContent(request, sender, sendResponse)
      return true;
    }

    // Revoke Token
    if (request.type == ChromeRuntimeMessage.REVOKE_AUTH_TOKEN){
      chrome.identity.removeCachedAuthToken({token: request.token}, () => {});
      chrome.identity.clearAllCachedAuthTokens(() => {});
      const url = `https://accounts.google.com/o/oauth2/revoke?token=${request.token}`
      fetch(url).then((response) => {});
      return true;
    }

    sendResponse();
    return
  }
);
async function sendAuthTokenToContent(request, sender, sendResponse) {
  chrome.identity.getAuthToken(
    {interactive: request.interactive},
    (token: string|undefined) => {
      sendResponse({token: token});  
    }
  )
}
//})();