package com.dangjik.tierlist.service;

import com.dangjik.tierlist.model.DutyOfficer;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

/**
 * 티어 계산 서비스
 *
 * 승점 계산 기준:
 *  - 예상 불출시간: 18:00  /  예상 반납시간: 21:30
 *  - 불출: 예상보다 30분 이상 빠르면 +15, 30분 이상 느리면 -15  (선형 비례)
 *  - 반납: 예상보다 30분 이상 느리면 +15, 30분 이상 빠르면 -15  (선형 비례)
 *
 * 티어 기준 (상위 퍼센타일):
 *  CHALLENGER  :  상위  3%
 *  DIAMOND     :  상위  3 ~ 10%
 *  PLATINUM    :  상위 10 ~ 25%
 *  GOLD        :  상위 25 ~ 50%
 *  SILVER      :  상위 50 ~ 75%
 *  BRONZE      :  하위 25%
 */
@Service
public class TierService {

    private static final int EXPECTED_DIST_MINUTES  = 18 * 60;       // 18:00
    private static final int EXPECTED_RETURN_MINUTES = 21 * 60 + 30; // 21:30
    private static final int BONUS_MINUTES = 30;
    private static final int BONUS_POINTS  = 15;

    /**
     * 불출 시간(HH:mm)으로 승점 계산
     * 빠를수록 +, 느릴수록 -
     */
    public int calcDistributionScore(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) return 0;
        int actual = toMinutes(timeStr);
        int diff = EXPECTED_DIST_MINUTES - actual; // 양수 = 빠름
        return clampScore(diff);
    }

    /**
     * 반납 시간(HH:mm)으로 승점 계산
     * 늦을수록 +, 빠를수록 -
     */
    public int calcReturnScore(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) return 0;
        int actual = toMinutes(timeStr);
        int diff = actual - EXPECTED_RETURN_MINUTES; // 양수 = 늦음
        return clampScore(diff);
    }

    /**
     * 전체 장교 목록을 순위 기반으로 티어 재계산 후 저장
     */
    public void recalcAllTiers(List<DutyOfficer> officers) {
        if (officers == null || officers.isEmpty()) return;

        officers.sort(Comparator.comparingInt(DutyOfficer::getTotalScore).reversed());
        int total = officers.size();

        for (int i = 0; i < total; i++) {
            double percentile = (double) i / total * 100.0; // 낮을수록 상위
            officers.get(i).setTier(toTierLabel(percentile));
        }
    }

    // ── private helpers ──

    private int clampScore(int diffMinutes) {
        if (diffMinutes >= BONUS_MINUTES)  return BONUS_POINTS;
        if (diffMinutes <= -BONUS_MINUTES) return -BONUS_POINTS;
        // 선형 비례
        return (int) Math.round((double) diffMinutes / BONUS_MINUTES * BONUS_POINTS);
    }

    private int toMinutes(String time) {
        String[] parts = time.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }

    private String toTierLabel(double topPercentile) {
        if (topPercentile < 3)  return "CHALLENGER";
        if (topPercentile < 10) return "DIAMOND";
        if (topPercentile < 25) return "PLATINUM";
        if (topPercentile < 50) return "GOLD";
        if (topPercentile < 75) return "SILVER";
        return "BRONZE";
    }
}
