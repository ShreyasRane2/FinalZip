package com.company.microservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.company.microservice.entity.Company;

public interface CompanyRepository extends JpaRepository<Company,Long> {

    @Query("SELECT c FROM Company c WHERE lower(c.name) LIKE lower(concat('%', :keyword, '%')) " +
    "OR lower(c.description) LIKE lower(concat('%', :keyword, '%'))")
    List<Company> findBySearchQuery(String keyword);

    Company findByOwnerId(Long userId);

}

