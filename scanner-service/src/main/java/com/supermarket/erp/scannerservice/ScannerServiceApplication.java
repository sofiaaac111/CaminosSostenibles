package com.supermarket.erp.scannerservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ScannerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScannerServiceApplication.class, args);
    }
}