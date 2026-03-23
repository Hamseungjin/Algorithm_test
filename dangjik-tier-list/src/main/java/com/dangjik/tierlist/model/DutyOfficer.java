package com.dangjik.tierlist.model;

import java.util.ArrayList;
import java.util.List;

public class DutyOfficer {

    private String id;
    private String name;
    private String rank;
    private int totalScore;
    private List<Rating> ratings = new ArrayList<>();
    private List<DutyRecord> dutyRecords = new ArrayList<>();
    private String tier;

    public DutyOfficer() {}

    public DutyOfficer(String id, String name, String rank) {
        this.id = id;
        this.name = name;
        this.rank = rank;
        this.totalScore = 0;
        this.tier = "BRONZE";
    }

    // ── getters & setters ──

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRank() { return rank; }
    public void setRank(String rank) { this.rank = rank; }

    public int getTotalScore() { return totalScore; }
    public void setTotalScore(int totalScore) { this.totalScore = totalScore; }

    public List<Rating> getRatings() { return ratings; }
    public void setRatings(List<Rating> ratings) { this.ratings = ratings; }

    public List<DutyRecord> getDutyRecords() { return dutyRecords; }
    public void setDutyRecords(List<DutyRecord> dutyRecords) { this.dutyRecords = dutyRecords; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    // ── computed helpers ──

    public double getAverageRating() {
        if (ratings == null || ratings.isEmpty()) return 0.0;
        return ratings.stream().mapToInt(Rating::getScore).average().orElse(0.0);
    }

    public double getAverageDistributionMinutes() {
        if (dutyRecords == null || dutyRecords.isEmpty()) return 0.0;
        return dutyRecords.stream()
                .filter(r -> r.getPhoneDistributionTime() != null && !r.getPhoneDistributionTime().isBlank())
                .mapToInt(r -> timeToMinutes(r.getPhoneDistributionTime()))
                .average()
                .orElse(0.0);
    }

    public double getAverageReturnMinutes() {
        if (dutyRecords == null || dutyRecords.isEmpty()) return 0.0;
        return dutyRecords.stream()
                .filter(r -> r.getPhoneReturnTime() != null && !r.getPhoneReturnTime().isBlank())
                .mapToInt(r -> timeToMinutes(r.getPhoneReturnTime()))
                .average()
                .orElse(0.0);
    }

    private int timeToMinutes(String time) {
        String[] parts = time.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }
}
