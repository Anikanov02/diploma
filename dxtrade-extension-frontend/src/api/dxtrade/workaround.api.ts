import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { WORKAROUND_CHARTS_URL } from "./apiConstants";

function toAggregationPeriod(timeframe?: string) {
    if (!timeframe) {
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
        if (timeframe === timeFormats[i].label) {
            return timeFormats[i].seconds;
        }
    }

    return timeFormats[0].seconds;
}

export const sendChartSubscription = async (symbol: string, timeframe: string,) => {
    const request = {
        chartIds: [],
        requests: [
            {
                aggregationPeriodSeconds: toAggregationPeriod(timeframe),
                extendedSession: true,
                forexPriceField: "bid",
                id: Math.floor(Math.random() * 1000000),
                maxBarsCount: 3500,
                range: 31104000,
                studySubscription: [],
                subtopic: 'risk_calculator_' + uuidv4(),
                symbol: symbol
            }
        ]
    }

    try {
        console.log('sending charts updates')
        await axios.put(await WORKAROUND_CHARTS_URL(), request);
    } catch (error) {
        console.error('Error sending chart subscription:', error);
    }
}

export const unsubscribeChart = async (subtopic: string) => {
    const request = {
        chartIds: [subtopic],
        requests: []
    }
    try {
        console.log('sending charts updates')
        await axios.put(await WORKAROUND_CHARTS_URL(), request);
    } catch (error) {
        console.error('Error sending chart subscription:', error);
    }
}