package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "TODO"; // TODO, IN_PROGRESS, DONE

    @Column(nullable = false)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH

    @Column(name = "assigned_to")
    private String assignedTo; // User email

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_by")
    private String createdBy; // User email who created/assigned the task

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
