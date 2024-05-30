package org.chrome.extension.controller;

import lombok.RequiredArgsConstructor;
import org.chrome.extension.dto.request.ModifyOrderRequest;
import org.chrome.extension.dto.request.PlaceOrderRequest;
import org.chrome.extension.dxtrade.dto.response.DxtradePlaceOrderResponse;
import org.chrome.extension.dxtrade.dto.response.PlaceOrdersGroupResponse;
import org.chrome.extension.service.LicenseValidationService;
import org.chrome.extension.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import static org.chrome.extension.config.GlobalConstants.LICENSE_EXPIRED_MESSAGE;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrdersController {
    private final OrderService orderService;
    private final LicenseValidationService validationService;

    @PostMapping
    public ResponseEntity<?> placeNewOrder(@RequestBody PlaceOrderRequest request) {
        try {
            if (!validationService.validateLicense(request.getAccountCode(), true)) {
                return new ResponseEntity<>(LICENSE_EXPIRED_MESSAGE, HttpStatus.UNAUTHORIZED);
            }
            final PlaceOrdersGroupResponse response = orderService.placeOrder(request);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getOrdersList() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<?> updateOrder(@RequestBody ModifyOrderRequest request) {
        try {
            if (!validationService.validateLicense(request.getAccountCode(), true)) {
                return new ResponseEntity<>(LICENSE_EXPIRED_MESSAGE, HttpStatus.UNAUTHORIZED);
            }
            final DxtradePlaceOrderResponse response = orderService.modifyOrder(request);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
