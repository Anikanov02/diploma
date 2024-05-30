package org.chrome.extension.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.chrome.extension.config.GlobalConstants;
import org.chrome.extension.domain.LicenseValidationCache;
import org.chrome.extension.dto.request.PositionBreakEvenRequest;
import org.chrome.extension.dto.request.PositionPartialTakeProfitRequest;
import org.chrome.extension.dto.response.PositionsResponse;
import org.chrome.extension.dto.request.PositionsRequest;
import org.chrome.extension.service.LicenseValidationService;
import org.chrome.extension.service.PositionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.chrome.extension.config.GlobalConstants.LICENSE_EXPIRED_MESSAGE;

@RestController
@RequestMapping("/positions")
@RequiredArgsConstructor
public class PositionController {
    private final PositionService positionService;
    private final LicenseValidationService validationService;
    @GetMapping
    public ResponseEntity<?> getPositions(PositionsRequest request) {
        try {
            if (!validationService.validateLicense(request.getAccountCode(), true)) {
                return new ResponseEntity<>(LICENSE_EXPIRED_MESSAGE, HttpStatus.UNAUTHORIZED);
            }
            final List<PositionsResponse> positions = positionService.getPositions(request);
            return new ResponseEntity<>(positions, HttpStatus.OK);
        } catch(Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/break-even")
    public ResponseEntity<?> breakEven(@RequestBody PositionBreakEvenRequest request) {
        try {
            if (!validationService.validateLicense(request.getAccountCode(), true)) {
                return new ResponseEntity<>(LICENSE_EXPIRED_MESSAGE, HttpStatus.UNAUTHORIZED);
            }
            positionService.breakEven(request);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch(Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/partial-tp")
    public ResponseEntity<?> partialTakeProfit(@RequestBody PositionPartialTakeProfitRequest request) {
        try {
            if (!validationService.validateLicense(request.getAccountCode(), true)) {
                return new ResponseEntity<>(LICENSE_EXPIRED_MESSAGE, HttpStatus.UNAUTHORIZED);
            }
            positionService.partialTakeProfit(request);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch(Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
