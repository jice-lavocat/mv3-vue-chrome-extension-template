import { influxClient, influxOrg, influxBucket } from "./plugins/influxdb_config";
import { InfluxDB, FluxTableMetaData, Point, HttpError } from '@influxdata/influxdb-client-browser'

let writeClient = influxClient.getWriteApi(influxOrg, influxBucket, 'ns')

for (let i = 0; i < 5; i++) {
  let point = new Point('measurement1')
    .tag('tagname1', 'tagvalue1')
    .intField('field1', i)

  void setTimeout(() => {
    console.log("trying to write")
    writeClient.writePoint(point)
    console.log("write was done?")
  }, i * 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}

console.log("hello background");


const timer = ms => new Promise(res => setTimeout(res, ms))

function displayCPUInfo () {
  // Reference https://developer.chrome.com/docs/extensions/reference/system_cpu/
  // Callers can compute load fractions by making two calls, subtracting the times, and dividing by the difference in totalTime.
  // Interesting SO post https://stackoverflow.com/q/24473134/2550237

  chrome.system.cpu.getInfo(function(info){       
    console.log(JSON.stringify(info));   
  });

}


function initCpu() {
  chrome.system.cpu.getInfo(function(cpuInfo) {

    var cpuName = cpuInfo.modelName.replace(/\(R\)/g, '®').replace(/\(TM\)/, '™');
    console.log("CPU Name: ", cpuName);

    var cpuArch = cpuInfo.archName.replace(/_/g, '-');
    console.log("CPU Architecture: ", cpuArch);
  });
}

initCpu();
var previousCpuInfo = null;

function updateCpuUsage() {
  chrome.system.cpu.getInfo(function(cpuInfoReturned) {

    var width = 100;
    var load = []

    for (var i = 0; i < cpuInfoReturned.numOfProcessors; i++) {
        var usage = cpuInfoReturned.processors[i].usage;
        var usedSectionWidth = 0;
      if (previousCpuInfo != null) {
        var oldUsage = previousCpuInfo.processors[i].usage;
        usedSectionWidth = Math.floor((usage.kernel + usage.user - oldUsage.kernel - oldUsage.user) / (usage.total - oldUsage.total) * 100);
      } else {
        usedSectionWidth = Math.floor((usage.kernel + usage.user) / usage.total * 100);
      }
      // console.log("CPU %d load = %d", i, usedSectionWidth);
      load.push(usedSectionWidth);
    }
    previousCpuInfo = cpuInfoReturned;
    console.log("CPU load = ",load);
  });
}

async function load () { // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < 10; i++) {
    console.log(i);
    
    // displayCPUInfo();
    updateCpuUsage();
    
    await timer(3000); // then the created Promise can be awaited
  }
}

load();


import { CpuInfo } from 'os';
import { cpuUsage } from 'process';
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