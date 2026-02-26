package com.travelplaner.travelplaner.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String ticketId;

    // BUS / FLIGHT / HOTEL / CAB / PACKAGE / TRAIN
    private String bookingType;

    // FK columns - only one used per booking
    private Long busId;
    private Long flightId;
    private Long hotelId;
    private Long cabId;
    private Long packageId;

    private String passengerName;
    private String passengerEmail;
    private String passengerPhone;
    private Integer passengers;

    private String source;
    private String destination;
    private String travelDate;
    private String returnDate;
    private String cabinClass;

    private Double totalAmount;
    private String status;
    private LocalDateTime bookedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    public void prePersist() {
    	if (status == null) status = "PENDING";  // was "CONFIRMED"
        if (bookedAt == null) bookedAt = LocalDateTime.now();
        if (status   == null) status   = "CONFIRMED";
    }

    public Long getId()                     { return id; }
    public void setId(Long id)              { this.id = id; }
    public String getTicketId()             { return ticketId; }
    public void setTicketId(String t)       { this.ticketId = t; }
    public String getBookingType()          { return bookingType; }
    public void setBookingType(String t)    { this.bookingType = t; }
    public Long getBusId()                  { return busId; }
    public void setBusId(Long id)           { this.busId = id; }
    public Long getFlightId()               { return flightId; }
    public void setFlightId(Long id)        { this.flightId = id; }
    public Long getHotelId()                { return hotelId; }
    public void setHotelId(Long id)         { this.hotelId = id; }
    public Long getCabId()                  { return cabId; }
    public void setCabId(Long id)           { this.cabId = id; }
    public Long getPackageId()              { return packageId; }
    public void setPackageId(Long id)       { this.packageId = id; }
    public String getPassengerName()        { return passengerName; }
    public void setPassengerName(String n)  { this.passengerName = n; }
    public String getPassengerEmail()       { return passengerEmail; }
    public void setPassengerEmail(String e) { this.passengerEmail = e; }
    public String getPassengerPhone()       { return passengerPhone; }
    public void setPassengerPhone(String p) { this.passengerPhone = p; }
    public Integer getPassengers()          { return passengers; }
    public void setPassengers(Integer p)    { this.passengers = p; }
    public String getSource()               { return source; }
    public void setSource(String s)         { this.source = s; }
    public String getDestination()          { return destination; }
    public void setDestination(String d)    { this.destination = d; }
    public String getTravelDate()           { return travelDate; }
    public void setTravelDate(String d)     { this.travelDate = d; }
    public String getReturnDate()           { return returnDate; }
    public void setReturnDate(String d)     { this.returnDate = d; }
    public String getCabinClass()           { return cabinClass; }
    public void setCabinClass(String c)     { this.cabinClass = c; }
    public Double getTotalAmount()          { return totalAmount; }
    public void setTotalAmount(Double a)    { this.totalAmount = a; }
    public String getStatus()               { return status; }
    public void setStatus(String s)         { this.status = s; }
    public LocalDateTime getBookedAt()      { return bookedAt; }
    public void setBookedAt(LocalDateTime t){ this.bookedAt = t; }
    public User getUser()                   { return user; }
    public void setUser(User u)             { this.user = u; }

	public Booking(String ticketId, String bookingType, Long busId, Long flightId, Long hotelId, Long cabId,
			Long packageId, String passengerName, String passengerEmail, String passengerPhone, Integer passengers,
			String source, String destination, String travelDate, String returnDate, String cabinClass,
			Double totalAmount, String status, LocalDateTime bookedAt, User user) {
		super();
		this.ticketId = ticketId;
		this.bookingType = bookingType;
		this.busId = busId;
		this.flightId = flightId;
		this.hotelId = hotelId;
		this.cabId = cabId;
		this.packageId = packageId;
		this.passengerName = passengerName;
		this.passengerEmail = passengerEmail;
		this.passengerPhone = passengerPhone;
		this.passengers = passengers;
		this.source = source;
		this.destination = destination;
		this.travelDate = travelDate;
		this.returnDate = returnDate;
		this.cabinClass = cabinClass;
		this.totalAmount = totalAmount;
		this.status = status;
		this.bookedAt = bookedAt;
		this.user = user;
	}

	public Booking() {
		super();
		// TODO Auto-generated constructor stub
	}
}