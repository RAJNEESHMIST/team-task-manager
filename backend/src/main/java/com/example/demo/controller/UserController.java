package com.example.demo.controller;

import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private com.example.demo.repository.AppUserRepository appUserRepository;

    @GetMapping("/me")
    public ResponseEntity<com.example.demo.model.AppUser> getCurrentUser(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        return ResponseEntity.ok(appUserRepository.findById(email).orElse(null));
    }

    @GetMapping
    public ResponseEntity<List<String>> getAllKnownUsers() {
        @SuppressWarnings("unchecked")
        List<String> emails = entityManager.createNativeQuery(
            "SELECT DISTINCT email FROM (" +
            "  SELECT user_email as email FROM project_members " +
            "  UNION " +
            "  SELECT assigned_to as email FROM tasks WHERE assigned_to IS NOT NULL " +
            "  UNION " +
            "  SELECT created_by as email FROM tasks WHERE created_by IS NOT NULL " +
            ") as all_emails WHERE email IS NOT NULL AND email != ''"
        ).getResultList();
        
        return ResponseEntity.ok(emails);
    }
}
