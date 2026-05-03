package com.example.demo.controller;

import com.example.demo.dto.AdminStatsResponse;
import com.example.demo.model.AppUser;
import com.example.demo.model.Project;
import com.example.demo.model.Task;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    private String getEmailFromJwt(Jwt jwt) {
        return jwt.getClaimAsString("email");
    }

    private void verifyGlobalAdmin(String email) {
        AppUser user = appUserRepository.findById(email).orElse(null);
        if (user == null || !"GLOBAL_ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Access Denied: Requires GLOBAL_ADMIN role");
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<AppUser>> getAllUsers(@AuthenticationPrincipal Jwt jwt) {
        verifyGlobalAdmin(getEmailFromJwt(jwt));
        return ResponseEntity.ok(appUserRepository.findAll());
    }

    @PatchMapping("/users/{email}/restrict")
    public ResponseEntity<AppUser> toggleRestriction(@PathVariable String email, @RequestBody Map<String, Boolean> body, @AuthenticationPrincipal Jwt jwt) {
        verifyGlobalAdmin(getEmailFromJwt(jwt));
        
        AppUser user = appUserRepository.findById(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (body.containsKey("restricted")) {
            user.setRestricted(body.get("restricted"));
        }
        return ResponseEntity.ok(appUserRepository.save(user));
    }

    @PatchMapping("/users/{email}/role")
    public ResponseEntity<AppUser> updateRole(@PathVariable String email, @RequestBody Map<String, String> body, @AuthenticationPrincipal Jwt jwt) {
        verifyGlobalAdmin(getEmailFromJwt(jwt));
        
        AppUser user = appUserRepository.findById(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (body.containsKey("role")) {
            user.setRole(body.get("role"));
        }
        return ResponseEntity.ok(appUserRepository.save(user));
    }

    @GetMapping("/projects")
    public ResponseEntity<List<Project>> getAllProjects(@AuthenticationPrincipal Jwt jwt) {
        verifyGlobalAdmin(getEmailFromJwt(jwt));
        return ResponseEntity.ok(projectRepository.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAllStats(@AuthenticationPrincipal Jwt jwt) {
        verifyGlobalAdmin(getEmailFromJwt(jwt));

        long totalUsers = appUserRepository.count();
        long totalProjects = projectRepository.count();
        List<Task> allTasks = taskRepository.findAll();
        long totalTasks = allTasks.size();

        Map<String, Long> tasksByStatus = allTasks.stream()
                .collect(java.util.stream.Collectors.groupingBy(Task::getStatus, java.util.stream.Collectors.counting()));

        Map<String, Long> userTasks = allTasks.stream()
                .filter(t -> t.getAssignedTo() != null)
                .collect(java.util.stream.Collectors.groupingBy(Task::getAssignedTo, java.util.stream.Collectors.counting()));

        List<AdminStatsResponse.UserTaskStat> userTaskStats = userTasks.entrySet().stream()
                .map(e -> new AdminStatsResponse.UserTaskStat(e.getKey(), e.getValue()))
                .collect(java.util.stream.Collectors.toList());

        AdminStatsResponse stats = new AdminStatsResponse(totalUsers, totalProjects, totalTasks, tasksByStatus, userTaskStats);
        return ResponseEntity.ok(stats);
    }
}
