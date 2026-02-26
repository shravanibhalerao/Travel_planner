package com.travelplaner.travelplaner.service;

import com.travelplaner.travelplaner.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
@Async
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")  // ← add this
    private String fromEmail;

    public void sendConfirmationEmail(Booking b, String itemName) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);          // ← add this line
            msg.setTo(b.getPassengerEmail());
            msg.setSubject("Booking Confirmed - " + b.getTicketId());
            msg.setText(buildEmailBody(b, itemName));
            mailSender.send(msg);
            System.out.println("Email sent to: " + b.getPassengerEmail()); // ← helpful log
        } catch (Exception e) {
            System.err.println("Email failed (booking still saved): " + e.getMessage());
        }
    }

    private String buildEmailBody(Booking b, String itemName) {
        return String.format(
                "Dear %s,\n\n" +
                "Your booking is confirmed!\n\n" +
                "----------------------------------\n" +
                "TICKET ID  : %s\n" +
                "TYPE       : %s\n" +
                "SERVICE    : %s\n" +
                "FROM       : %s\n" +
                "TO         : %s\n" +
                "DATE       : %s\n" +
                "PASSENGERS : %d\n" +
                "AMOUNT PAID: Rs.%.2f\n" +
                "----------------------------------\n\n" +
                "Thank you for choosing TravelPlaner!\n" +
                "Have a safe journey!",
                b.getPassengerName(),
                b.getTicketId(),
                b.getBookingType(),
                itemName,
                b.getSource()      != null ? b.getSource()      : "-",
                b.getDestination() != null ? b.getDestination() : "-",
                b.getTravelDate()  != null ? b.getTravelDate()  : "-",
                b.getPassengers(),
                b.getTotalAmount()
        );
    }
}