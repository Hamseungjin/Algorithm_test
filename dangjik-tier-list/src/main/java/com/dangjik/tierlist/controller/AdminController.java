package com.dangjik.tierlist.controller;

import com.dangjik.tierlist.model.DutyOfficer;
import com.dangjik.tierlist.model.Rank;
import com.dangjik.tierlist.service.DutyOfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 관리자 전용 API
 * 모든 요청에 X-Admin-Password 헤더 필요
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Value("${app.admin.password}")
    private String adminPassword;

    @Autowired private DutyOfficerService service;

    // ── 관리자 인증 확인 ──
    @PostMapping("/auth")
    public ResponseEntity<?> auth(@RequestBody Map<String, String> body) {
        String pw = body.get("password");
        if (adminPassword.equals(pw)) {
            return ResponseEntity.ok(Map.of("ok", true));
        }
        return ResponseEntity.status(401).body(Map.of("message", "비밀번호가 틀렸습니다."));
    }

    // ══════════════════════════════
    //  당직사관 관리
    // ══════════════════════════════

    @PostMapping("/officers")
    public ResponseEntity<?> addOfficer(@RequestHeader("X-Admin-Password") String pw,
                                        @RequestBody Map<String, String> body) {
        if (!checkAuth(pw)) return unauthorized();
        DutyOfficer o = service.addOfficer(body.get("name"), body.get("rank"));
        return ResponseEntity.ok(o);
    }

    @PutMapping("/officers/{id}")
    public ResponseEntity<?> updateOfficer(@RequestHeader("X-Admin-Password") String pw,
                                           @PathVariable String id,
                                           @RequestBody Map<String, String> body) {
        if (!checkAuth(pw)) return unauthorized();
        DutyOfficer o = service.updateOfficer(id, body.get("name"), body.get("rank"));
        return o != null ? ResponseEntity.ok(o) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/officers/{id}")
    public ResponseEntity<?> deleteOfficer(@RequestHeader("X-Admin-Password") String pw,
                                           @PathVariable String id) {
        if (!checkAuth(pw)) return unauthorized();
        boolean deleted = service.deleteOfficer(id);
        return deleted ? ResponseEntity.ok(Map.of("ok", true)) : ResponseEntity.notFound().build();
    }

    // ══════════════════════════════
    //  당직 기록 관리
    // ══════════════════════════════

    @PostMapping("/officers/{id}/records")
    public ResponseEntity<?> addRecord(@RequestHeader("X-Admin-Password") String pw,
                                       @PathVariable String id,
                                       @RequestBody Map<String, String> body) {
        if (!checkAuth(pw)) return unauthorized();
        DutyOfficer o = service.addDutyRecord(
                id,
                body.get("date"),
                body.get("phoneDistributionTime"),
                body.get("phoneReturnTime"),
                body.get("notes")
        );
        return o != null ? ResponseEntity.ok(o) : ResponseEntity.notFound().build();
    }

    @PutMapping("/officers/{officerId}/records/{recordId}")
    public ResponseEntity<?> updateRecord(@RequestHeader("X-Admin-Password") String pw,
                                          @PathVariable String officerId,
                                          @PathVariable String recordId,
                                          @RequestBody Map<String, String> body) {
        if (!checkAuth(pw)) return unauthorized();
        DutyOfficer o = service.updateDutyRecord(
                officerId, recordId,
                body.get("date"),
                body.get("phoneDistributionTime"),
                body.get("phoneReturnTime"),
                body.get("notes")
        );
        return o != null ? ResponseEntity.ok(o) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/officers/{officerId}/records/{recordId}")
    public ResponseEntity<?> deleteRecord(@RequestHeader("X-Admin-Password") String pw,
                                          @PathVariable String officerId,
                                          @PathVariable String recordId) {
        if (!checkAuth(pw)) return unauthorized();
        DutyOfficer o = service.deleteDutyRecord(officerId, recordId);
        return o != null ? ResponseEntity.ok(o) : ResponseEntity.notFound().build();
    }

    // ══════════════════════════════
    //  계급 관리
    // ══════════════════════════════

    @GetMapping("/ranks")
    public List<Rank> getRanks() {
        return service.getAllRanks();
    }

    @PostMapping("/ranks")
    public ResponseEntity<?> addRank(@RequestHeader("X-Admin-Password") String pw,
                                     @RequestBody Map<String, Object> body) {
        if (!checkAuth(pw)) return unauthorized();
        String name = (String) body.get("name");
        int order = body.containsKey("order") ? (int) body.get("order") : 99;
        Rank rank = service.addRank(name, order);
        return ResponseEntity.ok(rank);
    }

    @DeleteMapping("/ranks/{id}")
    public ResponseEntity<?> deleteRank(@RequestHeader("X-Admin-Password") String pw,
                                        @PathVariable String id) {
        if (!checkAuth(pw)) return unauthorized();
        boolean deleted = service.deleteRank(id);
        return deleted ? ResponseEntity.ok(Map.of("ok", true)) : ResponseEntity.notFound().build();
    }

    // ── helpers ──

    private boolean checkAuth(String pw) {
        return adminPassword.equals(pw);
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(401).body(Map.of("message", "관리자 권한이 없습니다."));
    }
}
