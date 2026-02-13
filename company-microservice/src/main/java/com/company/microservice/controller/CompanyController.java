package com.company.microservice.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.company.microservice.service.CompanyService;
import com.company.microservice.entity.Company;


@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private CompanyService companyService;
    
    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

	@GetMapping("/search")
	public 	ResponseEntity<List<Company>> searchCompany(@RequestParam String keyword)
	{
		return ResponseEntity.ok((companyService.searchCompany(keyword)));
	}

    @GetMapping()
	public ResponseEntity<List<Company>> findAll()
	{
		return ResponseEntity.ok((companyService.getAllCompanies()));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Company> getCompanyById(@PathVariable Long id)
	{
       Company company = companyService.findCompanyById(id);
	   if(company!=null)
	   return new ResponseEntity<>(company,HttpStatus.OK);
	   return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}

	@PostMapping
	public ResponseEntity<Company> createCompany(@RequestBody Company company, @RequestParam Long userId)
	{
		Company createdCompany = companyService.createCompany(company, userId);
		return new ResponseEntity<>(createdCompany, HttpStatus.CREATED);
	}

	@PutMapping("/{id}")
	public ResponseEntity<String> updateCompany(@PathVariable Long id, @RequestBody Company updatedCompany)
	{
		boolean isUpdated = companyService.updateCompanyById(id, updatedCompany);
		if(isUpdated)
			return new ResponseEntity<>("Company updated successfully", HttpStatus.OK);
		return new ResponseEntity<>("Company not found", HttpStatus.NOT_FOUND);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteCompany(@PathVariable Long id)
	{
		boolean isDeleted = companyService.deleteCompanyById(id);
		if(isDeleted)
			return new ResponseEntity<>("Company deleted successfully", HttpStatus.OK);
		return new ResponseEntity<>("Company not found", HttpStatus.NOT_FOUND);
	}

}

