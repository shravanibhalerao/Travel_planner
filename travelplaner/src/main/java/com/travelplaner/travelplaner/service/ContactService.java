package com.travelplaner.travelplaner.service;

import com.travelplaner.travelplaner.dto.ContactRequestDTO;
import com.travelplaner.travelplaner.dto.ContactResponseDTO;
import com.travelplaner.travelplaner.model.ContactMessage;
import com.travelplaner.travelplaner.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ContactService {

    private final ContactMessageRepository repository;

    public ContactService(ContactMessageRepository repository) {
        this.repository = repository;
    }

    // ── Save a new contact message ─────────────────────────
    public ContactResponseDTO saveMessage(ContactRequestDTO dto) {
        ContactMessage entity = new ContactMessage();
        entity.setName(dto.getName().trim());
        entity.setEmail(dto.getEmail().trim().toLowerCase());
        entity.setSubject(dto.getSubject() != null ? dto.getSubject().trim() : null);
        entity.setMessage(dto.getMessage().trim());

        ContactMessage saved = repository.save(entity);
        return toDTO(saved);
    }

    // ── Get all messages (admin) ───────────────────────────
    @Transactional(readOnly = true)
    public List<ContactResponseDTO> getAllMessages() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Get unread messages (admin) ────────────────────────
    @Transactional(readOnly = true)
    public List<ContactResponseDTO> getUnreadMessages() {
        return repository.findByReadFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Count unread (admin badge) ─────────────────────────
    @Transactional(readOnly = true)
    public long countUnread() {
        return repository.countByReadFalse();
    }

    // ── Mark a message as read (admin) ─────────────────────
    public ContactResponseDTO markAsRead(Long id) {
        ContactMessage msg = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
        msg.setRead(true);
        return toDTO(repository.save(msg));
    }

    // ── Delete a message (admin) ───────────────────────────
    public void deleteMessage(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Message not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // ── Mapper ────────────────────────────────────────────
    private ContactResponseDTO toDTO(ContactMessage e) {
        return new ContactResponseDTO(
                e.getId(),
                e.getName(),
                e.getEmail(),
                e.getSubject(),
                e.getMessage(),
                e.getCreatedAt(),
                e.isRead()
        );
    }
}