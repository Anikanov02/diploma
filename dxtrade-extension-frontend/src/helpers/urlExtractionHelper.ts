export const getTabUrl = () => {
    return new Promise((resolve, reject) => {
        if (chrome && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0 && tabs[0].url) {
                    console.log('!!!!!' + tabs[0].url);
                    resolve(tabs[0].url);
                } else {
                    reject(new Error("Unable to retrieve tab URL"));
                }
            });
        } else {
            // If not in extension context, use window location
            resolve(window.location.href);
        }
    });
};
export const getHostname = async () => {
    return getTabUrl().then(currentUrl => {
        if (currentUrl) {
            const url = new URL(currentUrl as string);
            return url.hostname;
        } else {
            throw new Error("Unable to retrieve tab URL");
        }
    });
};

export const getBaseUrl = async () => {
    return getTabUrl().then(currentUrl => {
        if (currentUrl) {
            const url = new URL(currentUrl as string);
            return `${url.protocol}//${url.hostname}/dxsca-web`;
        } else {
            throw new Error("Unable to retrieve tab URL");
        }
    });
};

export const isBroker = async (tabId?: number) => {
    const executeScriptInTab = (tabId: number) => {
        return new Promise((resolve, reject) => {
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabId },
                    func: checkForPackage,
                },
                (results) => {
                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }
                    resolve(results[0].result);
                }
            );
        });
    };

    const checkForPackage = () => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        for (let script of scripts) {
            const scriptElement = script as HTMLScriptElement;
            if (scriptElement.src.includes('dxtrade5')) {
                return true;
            }
        }
        return false;
    };

    try {
        // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        // if (!tab || !tab.id) {
        //     console.log("tab cannot be determined")
        //     return false;
        // };
        let result;
        if (tabId) {
            result = await executeScriptInTab(tabId);
        } else {
            result = checkForPackage();
        }
        console.log("IS BROKER: " + result)
        return result;
    } catch (error) {
        console.error(error);
        return false;
    }
};