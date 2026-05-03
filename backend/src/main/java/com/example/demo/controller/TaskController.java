package com.example.demo.controller;

import com.example.demo.model.ProjectMember;
import com.example.demo.model.Task;
import com.example.demo.repository.ProjectMemberRepository;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

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
    public ResponseEntity<Task> createTask(@RequestBody Map<String, String> body, @AuthenticationPrincipal Jwt jwt) {
        String email = getEmailFromJwt(jwt);
        UUID projectId = UUID.fromString(body.get("projectId"));

        // Verify ADMIN
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserEmail(projectId, email)
                .orElse(null);
        if (member == null || !"ADMIN".equals(member.getRole())) {
            System.err.println("Task creation denied for user: " + email + " on project: " + projectId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Task task = new Task();
        task.setProjectId(projectId);
        task.setTitle(body.get("title"));
        task.setDescription(body.get("description"));
        task.setAssignedTo(body.get("assignedTo"));
        task.setCreatedBy(email);
        if (body.containsKey("dueDate") && !body.get("dueDate").isEmpty()) {
            task.setDueDate(LocalDate.parse(body.get("dueDate")));
        }
        if (body.containsKey("priority") && !body.get("priority").isEmpty()) {
            task.setPriority(body.get("priority"));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(taskRepository.save(task));
    }

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(@RequestParam UUID projectId, @AuthenticationPrincipal Jwt jwt) {
        String email = getEmailFromJwt(jwt);
        
        if (!isGlobalAdmin(email)) {
            projectMemberRepository.findByProjectIdAndUserEmail(projectId, email)
                    .orElseThrow(() -> new RuntimeException("Access Denied"));
        }

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return ResponseEntity.ok(tasks);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable UUID id, @RequestBody Map<String, String> body, @AuthenticationPrincipal Jwt jwt) {
        String email = getEmailFromJwt(jwt);
        
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        
        // Check if user is Admin or Assignee
        boolean isAssignee = email.equals(task.getAssignedTo());
        boolean isCreator = email.equals(task.getCreatedBy());
        boolean isAdmin = isGlobalAdmin(email);
        
        if (!isAdmin) {
            java.util.Optional<ProjectMember> memberOpt = projectMemberRepository.findByProjectIdAndUserEmail(task.getProjectId(), email);
            if (memberOpt.isPresent() && "ADMIN".equals(memberOpt.get().getRole())) {
                isAdmin = true;
            }
        }
        
        if (!isAdmin && !isAssignee && !isCreator) {
            throw new RuntimeException("Access Denied");
        }

        if (body.containsKey("status")) {
            task.setStatus(body.get("status"));
        }

        if (isAdmin || isCreator) {
            if (body.containsKey("title")) task.setTitle(body.get("title"));
            if (body.containsKey("description")) task.setDescription(body.get("description"));
            if (body.containsKey("assignedTo")) task.setAssignedTo(body.get("assignedTo"));
            if (body.containsKey("priority")) task.setPriority(body.get("priority"));
            if (body.containsKey("dueDate")) {
                String dueDateStr = body.get("dueDate");
                if (dueDateStr == null || dueDateStr.isEmpty()) {
                    task.setDueDate(null);
                } else {
                    task.setDueDate(LocalDate.parse(dueDateStr));
                }
            }
        }

        return ResponseEntity.ok(taskRepository.save(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        String email = getEmailFromJwt(jwt);
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        
        boolean isCreator = email.equals(task.getCreatedBy());
        boolean isAdmin = isGlobalAdmin(email);
        
        if (!isAdmin) {
            java.util.Optional<ProjectMember> memberOpt = projectMemberRepository.findByProjectIdAndUserEmail(task.getProjectId(), email);
            if (memberOpt.isPresent() && "ADMIN".equals(memberOpt.get().getRole())) {
                isAdmin = true;
            }
        }
        
        if (!isAdmin && !isCreator) {
            System.err.println("Task deletion denied for user: " + email + " on task: " + id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        taskRepository.delete(task);
        return ResponseEntity.ok("Task deleted successfully");
    }
}
