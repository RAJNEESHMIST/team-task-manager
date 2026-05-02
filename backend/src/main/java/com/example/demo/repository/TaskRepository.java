package com.example.demo.repository;

import com.example.demo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProjectId(UUID projectId);
    List<Task> findByAssignedTo(String userEmail);
    List<Task> findByProjectIdIn(List<UUID> projectIds);
    List<Task> findByCreatedBy(String createdBy);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByProjectId(UUID projectId);
}
