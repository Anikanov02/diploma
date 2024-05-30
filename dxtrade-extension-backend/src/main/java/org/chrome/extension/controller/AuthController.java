package org.chrome.extension.controller;

import lombok.RequiredArgsConstructor;
import org.chrome.extension.service.LicenseValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final LicenseValidationService validationService;

    @PostMapping("signup")
    public ResponseEntity<?> signup() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("signin")
    public ResponseEntity<?> signin() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("license")
    public ResponseEntity<?> license(@RequestParam String accountCode) {
        final boolean valid = validationService.validateLicense(accountCode, false);
        final HttpStatus status = valid ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
        return new ResponseEntity<>(status);
    }
}
