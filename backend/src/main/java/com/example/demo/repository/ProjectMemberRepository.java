package com.example.demo.repository;

import com.example.demo.model.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {
    List<ProjectMember> findByProjectId(UUID projectId);
    List<ProjectMember> findByUserEmail(String userEmail);
    Optional<ProjectMember> findByProjectIdAndUserEmail(UUID projectId, String userEmail);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByProjectId(UUID projectId);
}
