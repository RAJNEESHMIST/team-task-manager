package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalProjects;
    private long totalTasks;
    private Map<String, Long> tasksByStatus;
    private List<UserTaskStat> userTaskStats;

    @Data
    @AllArgsConstructor
    public static class UserTaskStat {
        private String email;
        private long taskCount;
    }
}
