package com.example.demo.controller;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private com.example.demo.repository.ProjectMemberRepository projectMemberRepository;

    @Autowired
    private com.example.demo.repository.ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        
        List<Task> allAssignedToMe = taskRepository.findByAssignedTo(email);
        List<Task> allCreatedByMe = taskRepository.findByCreatedBy(email);
        
        // Find all projects involved (assigned to me + created by me)
        java.util.Set<java.util.UUID> projectIds = new java.util.HashSet<>();
        allAssignedToMe.forEach(t -> projectIds.add(t.getProjectId()));
        allCreatedByMe.forEach(t -> projectIds.add(t.getProjectId()));
        
        // Fetch projects and map names
        Map<java.util.UUID, String> projectNames = new HashMap<>();
        if (!projectIds.isEmpty()) {
            projectRepository.findAllById(projectIds).forEach(p -> projectNames.put(p.getId(), p.getName()));
        }
        
        // Map tasks
        List<Map<String, Object>> assignedToMeDTOs = allAssignedToMe.stream()
                .map(t -> mapTask(t, projectNames))
                .collect(Collectors.toList());
        
        List<Map<String, Object>> assignedToOthersDTOs = allCreatedByMe.stream()
                .filter(t -> t.getAssignedTo() != null && !email.equals(t.getAssignedTo()))
                .map(t -> mapTask(t, projectNames))
                .collect(Collectors.toList());
                
        // Calculate metrics
        long totalAssignedToMe = assignedToMeDTOs.size();
        long totalAssignedToOthers = assignedToOthersDTOs.size();
        long totalTasks = totalAssignedToMe + totalAssignedToOthers;
        
        Map<String, Object> response = new HashMap<>();
        response.put("assignedToMe", assignedToMeDTOs);
        response.put("assignedToOthers", assignedToOthersDTOs);
        response.put("totalAssignedToMe", totalAssignedToMe);
        response.put("totalAssignedToOthers", totalAssignedToOthers);
        response.put("totalTasks", totalTasks);
        
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> mapTask(Task t, Map<java.util.UUID, String> projectNames) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", t.getId());
        map.put("title", t.getTitle());
        map.put("description", t.getDescription());
        map.put("status", t.getStatus());
        map.put("priority", t.getPriority());
        map.put("assignedTo", t.getAssignedTo());
        map.put("createdBy", t.getCreatedBy());
        map.put("projectId", t.getProjectId());
        map.put("projectName", projectNames.getOrDefault(t.getProjectId(), "Unknown Project"));
        map.put("dueDate", t.getDueDate());
        map.put("createdAt", t.getCreatedAt());
        return map;
    }
}
