package com.admin.microservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class AdminDashboardMicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AdminDashboardMicroserviceApplication.class, args);
	}

}
















