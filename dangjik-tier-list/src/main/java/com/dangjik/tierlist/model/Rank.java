package com.dangjik.tierlist.model;

public class Rank {

    private String id;
    private String name;
    private int order; // 낮을수록 상위 계급

    public Rank() {}

    public Rank(String id, String name, int order) {
        this.id = id;
        this.name = name;
        this.order = order;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getOrder() { return order; }
    public void setOrder(int order) { this.order = order; }
}
