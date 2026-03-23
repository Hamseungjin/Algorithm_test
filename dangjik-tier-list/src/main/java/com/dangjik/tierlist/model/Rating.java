package com.dangjik.tierlist.model;

public class Rating {

    private String userId;  // localStorage UUID – prevents duplicates
    private int score;      // 1 ~ 5

    public Rating() {}

    public Rating(String userId, int score) {
        this.userId = userId;
        this.score = score;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
}
