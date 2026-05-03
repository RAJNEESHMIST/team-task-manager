package com.example.demo.controller;

import com.example.demo.model.Project;
import com.example.demo.model.ProjectMember;
import com.example.demo.repository.ProjectMemberRepository;
import com.example.demo.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "*") // For MVP
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private com.example.demo.repository.TaskRepository taskRepository;

    @Autowired
    private com.example.demo.repository.AppUserRepository appUserRepository;

    private boolean isGlobalAdmin(String email) {
        return appUserRepository.findById(email)
                .map(u -> "GLOBAL_ADMIN".equals(u.getRole()))
                .orElse(false);
    }

    private String getEmailFromJwt(Jwt jwt) {
        return jwt.getClaimAsString("email");
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Map<String, String> body, @AuthenticationPrincipal Jwt jwt) {
        String email = getEmailFromJwt(jwt);
        String name = body.get("name");

        Project project = new Project();
        project.setName(name);
        project.setCreatedBy(email);
        Project savedProject = projectRepository.save(project);

        // Add creator as ADMIN
        ProjectMember member = new ProjectMember();
        member.setProjectId(savedProject.getId());
        member.setUserEmail(email);
        member.setRole("ADMIN");
        projectMemberRepository.save(member);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedProject);
    }

    @GetMapping
    public ResponseEntity<List<Project>> getUserProjects(@AuthenticationPrincipal Jwt jwt) {
        String email = getEmailFromJwt(jwt);
        
        if (isGlobalAdmin(email)) {
            return ResponseEntity.ok(projectRepository.findAll());
        }

        List<ProjectMember> memberships = projectMemberRepository.findByUserEmail(email);
        List<UUID> projectIds = memberships.stream()
                .map(ProjectMember::getProjectId)
                .collect(Collectors.toList());
                
        List<Project> projects = projectRepository.findAllById(projectIds);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        String email = getEmailFromJwt(jwt);
        
        if (!isGlobalAdmin(email)) {
            projectMemberRepository.findByProjectIdAndUserEmail(id, email)
                    .orElseThrow(() -> new RuntimeException("Access Denied"));
        }
                
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return ResponseEntity.ok(project);
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ProjectMember> addMember(@PathVariable UUID id, @RequestBody Map<String, String> body, @AuthenticationPrincipal Jwt jwt) {
        String adminEmail = getEmailFromJwt(jwt);
        
        // Verify admin
        ProjectMember adminMember = projectMemberRepository.findByProjectIdAndUserEmail(id, adminEmail)
                .orElseThrow(() -> new RuntimeException("Access Denied"));
                
        if (!"ADMIN".equals(adminMember.getRole())) {
            throw new RuntimeException("Only ADMIN can add members");
        }

        String newUserEmail = body.get("email");
        String role = body.getOrDefault("role", "MEMBER");

        ProjectMember member = new ProjectMember();
        member.setProjectId(id);
        member.setUserEmail(newUserEmail);
        member.setRole(role);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(projectMemberRepository.save(member));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<ProjectMember>> getProjectMembers(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        String email = getEmailFromJwt(jwt);
        
        if (!isGlobalAdmin(email)) {
            projectMemberRepository.findByProjectIdAndUserEmail(id, email)
                    .orElseThrow(() -> new RuntimeException("Access Denied"));
        }
                
        List<ProjectMember> members = projectMemberRepository.findByProjectId(id);
        return ResponseEntity.ok(members);
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        String email = getEmailFromJwt(jwt);
        
        if (!isGlobalAdmin(email)) {
            ProjectMember adminMember = projectMemberRepository.findByProjectIdAndUserEmail(id, email)
                    .orElseThrow(() -> new RuntimeException("Access Denied"));
                    
            if (!"ADMIN".equals(adminMember.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only ADMIN can delete a project");
            }
        }
        
        System.out.println("Deleting project: " + id);
        // Cascade delete
        taskRepository.deleteByProjectId(id);
        projectMemberRepository.deleteByProjectId(id);
        projectRepository.deleteById(id);
        
        return ResponseEntity.ok("Project and tasks deleted successfully");
    }
}
