package com.travelplaner.travelplaner.controller;

import com.travelplaner.travelplaner.dto.ContactRequestDTO;
import com.travelplaner.travelplaner.dto.ContactResponseDTO;
import com.travelplaner.travelplaner.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    // ── POST /api/contact  ─────────────────────────────────
    // Called by the frontend contact form
    @PostMapping
    public ResponseEntity<?> submitContactForm(@Valid @RequestBody ContactRequestDTO dto) {
        try {
            ContactResponseDTO saved = contactService.saveMessage(dto);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Thank you! We'll get back to you within 24 hours.",
                            "id", saved.getId()
                    ));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Something went wrong. Please try again."));
        }
    }

    // ── GET /api/contact  ──────────────────────────────────
    // Admin: list all messages
    @GetMapping
    public ResponseEntity<List<ContactResponseDTO>> getAllMessages() {
        return ResponseEntity.ok(contactService.getAllMessages());
    }

    // ── GET /api/contact/unread  ───────────────────────────
    // Admin: list unread messages
    @GetMapping("/unread")
    public ResponseEntity<List<ContactResponseDTO>> getUnreadMessages() {
        return ResponseEntity.ok(contactService.getUnreadMessages());
    }

    // ── GET /api/contact/unread/count  ────────────────────
    // Admin: get count of unread messages (for notification badge)
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", contactService.countUnread()));
    }

    // ── PATCH /api/contact/{id}/read  ─────────────────────
    // Admin: mark a message as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            ContactResponseDTO updated = contactService.markAsRead(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ── DELETE /api/contact/{id}  ─────────────────────────
    // Admin: delete a message
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        try {
            contactService.deleteMessage(id);
            return ResponseEntity.ok(Map.of("message", "Message deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}