package com.dangjik.tierlist.service;

import com.dangjik.tierlist.model.DutyOfficer;
import com.dangjik.tierlist.model.DutyRecord;
import com.dangjik.tierlist.model.Rank;
import com.dangjik.tierlist.model.Rating;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DutyOfficerService {

    @Autowired private FileStorageService fileStorage;
    @Autowired private TierService tierService;

    // ══════════════════════════════
    //  당직사관 CRUD
    // ══════════════════════════════

    public List<DutyOfficer> getAllOfficers() {
        List<DutyOfficer> officers = fileStorage.loadOfficers();
        tierService.recalcAllTiers(officers);
        return officers;
    }

    public DutyOfficer getOfficer(String id) {
        return fileStorage.loadOfficers().stream()
                .filter(o -> o.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public DutyOfficer addOfficer(String name, String rank) {
        List<DutyOfficer> officers = fileStorage.loadOfficers();
        DutyOfficer officer = new DutyOfficer(UUID.randomUUID().toString(), name, rank);
        officers.add(officer);
        tierService.recalcAllTiers(officers);
        fileStorage.saveOfficers(officers);
        return officer;
    }

    public DutyOfficer updateOfficer(String id, String name, String rank) {
        List<DutyOfficer> officers = fileStorage.loadOfficers();
        for (DutyOfficer o : officers) {
            if (o.getId().equals(id)) {
                if (name != null) o.setName(name);
                if (rank != null) o.setRank(rank);
                tierService.recalcAllTiers(officers);
                fileStorage.saveOfficers(officers);
                return o;
            }
        }
        return null;
    }

    public boolean deleteOfficer(String id) {
        List<DutyOfficer> officers = fileStorage.loadOfficers();
        boolean removed = officers.removeIf(o -> o.getId().equals(id));
        if (removed) {
            tierService.recalcAllTiers(officers);
            fileStorage.saveOfficers(officers);
        }
        return removed;
    }

    // ══════════════════════════════
    //  당직 기록 추가
    // ══════════════════════════════

    public DutyOfficer addDutyRecord(String officerId, String date,
                                     String distributionTime, String returnTime,
                                     String notes) {
        List<DutyOfficer> officers = fileStorage.loadOfficers();
        Optional<DutyOfficer> opt = officers.stream()
                .filter(o -> o.getId().equals(officerId))
                .findFirst();

        if (opt.isEmpty()) return null;

        DutyOfficer officer = opt.get();

        DutyRecord record = new DutyRecord();
        record.setId(UUID.randomUUID().toString());
        record.setDate(date);
        record.setPhoneDistributionTime(distributionTime);
        record.setPhoneReturnTime(returnTime);
        record.setNotes(notes);

        int distScore   = tierService.calcDistributionScore(distributionTime);
        int returnScore = tierService.calcReturnScore(returnTime);
        record.setDistributionScore(distScore);
        record.setReturnScore(returnScore);

        officer.getDutyRecords().add(record);
        officer.setTotalScore(officer.getTotalScore() + distScore + returnScore);

        tierService.recalcAllTiers(officers);
        fileStorage.saveOfficers(officers);
        return officer;
    }

    public DutyOfficer updateDutyRecord(String officerId, String recordId, String date,
                                        String distributionTime, String returnTime, String notes) {
        List<DutyOfficer> officers = fileStorage.loadOfficers();
        Optional<DutyOfficer> opt = officers.stream()
                .filter(o -> o.getId().equals(officerId))
                .findFirst();
        if (opt.isEmpty()) return null;

        DutyOfficer officer = opt.get();
        for (DutyRecord r : officer.getDutyRecords()) {
            if (r.getId().equals(recordId)) {
                // 기존 점수 제거
                officer.setTotalScore(officer.getTotalScore() - r.getDistributionScore() - r.getReturnScore());

                r.setDate(date);
                r.setPhoneDistributionTime(distributionTime);
                r.setPhoneReturnTime(returnTime);
                r.setNotes(notes);

                int distScore   = tierService.calcDistributionScore(distributionTime);
                int returnScore = tierService.calcReturnScore(returnTime);
                r.setDistributionScore(distScore);
                r.setReturnScore(returnScore);

                officer.setTotalScore(officer.getTotalScore() + distScore + returnScore);
                break;
            }
        }

        tierService.recalcAllTiers(officers);
        fileStorage.saveOfficers(officers);
        return officer;
    }

    public DutyOfficer deleteDutyRecord(String officerId, String recordId) {
        List<DutyOfficer> officers = fileStorage.loadOfficers();
        Optional<DutyOfficer> opt = officers.stream()
                .filter(o -> o.getId().equals(officerId))
                .findFirst();
        if (opt.isEmpty()) return null;

        DutyOfficer officer = opt.get();
        officer.getDutyRecords().stream()
                .filter(r -> r.getId().equals(recordId))
                .findFirst()
                .ifPresent(r -> {
                    officer.setTotalScore(officer.getTotalScore() - r.getDistributionScore() - r.getReturnScore());
                    officer.getDutyRecords().remove(r);
                });

        tierService.recalcAllTiers(officers);
        fileStorage.saveOfficers(officers);
        return officer;
    }

    // ══════════════════════════════
    //  평점
    // ══════════════════════════════

    public DutyOfficer rate(String officerId, String userId, int score) {
        if (score < 1 || score > 5) throw new IllegalArgumentException("Score must be between 1 and 5");

        List<DutyOfficer> officers = fileStorage.loadOfficers();
        Optional<DutyOfficer> opt = officers.stream()
                .filter(o -> o.getId().equals(officerId))
                .findFirst();
        if (opt.isEmpty()) return null;

        DutyOfficer officer = opt.get();
        List<Rating> ratings = officer.getRatings();
        if (ratings == null) {
            ratings = new ArrayList<>();
            officer.setRatings(ratings);
        }

        boolean alreadyRated = ratings.stream().anyMatch(r -> r.getUserId().equals(userId));
        if (alreadyRated) throw new IllegalStateException("이미 평점을 등록하셨습니다.");

        ratings.add(new Rating(userId, score));
        fileStorage.saveOfficers(officers);
        return officer;
    }

    // ══════════════════════════════
    //  계급 관리
    // ══════════════════════════════

    public List<Rank> getAllRanks() {
        return fileStorage.loadRanks();
    }

    public Rank addRank(String name, int order) {
        List<Rank> ranks = fileStorage.loadRanks();
        Rank rank = new Rank(UUID.randomUUID().toString(), name, order);
        ranks.add(rank);
        fileStorage.saveRanks(ranks);
        return rank;
    }

    public boolean deleteRank(String id) {
        List<Rank> ranks = fileStorage.loadRanks();
        boolean removed = ranks.removeIf(r -> r.getId().equals(id));
        if (removed) fileStorage.saveRanks(ranks);
        return removed;
    }
}
