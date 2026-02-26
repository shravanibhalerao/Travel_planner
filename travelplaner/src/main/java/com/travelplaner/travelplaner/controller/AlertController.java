package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.model.Alert;
import com.travelplaner.travelplaner.service.AlertService;
import com.travelplaner.travelplaner.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;
    private final JwtService jwtService;

    // ── Helper: extract userId from JWT ──────────────────────────────────────
    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);  // ✅ returns Long, not String
    }

    // ── GET /api/alerts/my  → user's personal + broadcast alerts ─────────────
    @GetMapping("/my")
    public ResponseEntity<List<Alert>> getMyAlerts(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(alertService.getAlertsForUser(userId));
    }

    // ── GET /api/alerts/unread-count ──────────────────────────────────────────
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of("count", alertService.getUnreadCount(userId)));
    }

    // ── POST /api/alerts/mark-read  → mark all as read ────────────────────────
    @PostMapping("/mark-read")
    public ResponseEntity<Void> markRead(HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (userId == null) return ResponseEntity.status(401).build();
        alertService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    // ── ADMIN: GET /api/alerts/all ─────────────────────────────────────────────
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    // ── ADMIN: POST /api/alerts/admin  → create targeted or broadcast alert ───
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Alert> createAdminAlert(@RequestBody Map<String, Object> body) {
        Long targetUserId = body.get("userId") != null
                ? Long.parseLong(body.get("userId").toString())
                : null;
        String title    = (String) body.get("title");
        String message  = (String) body.get("message");
        String category = (String) body.getOrDefault("category", "SYSTEM");

        Alert saved = alertService.createAdminAlert(targetUserId, title, message, category);
        return ResponseEntity.ok(saved);
    }

    // ── ADMIN: DELETE /api/alerts/{id} ────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        alertService.deleteAlert(id);
        return ResponseEntity.ok().build();
    }
}