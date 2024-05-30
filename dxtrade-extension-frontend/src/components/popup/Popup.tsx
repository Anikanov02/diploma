import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CustomPlot from '../plot/CustomPlot';
import { render } from 'react-dom';
import LoginPanel from './LoginPanel';
import './popupStyles.css';
import MainPanel from './MainPanel';
import { getHostname, isBroker } from '../../helpers/urlExtractionHelper';
import { Broker, getForHostname } from '../../dto/internal/Broker';

const Popup = () => {
  const [isSiteMatched, setIsSiteMatched] = useState(false);
  const [page, setPage] = useState<'login' | 'main'>('main');
  // const [broker, setBroker] = useState<Broker>();
  const [broker, setBroker] = useState<string>();

  useEffect(() => {
    // Check if the current site matches the desired site
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];
      console.log(currentTab.url)
      const hostname = await getHostname();
      // setBroker(getForHostname(hostname))
      setBroker(hostname)
      //TODO replace with isBroker() 
      const isSiteBroker = await isBroker(currentTab.id)
      console.log('IS BROKER=' + isSiteBroker)
      if (isSiteBroker) {
        setIsSiteMatched(true);
      } else {
        setIsSiteMatched(false);
      }
    });
  }, []);

  return (
    <div className='popup'>
      {page && broker && <>
        {isSiteMatched && page === 'login' && <LoginPanel broker={broker} toMainPage={() => { setPage('main') }} onLogin={() => { }} onFail={() => { }} />}
        {(!isSiteMatched || page === 'main') && <MainPanel disabled={!isSiteMatched} toLoginPage={() => { setPage('login') }} />}
      </>}
    </div>
  );
};

export default Popup;