package com.travelplaner.travelplaner.dto;

public class BookingRequest {

    private String bookingType;
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
}