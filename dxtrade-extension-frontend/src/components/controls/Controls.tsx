import Switch from '@mui/material/Switch';
import React, { useEffect, useState } from 'react';
import { TimeIntervalSelect } from '../plot/TimeIntervalSelect';
import Draggable from 'react-draggable';
import { ToggleOption } from './ToggleOption';


type ControlsProps = {
    timeInterval: string | null
    availableIntervals: string[]
    useEquity: boolean
    followLivePrice: boolean
    onUseEquityChange: (useEquity: boolean) => void
    onFollowLivePriceChange: (followLivePrice: boolean) => void
    onToggleWidget: (open: boolean) => void
    onTimeIntervalChange: (interval: string) => void
}

export const Controls: React.FC<ControlsProps> = (props) => {
    const [switchToggled, setSwitchToggled] = React.useState<boolean>(false)

    useEffect(() => {
        chrome.storage.onChanged.addListener(function (changes, areaName) {
            console.log(JSON.stringify(changes))
            if (areaName === 'local') {
                if ('sessionToken' in changes) {
                    const currentSessionToken = changes['sessionToken'].newValue;
                    if (!currentSessionToken) {
                        onSwitchChange(false);
                    }
                }
                if ('account' in changes) {
                    const currentAccount = changes['account'].newValue;
                    if (!currentAccount) {
                        onSwitchChange(false);
                    }
                }
                if ('licenseValid' in changes) {
                    const licenseValid = changes['licenseValid'].newValue;
                    if (!licenseValid) {
                        onSwitchChange(false);
                        alert('Invalid licence - Please check your Risk Calculator dashboard.');
                    }
                }
            }
        });
    }, [])

    useEffect(() => {
        const input = document.querySelector('[data-test-id="chart_area_suggest"]');
        const onClickListener = () => onSwitchChange(false);
        if (input) {
          input.addEventListener('click', onClickListener)
        }

        return () => {
            if (input) {
                input.removeEventListener('click', onClickListener)
            }
        }
    }, [props.onToggleWidget])

    const onSwitchChange = (val: any) => {
        if (val) {
            chrome.storage.local.get(null, function (data) {
                if (data && data.sessionToken && data.account && data.licenseValid) {
                    props.onToggleWidget(val);
                    setSwitchToggled(val);
                } else if (!data || !data.sessionToken || !data.account) {
                    alert('Log into extension!');
                } else if (!data.licenseValid) {
                    alert('Invalid licence - Please check your Risk Calculator dashboard.');
                } else {
                    alert('Log into extension!');
                }
            });
            return;
        }
        props.onToggleWidget(val);
        setSwitchToggled(val);
    }

    const onIntervalChange = (interval: string) => {
        props.onTimeIntervalChange(interval)
    }

    return (
        <Draggable>
            <div style={{ 
                display: 'flex',
                gap: '5px',
                flexDirection: 'column',
                width: '150px',
                backgroundColor: '#1e2032',
                padding: '5px 10px',
                borderRadius: '8px',
                position: 'absolute',
                top: '75px',
                left: '-5px',
                zIndex: 100,
            }}>
                <div>
                    <Switch size="small" checked={switchToggled} onChange={(e: any) => onSwitchChange(e.target.checked)} /> Risk Calculator
                </div>
                {switchToggled && (
                <div>
                    <TimeIntervalSelect interval={props.timeInterval} availableIntervals={props.availableIntervals} onChange={onIntervalChange} />
                </div>)}
                {switchToggled && (
                <div>
                    <ToggleOption 
                        options={['Equity', 'Balance']} 
                        option={props.useEquity ? 'Equity' : 'Balance'} 
                        onSetOption={(option: string) => props.onUseEquityChange(option === 'Equity')} 
                    />
                </div>)}
                {switchToggled && (
                <div>
                    <ToggleOption 
                        options={['Follow live price']} 
                        option={props.followLivePrice ? 'Follow live price' : null} 
                        onSetOption={(option: string | null) => props.onFollowLivePriceChange(!!option)} 
                    />
                </div>)}
                {/* {switchToggled && (
                    <LoginPanel onLogin={() => {props.onToggleWidget(switchToggled)}} onFail={() => {}} />   
                )} */}
            </div>
        </Draggable>)
}