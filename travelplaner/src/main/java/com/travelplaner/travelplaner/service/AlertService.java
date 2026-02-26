package com.travelplaner.travelplaner.service;

import com.travelplaner.travelplaner.model.Alert;
import com.travelplaner.travelplaner.model.Booking;
import com.travelplaner.travelplaner.repository.AlertRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendBookingAlert(Booking booking) {
        String statusVerb = switch (booking.getStatus()) {
            case "CONFIRMED" -> "confirmed";
            case "CANCELLED" -> "cancelled";
            case "PENDING"   -> "is pending confirmation";
            default          -> booking.getStatus().toLowerCase();
        };

        String category = booking.getBookingType();
        String typeLabel = switch (category) {
            case "FLIGHT"  -> "Flight";
            case "HOTEL"   -> "Hotel";
            case "BUS"     -> "Bus";
            case "CAB"     -> "Cab";
            case "TRAIN"   -> "Train";
            case "PACKAGE" -> "Holiday Package";
            default        -> category;
        };

        String title = typeLabel + " Booking " +
                booking.getStatus().charAt(0) + booking.getStatus().substring(1).toLowerCase();

        StringBuilder msg = new StringBuilder();
        msg.append("Your ").append(typeLabel.toLowerCase())
           .append(" booking (").append(booking.getTicketId()).append(") has been ").append(statusVerb).append(".");

        if (booking.getSource() != null && booking.getDestination() != null) {
            msg.append(" Route: ").append(booking.getSource()).append(" → ").append(booking.getDestination()).append(".");
        }
        if (booking.getTravelDate() != null) {
            msg.append(" Travel date: ").append(booking.getTravelDate()).append(".");
        }
        if (booking.getTotalAmount() != null) {
            msg.append(" Amount: ₹").append(String.format("%,.0f", booking.getTotalAmount())).append(".");
        }

        Alert alert = Alert.builder()
                .userId(booking.getUser().getId())
                .alertType("BOOKING_" + booking.getStatus())
                .title(title)
                .message(msg.toString())
                .category(category)
                .ticketId(booking.getTicketId())
                .read(false)
                .build();

        Alert saved = alertRepository.save(alert);

        pushToUser(booking.getUser().getId(), saved);

        log.info("Booking alert sent to userId={} ticketId={}",   // ← lowercase log
                booking.getUser().getId(), booking.getTicketId());
    }

    public Alert createAdminAlert(Long targetUserId, String title, String message, String category) {
        Alert alert = Alert.builder()
                .userId(targetUserId)
                .alertType("ADMIN_BROADCAST")
                .title(title)
                .message(message)
                .category(category != null ? category : "SYSTEM")
                .read(false)
                .build();

        Alert saved = alertRepository.save(alert);

        if (targetUserId == null) {
            messagingTemplate.convertAndSend("/topic/alerts", toPayload(saved));
            log.info("Broadcast alert sent to all users: {}", title);
        } else {
            pushToUser(targetUserId, saved);
            log.info("Admin alert sent to userId={}: {}", targetUserId, title);
        }

        return saved;
    }

    public List<Alert> getAlertsForUser(Long userId) {
        return alertRepository.findAlertsForUser(userId);
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }

    public long getUnreadCount(Long userId) {
        return alertRepository.countUnreadForUser(userId);
    }

    public void markAllRead(Long userId) {
        alertRepository.markAllReadForUser(userId);
    }

    public void deleteAlert(Long alertId) {
        alertRepository.deleteById(alertId);
    }

    private void pushToUser(Long userId, Alert alert) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/alerts",
                toPayload(alert)
        );
    }

    private Map<String, Object> toPayload(Alert a) {
        return Map.of(
                "id",        a.getId(),
                "userId",    a.getUserId() != null ? a.getUserId() : "ALL",
                "alertType", a.getAlertType(),
                "title",     a.getTitle(),
                "message",   a.getMessage(),
                "category",  a.getCategory(),
                "ticketId",  a.getTicketId() != null ? a.getTicketId() : "",
                "read",      a.isRead(),
                "createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : ""
        );
    }
}