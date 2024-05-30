import React from 'react';
import ReactDOM from 'react-dom';
import "./content.css";
import SinglePartialTakeProfit from './components/positionManager/SinglePartialTakeProfit';
import SingleBreakEven from './components/positionManager/SingleBreakEven';
import PositionManager from './components/positionManager/PositionManager';
import SelectionCheckbox from './components/positionManager/SelectionCheckbox';
import { PlotAndControls } from './components/plot/PlotAndControls';
import CustomHeader from './components/positionManager/CustomHeader';
import { getHostname, isBroker } from './helpers/urlExtractionHelper';
import { Broker, getForHostname } from './dto/internal/Broker';
import { loginUser, ping } from './api/dxtrade/auth.api';
import { validateLicense } from './api/internal/auth.api';
import { getUsers } from './api/dxtrade/account.api';
import { BusinessEventsWsApi } from './api/dxtrade/businessEventsWebsocket.api';

const ws = new BusinessEventsWsApi();
const mutationCallback: MutationCallback = async function (mutationsList: MutationRecord[], observer: MutationObserver) {
    // const accountNumber = (await chrome.storage.local.get(['account']))?.account?.split(':')[1];
    // const currentAccountNumber = getAccountNumber();
    // if (!currentAccountNumber || accountNumber && (accountNumber !== currentAccountNumber)) {
    //     console.log('accounts does not match')
    //     console.log(accountNumber + ' ' + currentAccountNumber)
    //     return;
    // }

    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const widgetHeader = document.querySelector('.widgetNew__headerContent.WidgetPositions__headerContent');
            if (widgetHeader) {
                const existingPositionManager = document.getElementById('customPositionManager');
                if (!existingPositionManager) {
                    const positionManagerContainer = document.createElement('div');
                    positionManagerContainer.id = 'customPositionManager';

                    ReactDOM.render(<PositionManager />, positionManagerContainer);
                    widgetHeader.insertBefore(positionManagerContainer, widgetHeader.firstChild);
                }
            }

            const headingElement = document.querySelector('.grid.grid-positions .grid--head');
            const customHeadingTable = document.getElementById('custom_heading_table');
            if (!customHeadingTable) {
                const table = document.createElement('table');
                table.id = 'custom_heading_table'
                table.classList.add('table')
                if (headingElement) {
                    const asHtml = headingElement as HTMLElement;
                    asHtml.style.display = 'flex';
                    asHtml.style.flexDirection = 'row';
                    headingElement.insertBefore(table, headingElement.firstChild);
                }
            }
            const headingTable = document.getElementById('custom_heading_table');
            const customTableHead = document.getElementById('custom_thead');
            if (!customTableHead) {
                const thead = document.createElement('thead');
                thead.id = 'custom_thead'
                // thead.classList.add('table--head')
                if (headingTable) {
                    headingTable.insertBefore(thead, headingTable.firstChild);
                }
            }
            const thead = document.getElementById('custom_thead');
            const customTableBody = document.getElementById('custom_table_body');
            if (!customTableBody) {
                const body = document.createElement('tr');
                body.id = 'custom_table_body'
                body.classList.add('position', 'position-heading')
                if (thead) {
                    thead.insertBefore(body, thead.firstChild);
                }
            }
            const tableBody = document.getElementById('custom_table_body');

            const colgroupElement = document.getElementById('header_colgroup');
            if (!colgroupElement) {
                const colgroup = document.createElement('colgroup');
                colgroup.id = 'header_colgroup';
                if (headingTable) {
                    headingTable.insertBefore(colgroup, headingTable.firstChild);
                }
            }
            const colgroup = document.getElementById('header_colgroup');

            if (colgroup && tableBody) {
                const elementData = [
                    { id: 'close_position', text: 'Close Position', type: 'text', width: '330px' },
                    { id: 'break_even', text: 'Break Even', type: 'text', width: '60px' },
                    { id: 'select_position', text: 'All', type: 'checkbox', width: '50px' }
                ];
                elementData.forEach(data => {
                    const existingElement = document.getElementById(data.id);

                    if (!existingElement) {
                        // Create a <col> element for each <th> element
                        const colElement = document.createElement('col');
                        // if (data.id === 'close_position') {
                        //     // colElement.classList.add('table--colAdapts');
                        // }
                        if (data.width) {
                            colElement.style.width = data.width;
                        }
                        colgroup.insertBefore(colElement, colgroup.firstChild);

                        const header = document.createElement('th');
                        // header.style.overflowX = 'hidden';
                        header.setAttribute('data-col-id', data.id);
                        ReactDOM.render(<CustomHeader {...data} />, header);

                        tableBody.insertBefore(header, tableBody.firstChild);
                        // if (container.firstChild) {
                        // container.insertBefore(header, container.firstChild);
                        // } else {
                        //     container.appendChild(header);
                        // }


                        // Define event handlers for dragging
                        let startX = 0;
                        let startWidth = 0;
                        let positionsColElement: any = null;

                        const handleMouseDown = (event: any) => {
                            startX = event.clientX;
                            startWidth = colElement.offsetWidth;
                            positionsColElement = document.getElementById(data.id + '_col');

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                        };

                        const handleMouseMove = (event: any) => {
                            const newWidth = startWidth + (event.clientX - startX);
                            colElement.style.width = `${newWidth}px`;
                            if (positionsColElement) {
                                positionsColElement.style.width = `${newWidth}px`;
                            }
                        };

                        const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                        };

                        // Get the resize handle element
                        const resizeHandle = header.querySelector('.table--resizeHandle');

                        if (resizeHandle) {
                            // Attach event listeners to the resize handle
                            resizeHandle.addEventListener('mousedown', handleMouseDown);
                        }
                    }
                });
            }

            const positions = document.querySelectorAll('.table--row.position');
            const customPositionsTable = document.getElementById('custom_position_table');
            if (!customPositionsTable) {
                const positionsContainer = document.querySelector('.grid.grid-positions .scrollable--content');
                const table = document.createElement('table');
                table.id = 'custom_position_table'
                table.classList.add('table')
                if (positionsContainer) {
                    const asHtml = positionsContainer as HTMLElement;
                    asHtml.style.display = 'flex';
                    asHtml.style.flexDirection = 'row';
                    positionsContainer.insertBefore(table, positionsContainer.firstChild);
                    const tableAsHtml = table as HTMLElement;
                    // tableAsHtml.style.tableLayout = 'auto';
                }
            }
            const positionTable = document.getElementById('custom_position_table');
            const customPositionTbody = document.getElementById('custom_tbody');
            if (!customPositionTbody) {
                const tbody = document.createElement('tbody');
                tbody.id = 'custom_tbody'
                tbody.classList.add('table--body')
                if (positionTable) {
                    positionTable.insertBefore(tbody, positionTable.firstChild);
                }
            }
            const tbody = document.getElementById('custom_tbody');
            // const customPositionTableBody = document.getElementById('custom_position_table_body');
            // if (!customPositionTableBody) {
            //     const body = document.createElement('tr');
            //     body.id = 'custom_position_table_body'
            //     body.classList.add('table--row', 'position')
            //     if (tbody) {
            //         tbody.insertBefore(body, tbody.firstChild);
            //     }
            // }
            // const positionTableBody = document.getElementById('custom_position_table_body');
            const positionsColgroup = document.getElementById('positions_colgroup');
            if (!positionsColgroup) {
                const colgroup = document.createElement('colgroup');
                colgroup.id = 'positions_colgroup';
                if (positionTable) {
                    positionTable.insertBefore(colgroup, positionTable.firstChild);
                }
            }
            const posColgroup = document.getElementById('positions_colgroup');
            if (posColgroup && tbody) {
                const closePosCol = document.getElementById('close_position_col');
                if (!closePosCol) {
                    const colElement = document.createElement('col');
                    // colElement.classList.add('table--colAdapts');
                    colElement.id = 'close_position_col';
                    colElement.style.width = '330px';
                    posColgroup.insertBefore(colElement, posColgroup.firstChild);
                }
                const breakEvenCol = document.getElementById('break_even_col');
                if (!breakEvenCol) {
                    const colElement = document.createElement('col');
                    // colElement.classList.add('table--colAdapts');
                    colElement.id = 'break_even_col';
                    colElement.style.width = '60px';
                    posColgroup.insertBefore(colElement, posColgroup.firstChild);
                }
                const selectPosCol = document.getElementById('select_position_col');
                if (!selectPosCol) {
                    const colElement = document.createElement('col');
                    // colElement.classList.add('table--colAdapts');
                    colElement.id = 'select_position_col';
                    colElement.style.width = '50px';
                    posColgroup.insertBefore(colElement, posColgroup.firstChild);
                }
                positions.forEach((position, index) => {
                    const positionIdSpan = position.querySelector('.position--id');
                    const positionId = positionIdSpan?.textContent;
                    if (positionId) {
                        let positionManagerContainer = document.getElementById('position_manager_container_' + positionId);
                        if (positionManagerContainer) {
                            const positionManagerContainerOrder = Array.from(tbody.children).indexOf(positionManagerContainer);
                            if (index !== positionManagerContainerOrder) {
                                tbody.removeChild(positionManagerContainer);//TODO causes error with position manager
                            }
                        }
                        positionManagerContainer = document.getElementById('position_manager_container_' + positionId);
                        if (!positionManagerContainer) {
                            const container = document.createElement('tr');
                            container.id = 'position_manager_container_' + positionId;
                            if (container) {
                                // const asHtml = container as HTMLElement;
                                // asHtml.style.display = 'flex';
                                // asHtml.style.flexDirection = 'row';
                                tbody.appendChild(container);
                            }
                        }
                        const container = document.getElementById('position_manager_container_' + positionId);
                        if (container) {
                            const existingClosePositionManager = document.getElementById('customClosePositionManager_' + positionId);
                            if (!existingClosePositionManager) {
                                const positionManagerContainer = document.createElement('td');
                                positionManagerContainer.id = 'customClosePositionManager_' + positionId;
                                positionManagerContainer.style.overflowX = 'hidden';
                                positionManagerContainer.setAttribute('data-col-id', 'close_position');

                                ReactDOM.render(<SinglePartialTakeProfit ws={ws} positionId={positionId} />, positionManagerContainer);
                                container.insertBefore(positionManagerContainer, container.firstChild);
                            }

                            const existingBreakEvenPositionManager = document.getElementById('customBreakEvenPositionManager_' + positionId);
                            if (!existingBreakEvenPositionManager) {
                                const positionManagerContainer = document.createElement('td');
                                positionManagerContainer.id = 'customBreakEvenPositionManager_' + positionId;
                                positionManagerContainer.style.overflowX = 'hidden';
                                positionManagerContainer.setAttribute('data-col-id', 'break_even');

                                ReactDOM.render(<SingleBreakEven ws={ws} positionId={positionId} />, positionManagerContainer);
                                container.insertBefore(positionManagerContainer, container.firstChild);
                            }

                            const existingSelectPosition = document.getElementById('customSelectPosition_' + positionId);
                            if (!existingSelectPosition) {
                                const selectPositionContainer = document.createElement('td');
                                selectPositionContainer.id = 'customSelectPosition_' + positionId;
                                selectPositionContainer.style.overflowX = 'hidden';
                                selectPositionContainer.setAttribute('data-col-id', 'select_position');

                                ReactDOM.render(<SelectionCheckbox ws={ws} positionId={positionId} />, selectPositionContainer);
                                container.insertBefore(selectPositionContainer, container.firstChild);
                            }
                        }
                    }
                });

                // Extract position IDs from position elements
                const positionIds = Array.from(positions)
                    .map(position => position.querySelector('.position--id')?.textContent)
                    .filter(Boolean);

                // Select and filter container elements
                document.querySelectorAll('[id^="position_manager_container_"]').forEach(container => {
                    if (!positionIds.includes(container.id.replace('position_manager_container_', ''))) {
                        container.remove();
                    }
                });
            }
        }
    }
};

const keepAliveSession = (sessionToken: string) => {
    setInterval(async () => {
        console.log("refreshing token")
        const token = await ping(sessionToken);
        if (token) {
            chrome.storage.local.get(null, function (data) {
                var newData = Object.assign({}, data, { sessionToken: token });

                chrome.storage.local.set({ ...data, sessionToken: token }, function () {
                    console.log('Stored name: ' + token);
                });
            });
        } else {
            console.error('could not refresh token')
        }
    }, 5 * 60 * 1000);
}

const checkLicenseTask = (account: string) => {
    setInterval(async () => {
        console.log("validating license")
        // const licenseValid = await validateLicense(account);
        const licenseValid = await validateLicense(account);
        chrome.storage.local.get(null, function (data) {
            var newData = Object.assign({}, data, { licenseValid: licenseValid });

            chrome.storage.local.set({ ...data, licenseValid: licenseValid }, function () {
                console.log('Stored licenseValid: ' + licenseValid);
            });
        });
    }, 10 * 1000);
}

function getAccountNumber() {
    const account = document.querySelector('div[data-test-id="account_selector"] > div')
    if (account && account.lastChild) {
        const textContent = account.lastChild.textContent;
        if (textContent) {
            const accountNumber = textContent.match(/\d+/); // Extract digits using a regular expression
            if (accountNumber) {
                return accountNumber[0];
            }
        }
    }
    return undefined;
}

async function login(login: string, password: string, broker: string): Promise<boolean> {
    console.log("logging in")
    const token = await loginUser({ username: login, password: password, domain: "default" })
    const accountNumber = getAccountNumber();
    if (token && accountNumber) {
        const usersResponse = await getUsers(token);
        // const account = usersResponse.userDetails[0]?.accounts[2]?.account;//TODO handle
        const account = usersResponse.userDetails[0]?.accounts?.map((acc: any) => acc.account)
            .find((acc: any) => {
                // Extract the number part from the account string
                const [, number] = acc.split(':');
                // Compare the extracted number with accountNumber
                return number.match(/\d+/)[0] === accountNumber;
            });
        const licenseValid = await validateLicense(account);
        const currency = usersResponse.userDetails[0]?.accounts[0]?.baseCurrency;//TODO handle?
        chrome.storage.local.get(null, function (data) {
            var newData = Object.assign({}, data, { licenseValid: licenseValid });

            chrome.storage.local.set({ ...data, broker: broker, sessionToken: token, account: account, currency: currency, licenseValid: licenseValid }, () => {
                console.log('Stored: ' + JSON.stringify({ sessionToken: token, account: account, currency: currency, licenseValid: licenseValid }));
            });
        });
        // chrome.runtime.sendMessage({ messageType: "keepAlive", token: token, account: account });
        // const event = new CustomEvent("keepAlive", { detail: { token: token, account: account } });
        // window.dispatchEvent(event);
        keepAliveSession(token);
        checkLicenseTask(account);
        return true;
    } else {
        console.log('unable to login')
        return false;
    }
}

// Add listener to receive messages from background script
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message.type === "login") {
        const resp = await login(message.login, message.password, message.broker);
        chrome.runtime.sendMessage({ type: 'loginResult', response: resp });
    } else if (message.type === "debugger_action") {
        alert('Risk Calculator will start debugging your browser in order to work properly with current broker, please do not close debugger while on brokers page');
    }
});

// window.addEventListener("keepAlive", function (event) {
//     const detail = (event as CustomEvent).detail;

//     keepAliveSession(detail.token);
//     checkLicenseTask(detail.account);
// });

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
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

async function getBrokerAndDispatchEvent() {
    const broker = await getHostname();
    // const broker = getForHostname(hostname);
    const isHostBroker = await isBroker();
    // chrome.runtime.sendMessage({ brokerData: broker });
    console.log("Broker received: " + broker + ' ' + isHostBroker);
    chrome.storage.local.get(null, async function (data) {
        console.log(broker)
        if (broker && isHostBroker) {
            const credentials = data.credentials?.[broker]
            if (credentials && credentials.username && credentials.password) {
                console.log('auto login')
                login(credentials.username, credentials.password, broker)
            } else {
                console.log('no credentials, have to login manually')
                if (data.sessionToken && !await ping(data.sessionToken)) {
                    chrome.storage.local.remove(['broker', 'sessionToken', 'account', 'currency', 'licenseValid'])
                } else if (data.sessionToken && data.account) {
                    keepAliveSession(data.sessionToken);
                    checkLicenseTask(data.account);
                }
            }
        }
    });
}

function prepare() {
    if (document.readyState == "complete") {
        const elements = document.getElementsByClassName('chartArea chartArea-main');
        if (elements.length > 0 && getAccountNumber()) {
            getBrokerAndDispatchEvent();
            // for (let i = 0; i < elements.length; i++) {
                const div = document.createElement('div');
                div.id = 'customPlotContainer';
                div.style.display = "none";
                div.style.width = "100%";
                div.style.height = "100%";
                elements[0].appendChild(div);

                ReactDOM.render(
                    <PlotAndControls
                        element={elements[0]}
                        onToggleWidget={(open) => {
                            for (let j = 0; j < elements[0].children.length; j++) {
                                const child = elements[0].children[j] as HTMLElement;
                                child.style.display = open ? 'none' : 'block';
                                if (child.id === 'customPlotContainer') {
                                    child.style.display = open ? 'block' : 'none';
                                }
                                if (child.className === 'customPlotControls') {
                                    child.style.display = 'block'
                                }
                            }
                        }}
                    />,
                    div)
            // }
        } else {
            setTimeout(prepare, 100);
        }
    }
}

document.onreadystatechange = function () {
    console.log('READY')
    prepare();
}

const observerConfig: MutationObserverInit = { childList: true, subtree: true };
const observer: MutationObserver = new MutationObserver(mutationCallback);
observer.observe(document.body, observerConfig);