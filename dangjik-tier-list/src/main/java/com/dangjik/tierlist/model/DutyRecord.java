package com.dangjik.tierlist.model;

public class DutyRecord {

    private String id;
    private String date;                 // yyyy-MM-dd
    private String phoneDistributionTime; // HH:mm
    private String phoneReturnTime;       // HH:mm
    private String notes;                 // 특이사항
    private int distributionScore;
    private int returnScore;

    public DutyRecord() {}

    // ── getters & setters ──

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getPhoneDistributionTime() { return phoneDistributionTime; }
    public void setPhoneDistributionTime(String phoneDistributionTime) {
        this.phoneDistributionTime = phoneDistributionTime;
    }

    public String getPhoneReturnTime() { return phoneReturnTime; }
    public void setPhoneReturnTime(String phoneReturnTime) {
        this.phoneReturnTime = phoneReturnTime;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public int getDistributionScore() { return distributionScore; }
    public void setDistributionScore(int distributionScore) {
        this.distributionScore = distributionScore;
    }

    public int getReturnScore() { return returnScore; }
    public void setReturnScore(int returnScore) { this.returnScore = returnScore; }

    public int getTotalRecordScore() {
        return distributionScore + returnScore;
    }
}
