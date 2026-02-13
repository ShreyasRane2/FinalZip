package com.company.microservice.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "REVIEW-SERVICE", url = "http://localhost:8083")
public interface ReviewClient {

    @GetMapping("/api/reviews/average-rating?companyId={companyId}")
    double getAverageRating(@PathVariable Long companyId);
}
