export type PlaceOrderResponse = {
    orderResponse: DxtradePlaceOrderResponse;
}

export type DxtradePlaceOrderResponse = {
    orderId: number;
    updateOrderId: number;
}