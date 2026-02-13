package com.admin.microservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;

import com.admin.microservice.external.User;

import java.util.List;

@FeignClient(name = "USER-SERVICE")
public interface UserClient {

    @GetMapping("api/users/profile/{id}")
    User findUserById(@PathVariable Long id);

    @GetMapping("api/users")
    List<User> getAllUsers();

    @PostMapping("api/users")
    String createUser(@RequestBody User user);

    @PutMapping("api/users/{id}")
    User updateUser(@PathVariable Long id, @RequestBody User user);

    @DeleteMapping("api/users/{id}")
    String deleteUser(@PathVariable Long id);

}
















