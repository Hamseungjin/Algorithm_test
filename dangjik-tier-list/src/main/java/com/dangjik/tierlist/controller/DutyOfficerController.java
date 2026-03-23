package com.dangjik.tierlist.controller;

import com.dangjik.tierlist.model.DutyOfficer;
import com.dangjik.tierlist.service.DutyOfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/officers")
public class DutyOfficerController {

    @Autowired private DutyOfficerService service;

    // ── 목록 조회 ──
    @GetMapping
    public List<DutyOfficer> list() {
        return service.getAllOfficers();
    }

    // ── 단일 조회 ──
    @GetMapping("/{id}")
    public ResponseEntity<DutyOfficer> get(@PathVariable String id) {
        DutyOfficer o = service.getOfficer(id);
        return o != null ? ResponseEntity.ok(o) : ResponseEntity.notFound().build();
    }

    // ── 평점 등록 (일반 사용자) ──
    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rate(@PathVariable String id,
                                  @RequestBody Map<String, Object> body) {
        try {
            String userId = (String) body.get("userId");
            int score = (int) body.get("score");
            DutyOfficer officer = service.rate(id, userId, score);
            if (officer == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(officer);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
