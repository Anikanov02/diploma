import React, { useEffect, useRef, useState } from "react";
import { Position, PositionManagerProps, SinglePositionManagerProps } from "./positionManager.interfaces";
import BreakEven from "./BreakEven";
import PartialTakeProfit from "./PartialTakeProfit";
import { breakEven, listPositions, partialTakeProfit } from "../../api/internal/user.api";
import { BusinessEventsCallback, BusinessEventsWsApi } from "../../api/dxtrade/businessEventsWebsocket.api";
import { getFlooredToStep } from "../../helpers/calculatorHelper";
import { Instrument } from "../../dto/dxtrade/response/InstrumentResponse";
import { PartialTakeProfit as PTP } from "../../dto/internal/request/PartialTakeProfitRequest";
import { getInstrumentDetails, getInstruments } from "../../api/dxtrade/reference.api";
import { Broker } from "../../dto/internal/Broker";

const PositionManager: React.FC<PositionManagerProps> = () => {
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const account = useRef<string>();
  const token = useRef<string>();
  const broker = useRef<string>();
  const marketInstrumentMap = useRef<{ [key: string]: Instrument }>({});
  const [controlsDisabled, setControlsDisabled] = useState<boolean>(false);

  const businessEventsCallback: BusinessEventsCallback = {
    onOpen: () => {
      // if (businessEventsProvider && account) {
      //     businessEventsProvider.subscribePortfolios(account)
      // } 
    },
    onAccountMetrics: (data) => {
    },
    onConversionRates: (data) => {
    },
    onAccountPostfoliosMessage: (data) => {
    },
    onPositions: (data: any) => {
      console.log('UPDATING POSITIONS')
      setControlsDisabled(false);
      populateInstruments(data);
    }
  }

  const handleSelection = (event: CustomEvent) => {
    const { selected, positionId } = event.detail;
    setSelectedPositions(selectedPositions => {
      if (selected && !selectedPositions.includes(positionId)) {
        return [...selectedPositions, positionId].filter(id => !!id);
      } else if (!selected) {
        return selectedPositions.filter(id => !!id && id !== positionId);
      } else {
        return selectedPositions.filter(id => !!id);
      }
    });
  };

  useEffect(() => {
    chrome.storage.local.get(null, function (data) {
      if (data && data.sessionToken && data.account && data.broker) {
        account.current = data.account;
        token.current = data.sessionToken;
        broker.current = data.broker;
      }
    });

    window.addEventListener('positionSelection', handleSelection as EventListener);
    const ws = new BusinessEventsWsApi(businessEventsCallback);

    chrome.storage.onChanged.addListener(function (changes, areaName) {
      console.log(JSON.stringify(changes))
      if (areaName === 'local') {
        if ('sessionToken' in changes) {
          const currentSessionToken = changes['sessionToken'].newValue;
          const oldSessionToken = changes['sessionToken'].oldValue;
          if (currentSessionToken !== oldSessionToken) {
            token.current = currentSessionToken;
          }
        }
        if ('account' in changes) {
          const currentAccount = changes['account'].newValue;
          const oldAccount = changes['account'].oldValue;
          if (currentAccount != oldAccount) {
            account.current = currentAccount;
          }
        }
        if ('broker' in changes) {
          const currentBroker = changes['broker'].newValue;
          const oldBroker = changes['broker'].oldValue;
          if (currentBroker !== oldBroker) {
            broker.current = currentBroker;
          }
        }
      }
    });

    return () => {
      window.removeEventListener('positionSelection', handleSelection as EventListener);
      ws.cleanup();
    };
  }, []);

  const populateInstruments = async (positions: { position: Position }[]) => {
    console.log('POPULATING POSITIONS')
    if (token.current && account.current && positions) {
      const missingInstruments = positions.filter(pos => !marketInstrumentMap.current[pos.position.symbol]).map(pos => pos.position.symbol);
      const promises = missingInstruments.map(async symbol => {
        const accountInstrumentDetails = await getInstrumentDetails(account.current!, token.current!, symbol);
        const response = await getInstruments(token.current!, symbol);
        const accountInstrument = accountInstrumentDetails?.instrumentDetails?.at(0);
        const instrument = response?.instruments?.at(0);
        if (instrument && accountInstrument) {
          marketInstrumentMap.current[symbol] = { ...instrument, ...accountInstrument };
          return { ...instrument, ...accountInstrument };
        } else {
          return undefined
        }
      });
      await Promise.all(promises);
    }
  }

  const handleBreakEven = () => {
    if (account.current && token.current && broker.current) {
      setControlsDisabled(true);
      breakEven(broker.current, token.current, account.current, selectedPositions)
    }
  };

  const handlePartialTakeProfit = async (positionIds: string[], percentage: number) => {
    if (token.current && account.current && broker.current) {
      console.log('positions to take profit: ' + selectedPositions)
      const positionDetails = await listPositions(broker.current, token.current, account.current) as { position: Position }[];

      const takeProfits = (await Promise.all(positionIds.map(async positionId => {
        const position = positionDetails.find(pos => pos.position.positionCode === positionId);
        if (!position) {
          return;
        }
        let instrument = marketInstrumentMap.current[position.position.symbol];
        if (!instrument) {
          await populateInstruments([position]);
          instrument = marketInstrumentMap.current[position.position.symbol];
        }
        let quantityToClose = position.position.quantity * percentage / 100;
        let orderSize = getFlooredToStep(quantityToClose, instrument.minOrderSizeIncrement * instrument.lotSize);

        if (percentage === 100) {
          orderSize = position.position.quantity;
        }

        if (orderSize > 0) {
          setControlsDisabled(true);
          return { positionId: position.position.positionCode, amount: orderSize }
        } else {
          console.log(position.position.positionCode, ' TP order size is 0')
          return undefined;
        }
      }))).filter(pos => !!pos);

      partialTakeProfit(broker.current, token.current, account.current, takeProfits as PTP[])
    }
  };

  return (
    <>
      {selectedPositions.filter(id => !!id).length > 0 && (
        <div className="customManager">
          <BreakEven
            disabled={controlsDisabled || !(token.current && account.current && broker.current)}
            type="button"
            onAction={handleBreakEven}
          />
          <PartialTakeProfit
            disabled={controlsDisabled}
            handlePartialTP={(percentage: number) => handlePartialTakeProfit(selectedPositions.filter(id => !!id), percentage)}
          />
        </div>
      )}
    </>
  );
};

export default PositionManager;