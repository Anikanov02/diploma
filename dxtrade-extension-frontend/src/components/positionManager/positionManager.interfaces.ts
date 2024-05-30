import { BusinessEventsWsApi } from "../../api/dxtrade/businessEventsWebsocket.api";

export interface SinglePositionManagerProps {
    ws: BusinessEventsWsApi;
    positionId: string
}

export interface PositionManagerProps {
    
}

export interface BreakEvenProps {
    disabled?: boolean;
    checked?: boolean;
    onAction: (event?: any) => void;
    type: "button" | "checkbox"
}

export interface PartialTakeProfitProps {
    disabled: boolean,
    handlePartialTP: (percentage: number) => void;
}

export type Position = {
    account: string;
    version: number;
    positionCode: string;
    symbol: string;
    quantity: number;
    quantityNotional: number;
    side: 'BUY' | 'SELL';
    openTime: number;
    openPrice: number;
    lastUpdateTime: number;
}