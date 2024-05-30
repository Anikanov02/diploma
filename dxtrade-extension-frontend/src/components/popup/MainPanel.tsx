import { Button, FormLabel } from "@mui/material";
import React, { useState } from "react";
import './popupStyles.css';

type MainPanelProps = {
    disabled: boolean;
    toLoginPage: () => void;
}

const MainPanel: React.FC<MainPanelProps> = (props) => {
    const { disabled, toLoginPage } = props;

    const [isCustomPlotLoaded, setIsCustomPlotLoaded] = useState(false);

    const handleLoadCustomPlot = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const currentTab = tabs[0];
            if (currentTab) {
                const tabId = currentTab.id;
                if (tabId !== undefined) {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tabId },
                            func: () => {
                                const elements = document.getElementsByClassName('chartArea chartArea-main');
                                for (let i = 0; i < elements.length; i++) {
                                    const element = elements[i] as HTMLElement;
                                    for (let j = 0; j < element.children.length; j++) {
                                        const child = element.children[j] as HTMLElement;
                                        if (child.id === 'customPlotContainer') {
                                            child.style.display = '';
                                        } else {
                                            child.style.display = 'none';
                                        }
                                    }
                                }
                            }
                        }
                    );
                } else {
                    console.error('Tab ID is undefined.');
                }
            } else {
                console.error('No active tab found.');
            }
        });
        setIsCustomPlotLoaded(true);
    };

    const handleLoadOriginalPlot = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const currentTab = tabs[0];
            if (currentTab) {
                const tabId = currentTab.id;
                if (tabId !== undefined) {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tabId },
                            func: () => {
                                const elements = document.getElementsByClassName('chartArea chartArea-main');
                                for (let i = 0; i < elements.length; i++) {
                                    const element = elements[i] as HTMLElement;
                                    for (let j = 0; j < element.children.length; j++) {
                                        const child = element.children[j] as HTMLElement;
                                        child.style.display = '';
                                        if (child.id === 'customPlotContainer') {
                                            child.style.display = 'none';
                                        }
                                    }
                                }
                            }
                        }
                    );
                } else {
                    console.error('Tab ID is undefined.');
                }
            } else {
                console.error('No active tab found.');
            }
        });
        setIsCustomPlotLoaded(false);
    };

    const handleLoadClick = () => {
        if (isCustomPlotLoaded) {
            handleLoadOriginalPlot();
        } else {
            handleLoadCustomPlot();
        }
    };

    return (
        <div className="main">
            <FormLabel sx={{ fontSize: '20px', padding: '10px' }}>
                Risk Calculator
            </FormLabel>
            <Button
                disabled={disabled}
                sx={{
                    color: 'white',
                    fontSize: '11px',
                    border: '1px solid #1e1e31',
                    marginBottom: '15px',
                    backgroundColor: '#40425d',
                    padding: '5px',
                    minWidth: '150px',
                }}
                variant="contained"
                color="primary"
                onClick={handleLoadClick}>
                {isCustomPlotLoaded ? 'Load Original Plot' : 'Load Custom Plot'}
            </Button>
            <Button
                disabled={disabled}
                sx={{
                    color: 'white',
                    fontSize: '11px',
                    border: '1px solid #1e1e31',
                    marginBottom: '15px',
                    backgroundColor: '#40425d',
                    padding: '5px',
                    minWidth: '150px',
                }}
                onClick={toLoginPage}>
                Login
            </Button>
        </div>
    )
}

export default MainPanel;