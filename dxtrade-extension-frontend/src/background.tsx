import { getUsers } from "./api/dxtrade/account.api";
import { loginUser, ping } from "./api/dxtrade/auth.api";
import { validateLicense } from "./api/internal/auth.api";
import { Broker, getForHostname } from "./dto/internal/Broker";
import { getHostname, isBroker } from "./helpers/urlExtractionHelper";

const keepAlive = () => setInterval(() => {
  const info = chrome.runtime.getPlatformInfo()
  console.log('keep alive', info)
}, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "login") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'login', login: message.login, password: message.password, broker: message.broker });
      }
    });
  }
});

// export const keepAliveSession = (sessionToken: string) => {
//     setInterval(async () => {
//         console.log("refreshing token")
//         const token = await ping(sessionToken);
//         if (token) {
//             chrome.storage.local.get(null, function (data) {
//                 var newData = Object.assign({}, data, { sessionToken: token });

//                 chrome.storage.local.set({ ...data, sessionToken: token }, function () {
//                     console.log('Stored name: ' + token);
//                 });
//             });
//         } else {
//             console.error('could not refresh token')
//         }
//     }, 5 * 60 * 1000);
// }

// export const checkLicenseTask = (account: string) => {
//     setInterval(async () => {
//         console.log("validating license")
//         // const licenseValid = await validateLicense(account);
//         const licenseValid = await validateLicense(account);
//         chrome.storage.local.get(null, function (data) {
//             var newData = Object.assign({}, data, { licenseValid: licenseValid });

//             chrome.storage.local.set({ ...data, licenseValid: licenseValid }, function () {
//                 console.log('Stored licenseValid: ' + licenseValid);
//             });
//         });
//     }, 10 * 1000);
// }

// export async function login(login: string, password: string, broker: Broker): Promise<boolean> {
//     console.log("logging in")
//     const token = await loginUser({ username: login, password: password, domain: "default" })
//     if (token) {
//         const usersResponse = await getUsers(token);
//         const account = usersResponse.userDetails[0]?.accounts[2]?.account;//TODO handle
//         const licenseValid = await validateLicense(account);
//         const currency = usersResponse.userDetails[0]?.accounts[0]?.baseCurrency;
//         chrome.storage.local.get(null, function (data) {
//             var newData = Object.assign({}, data, { licenseValid: licenseValid });

//             chrome.storage.local.set({ ...data, broker: broker, sessionToken: token, account: account, currency: currency, licenseValid: licenseValid }, () => {
//                 console.log('Stored: ' + JSON.stringify({ sessionToken: token, account: account, currency: currency, licenseValid: licenseValid }));
//             });
//         });
//         chrome.runtime.sendMessage({ messageType: "keepAlive", token: token, account: account });
//         return true;
//     } else {
//         chrome.storage.local.clear();
//         return false;
//     }
// }

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     if (message.brokerData) {
//         const broker = message.brokerData;
//         console.log("Broker received:", broker);
//         chrome.storage.local.get(null, function (data) {
//             console.log(broker)
//             if (broker) {
//                 const credentials = data.credentials?.[broker]
//                 if (credentials) {
//                     console.log('auto login')
//                     login(credentials.username, credentials.password, broker)
//                 } else {
//                     console.log('no credentials, have to login manually')
//                 }
//             }
//         });
//     } else if (message.messageType === "keepAlive") {
//         console.log('keepalive triggered ' + message.token + ' ' + message.account)
//         keepAliveSession(message.token);
//         checkLicenseTask(message.account);
//     }
// });
export type Config = {
  aggregationPeriodSeconds: number,
  symbol: string,
  subtopic: string
}

console.log('backgrounnd');
let debuggerAttached: any = {};

let seenTypesReceived: any = {};
let seenTypesSent: any = {};
let chartConfigs: Config[] = [];
let chartsFullData: any[] = [];
let shouldReload = true;

function toTimeframe(aggregationTimeSec?: number) {
  if (!aggregationTimeSec) {
    return undefined;
  }
  const timeFormats = [
    { label: 'm', seconds: 60 },
    { label: '5m', seconds: 300 },
    { label: '15m', seconds: 900 },
    { label: '30m', seconds: 1800 },
    { label: 'h', seconds: 3600 },
    { label: '4h', seconds: 14400 },
    { label: 'd', seconds: 86400 },
    { label: 'w', seconds: 604800 },
    { label: 'mo', seconds: 2592000 }
  ];

  for (let i = timeFormats.length - 1; i >= 0; i--) {
    if (aggregationTimeSec >= timeFormats[i].seconds) {
      return timeFormats[i].label;
    }
  }

  return timeFormats[0].label;
}

function areConfigsEqual(config1: Config, config2: Config) {
  return config1.aggregationPeriodSeconds === config2.aggregationPeriodSeconds &&
    config1.symbol === config2.symbol &&
    config1.subtopic === config2.subtopic;
}

function mergeData(newObject: any) {
  const existingObject = chartsFullData.find(obj => areConfigsEqual(obj.config, newObject.config));

  if (existingObject) {
    newObject.data.forEach((newData: any) => {
      existingObject.data = existingObject.data.filter((existingData: any) =>
        existingData.timestamp !== newData.timestamp && existingData.time !== newData.time
      );
      existingObject.data.push(newData);
    });
  } else {
    chartsFullData.push(newObject);
  }
}

const onUpdatedListener = async (tabId: any, changeInfo: any, tab: any) => {
  if (changeInfo.status === 'loading') {
    // if (tab.url && new URL(tab.url).hostname.endsWith('blackbull.com')) {//TODO, unlimited hostnames handling
    if (tab.id && await isBroker(tab.id)) {
      console.log('Detected tab loading', tabId, changeInfo);
      if (!debuggerAttached[tabId]) {
        chrome.debugger.attach({ tabId }, '1.0', () => {
          if (chrome.runtime.lastError) {
            // Debugger is likely already attached
            console.log('Debugger likely already attached:',
              chrome.runtime.lastError.message);
          } else {
            console.log(`Debugger attached to tabId:${tabId}`);
            chrome.debugger.sendCommand({ tabId }, 'Network.enable');

            // We only want to attach the event listener once
            // when the first debugger is attached
            if (Object.keys(debuggerAttached).length === 0) {
              console.log(`Attaching debugger event listener`);
              chrome.debugger.onEvent.addListener((debuggeeId: any, message: any, params: any) =>
                handleDebuggerEvent(tabId, debuggeeId, message, params));
            }
            // Signal that the debugger is attached
            debuggerAttached[tabId] = tabId;
          }
        });
      } else {
        console.log(`Debugger already attached to tabId:${tabId}`);
      }


    }
  }
}

//TODO store cache and if cache for chart is persistent, then DO NOT reload a page, 
//clear when configs are updated and when snapsot is refetched, send full data in response
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "workaround_start") {
    console.log("got request to use workaround approach, start sending updates");
    chrome.tabs.onUpdated.addListener(onUpdatedListener);
    // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // if (!tab || !tab.id) {
    //   console.log("tab cannot be determined")
    //   return;
    // };
    // if (shouldReload) {
    //   chrome.tabs.reload(tab.id);
    //   shouldReload = false;
    // }
    // sendResponse(chartsFullData);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (shouldReload) {
        if (!tabs || tabs.length === 0) {
          console.log("tab cannot be determined");
          return;
        }

        let tab = tabs[0];
        if (!tab.id) {
          console.log("tab cannot be determined");
          return;
        }

        shouldReload = false;
        chrome.tabs.sendMessage(tab.id, { type: "debugger_action" })
        chrome.tabs.reload(tab.id);
      } else {
        sendResponse({ configs: chartConfigs, data: chartsFullData }); // Call sendResponse directly if no reload needed
      }
    });
  }
  return true;
});

const clear = (tabId?: number) => {
  console.log('clearing cache')
  chartConfigs.length = 0;
  chartsFullData.length = 0;
  shouldReload = true;
  if (tabId) {
    debuggerAttached[tabId] = undefined;
  }
}

function detachDebuggerFromTab(tabId: any) {
  return new Promise<void>((resolve, reject) => {
    chrome.debugger.detach({ tabId: parseInt(tabId) }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        // reject(chrome.runtime.lastError);
      } else {
        console.log(`Debugger detached from tab ${tabId}`);
      }
      clear(parseInt(tabId));
      resolve();
    });
  });
}

// Listen for tab activation (when the user switches to another tab)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    if (tab.url) {
      const isHostBroker = await isBroker(activeInfo.tabId);
      const broker = await getHostname();

      chrome.storage.local.get(null, async function (data) {
        if (isHostBroker && data.broker !== broker) {
          console.log('Detected new broker, refreshing page');
          const detachPromises = Object.keys(debuggerAttached).map(tabId =>
            detachDebuggerFromTab(tabId)
          );
          await Promise.all(detachPromises);
          chrome.tabs.onUpdated.removeListener(onUpdatedListener);
          console.log('all debuggers detached, reloading page')
          debuggerAttached = {};
          chrome.tabs.reload(activeInfo.tabId);
        }
      });
    }
  });
});

chrome.debugger.onDetach.addListener((source, reason) => {
  clear(source.tabId)
  if (source.tabId) {
    chrome.tabs.sendMessage(source.tabId, { type: 'workaround_stopped' })
  }
});

// chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
//   if (message.type === "workaround_stop") {
//     console.log("workaround not needed, detaching, clearing cache");
//     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     if (!tab || !tab.id) {
//       console.log("tab cannot be determined")
//       return;
//     };

//   }
// });

// chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete' && tab.active) {
//     const isHostBroker = await isBroker(tabId);
//     const broker = await getHostname();

//     chrome.storage.local.get(null, function(data) {
//       if (isHostBroker && data.broker !== broker) {
//         console.log('Detected new broker, refreshing page');
//         chrome.tabs.reload(tabId);
//       }
//     });
//   }
// });


function handleDebuggerEvent(tabId: number, debuggeeId: any, message: any, params: any) {
  switch (message) {
    case 'Network.requestWillBeSent':
      // console.log('Network.requestWillBeSent', params);
      if (params.request.url.includes('api/charts')) {
        const data = JSON.parse(params.request.postData)
        console.log('Charts config:', data.requests);
        const { chartIds } = data;
        const requestSubtopics = data.requests.map((req: any) => req.subtopic);
        chartConfigs = chartConfigs.filter((config) => !chartIds.includes(config.subtopic) && !requestSubtopics.includes(config.subtopic));
        const chartConfigSubtopics = new Set(chartConfigs.map(config => config.subtopic));
        chartsFullData = chartsFullData.filter(entry => chartConfigSubtopics.has(entry.config.subtopic));
        chartConfigs.push(...data.requests.map((req: any) => {
          return { ...req, timeframe: toTimeframe(req?.aggregationPeriodSeconds) };
        }));
      }
      // traceRequest(debuggeeId, params);
      break;
    case 'Network.webSocketCreated':
      console.log('Network.webSocketCreated', params);
      // traceSocketCreate(debuggeeId, params);
      break;
    case 'Network.webSocketClosed':
      console.log('Network.webSocketClosed', params);
      // traceSocketClose(debuggeeId, params);
      break;
    case 'Network.webSocketFrameSent':
      console.log('Network.webSocketFrameSent', params);
      // traceSocketSend(debuggeeId, params);
      break;
    case 'Network.webSocketFrameReceived':
      // console.log('Network.webSocketFrameReceived', params);
      let payload: any;
      try {
        payload = JSON.parse(params.response.payloadData.split('|')[1]);
      } catch (error) {
        console.log('payload messed up ' + params.response.payloadData)
        break;
      }
      if (!seenTypesReceived[payload.type]) {
        seenTypesReceived[payload.type] = payload
        // console.log('Network.webSocketFrameReceived', seenTypesReceived);
      }
      if (payload.type === 'chartFeedSubtopic') {
        console.log('Chart data:', payload.body.data)
        console.log(payload.body.subtopic)
        console.log(chartConfigs)
        const config = chartConfigs.find(c => c.subtopic === payload.body.subtopic);
        if (config && payload.body.data) {
          const result = { config: config, data: payload.body.data }
          console.log("sending: " + JSON.stringify(result))
          console.log(tabId)
          mergeData(result);
          chrome.tabs.sendMessage(tabId, { type: "workaround_message", data: result })
        } else {
          console.log("some data is missing!!!!!" + config + ' ' + payload.body.data)
        }
      }
      // traceSocketReceive(debuggeeId, params);
      break;
    default:
  }
}
