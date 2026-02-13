package com.company.microservice.service.impl;

import java.util.List;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.company.microservice.external.ReviewClient;
import com.company.microservice.dto.ReviewMessage;
import com.company.microservice.entity.Company;
import com.company.microservice.repository.CompanyRepository;
import com.company.microservice.service.CompanyService;

import jakarta.ws.rs.NotFoundException;


@Service
public class CompanyServiceImpl implements CompanyService {

    private CompanyRepository companyRepository;
    private ReviewClient reviewClient;

    public CompanyServiceImpl(CompanyRepository companyRepository, ReviewClient reviewClient ) {
        this.companyRepository = companyRepository;
        this.reviewClient = reviewClient;
    }

    @Override
    public List<Company> getAllCompanies() {
       return companyRepository.findAll();
    }

    @Override
    public boolean updateCompanyById(Long id, Company updatedCompany) {
        Optional<Company> companyOptional = companyRepository.findById(id);
        {
            if(companyOptional.isPresent())
            {
                Company company = companyOptional.get();
                if(updatedCompany.getName()!=null)
                {
                    company.setName(updatedCompany.getName());
                }
                if(updatedCompany.getDescription()!=null)
                {
                    company.setDescription(updatedCompany.getDescription());
                }
                if(updatedCompany.getCompanyLogo()!=null)
                {
                    company.setCompanyLogo(updatedCompany.getCompanyLogo());
                }
                if(updatedCompany.getOwnerId()!=null)
                {
                    company.setOwnerId(updatedCompany.getOwnerId());
                }
                companyRepository.save(company);
                return true;
            }  
        }
       return false;
    }

    @Override
    public Company createCompany(Company company,Long userId) {
       company.setOwnerId(userId);
       companyRepository.save(company);
       return company;
    }

    @Override
    public boolean deleteCompanyById(Long id) {
        if(companyRepository.existsById(id))
        {
           companyRepository.deleteById(id);
           return true;
        }
        else
        {
            return false;
        }
    }

    @Override
    public Company findCompanyById(Long id) {
        return companyRepository.findById(id).orElse(null);
    }

    @Override
    public List<Company> searchCompany(String keyword) {
       return companyRepository.findBySearchQuery(keyword);
    }

    @Override
    public Company getCompanyByUserId(Long Userid) {
        Company company = companyRepository.findByOwnerId(Userid);
        return company;
    }

    @Override
    public Boolean updateHiringStatus(Long id) {
        Company company = companyRepository.findById(id).orElse(null);
        if(company!=null)
        {
            company.setHiring(!company.isHiring());
            companyRepository.save(company);
            return true;
        }
        return false;
    }

    @Override
    public void updateCompanyRating(ReviewMessage reviewMessage) {
        Company company = companyRepository
        .findById(reviewMessage.getCompanyId()).orElseThrow(() -> new NotFoundException("Company not found "+reviewMessage.getCompanyId()+" !!"));
        Double averageRating = reviewClient.getAverageRating(reviewMessage.getCompanyId());
        company.setRating(averageRating);
        companyRepository.save(company);
    }

}

