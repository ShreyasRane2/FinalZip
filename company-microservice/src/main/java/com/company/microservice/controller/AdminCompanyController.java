package com.company.microservice.controller;

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
@RequestMapping("/api/admin/companies")
public class AdminCompanyController {

    private CompanyService companyService;

    public AdminCompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }
    
    @PostMapping()
	public ResponseEntity<Company> createCompany(@RequestBody Company company, @RequestParam Long userId) throws Exception
	{
		Company createdCompany = companyService.createCompany(company,userId);
		return new ResponseEntity<>(createdCompany, HttpStatus.CREATED);
	}
    
    @PutMapping("/{id}")
    public ResponseEntity<String> updateCompanyById(@PathVariable Long id , @RequestBody Company updatedCompany)
	{
		boolean updated = companyService.updateCompanyById(id,updatedCompany);
		if(updated)
		return new ResponseEntity<>("Company updated successfully",HttpStatus.OK);
		return new ResponseEntity<>("Company not found!",HttpStatus.NOT_FOUND);
	}
    
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteCompanyById(@PathVariable Long id)
	{
		boolean deleted = companyService.deleteCompanyById(id);
		if(deleted)
		return new ResponseEntity<>("Company deleted successfully",HttpStatus.OK);
		return new ResponseEntity<>("Company not found!",HttpStatus.NOT_FOUND);
	}

    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateHiringStatus(@PathVariable Long id)
    {
        if(companyService.updateHiringStatus(id))
        {
            return new ResponseEntity<>("Hiring status updated successfully",HttpStatus.OK);
        }
        return new ResponseEntity<>("Company not found!",HttpStatus.NOT_FOUND);
    }

    @GetMapping("/user")
    public ResponseEntity<Company> getCompanyByUserId(@RequestParam Long userId)
	{
       if(userId!=null)
       {
       Company company = companyService.getCompanyByUserId(userId);
	   return new ResponseEntity<>(company,HttpStatus.OK);
       }
	   return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}

}

