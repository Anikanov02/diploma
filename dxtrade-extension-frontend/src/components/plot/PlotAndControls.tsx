import React, { useEffect, useState } from "react"
import CustomPlot from "./CustomPlot"
import { Controls } from "../controls/Controls"
import ReactDOM from "react-dom"

type PlotAndControlsProps = {
  element: Element
  onToggleWidget: (open: boolean) => void
}

const AVAILABLE_INTERVALS: Record<string, string> = {
  '1m' : 'm',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h' : 'h',
  '4h': '4h',
  '1d' : 'd',
  '1w': 'w',
  '1mn' :'mo'
};

export const PlotAndControls: React.FC<PlotAndControlsProps> = (props) => {
  const { element, onToggleWidget } = props
  const [timeInterval, setTimeInterval] = useState<string | null>(null)
  const [symbol, setSymbol] = useState<string | null>(null)
  const [useEquity, setUseEquity] = useState<boolean>(false)
  const [followLivePrice, setFollowLivePrice] = useState<boolean>(true)

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getSymbol = () => {
        const input = document.querySelector('[data-test-id="chart_area_suggest"]');
        if (input) {
            const symbolValue = input.getAttribute('value');
            return symbolValue;
        } else {
            console.log('Symbol not found');
        }
    }
    const getTimeframe = () => {
        const button = document.querySelector('[data-test-id="chart_area_toolbar_aggregation_period"] button');
        if (button) {
            const value = button.getAttribute('value');
            return value;
        } else {
            console.log('Timeframe not found');
        }
    };

    const refrestProps = () => {
        const symbol = getSymbol();
        const timeframe = getTimeframe();
        if (symbol && timeframe) {
            console.log('updating plot props: ' + symbol + " " + timeframe)
            setSymbol(symbol);
            if (!timeInterval) {
              setTimeInterval(timeframe);
            }
        }
    }

    const options = {
        root: null, // observe from the viewport
        rootMargin: '0px', // no margin
        threshold: 0.5, // trigger when 50% of the container is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                refrestProps();
            }
        });
    }, options);

    // Start observing the container
    if (containerRef.current) {
        observer.observe(containerRef.current);
    }

    // Cleanup
    return () => {
        if (containerRef.current) {
            observer.unobserve(containerRef.current);
        }
    };
  }, []);

  return (
    <div ref={containerRef} style={{width: '100%', height: '100%'}} >
      <CustomPlot symbol={symbol} timeframe={timeInterval && AVAILABLE_INTERVALS[timeInterval]} useEquity={useEquity} followLivePrice={followLivePrice}/>
      {ReactDOM.createPortal(
        <div className="customPlotControls">
          <Controls 
            timeInterval={timeInterval}
            availableIntervals={Object.keys(AVAILABLE_INTERVALS)}
            followLivePrice={followLivePrice}
            onFollowLivePriceChange={setFollowLivePrice}
            onToggleWidget={onToggleWidget} 
            onTimeIntervalChange={setTimeInterval}
            useEquity={useEquity}
            onUseEquityChange={setUseEquity}
          />
        </div>,
        element)}
    </div>
  )
}