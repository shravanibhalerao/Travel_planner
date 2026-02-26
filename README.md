# Travel Planner

A comprehensive full-stack web application for booking travel services including flights, hotels, trains, buses, cabs, and holiday packages.

## Features

- 🔐 **User Authentication** - Secure registration and login with JWT tokens
- ✈️ **Flight Booking** - Search and book flights
- 🏨 **Hotel Booking** - Find and reserve hotels
- 🚂 **Train Booking** - Search and book train tickets
- 🚌 **Bus Booking** - Book bus tickets
- 🚕 **Cab Booking** - Reserve cabs for local transportation
- 📦 **Holiday Packages** - Browse and book vacation packages
- 👤 **User Profile** - Manage personal information and view booking history
- ⚙️ **Admin Dashboard** - Administrative controls for managing the platform
- 🔔 **Real-time Alerts** - WebSocket-based notifications
- 📧 **Email Notifications** - Booking confirmations via email

## Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.5
- **Language:** Java 21
- **Security:** Spring Security with JWT
- **Database:** MySQL
- **ORM:** Spring Data JPA / Hibernate
- **Real-time:** WebSocket (STOMP)
- **Email:** Spring Mail (Gmail SMTP)
- **Build Tool:** Maven

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **UI Framework:** Bootstrap 5 & React Bootstrap
- **Animations:** Framer Motion
- **Forms:** React Hook Form with Yup validation
- **Styling:** Styled Components
- **Icons:** Lucide React

## Project Structure

```
travelplaner/
├── travelplaner/                    # Backend (Spring Boot)
│   ├── src/main/java/com/travelplaner/travelplaner/
│   │   ├── config/                  # Configuration classes
│   │   │   ├── JwtAuthFilter.java  # JWT authentication filter
│   │   │   ├── SecurityConfig.java # Security configuration
│   │   │   └── WebSocketConfig.java# WebSocket configuration
│   │   ├── controller/             # REST controllers
│   │   │   ├── AuthController.java # Authentication endpoints
│   │   │   ├── BookingController.java
│   │   │   ├── FlightController.java
│   │   │   ├── HotelController.java
│   │   │   ├── BusController.java
│   │   │   ├── CabController.java
│   │   │   ├── TrainController.java
│   │   │   └── ...
│   │   ├── model/                  # Entity classes
│   │   │   ├── User.java
│   │   │   ├── Booking.java
│   │   │   ├── Flight.java
│   │   │   ├── Hotel.java
│   │   │   └── ...
│   │   ├── repository/             # Data repositories
│   │   ├── service/                # Business logic
│   │   └── dto/                    # Data Transfer Objects
│   └── src/main/resources/
│       └── application.properties  # App configuration
│
├── frontend/                        # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── common/            # Shared components
│   │   │   └── itinerary/         # Itinerary components
│   │   ├── pages/                 # Page components
│   │   │   ├── home.jsx
│   │   │   ├── flights.jsx
│   │   │   ├── hotels.jsx
│   │   │   ├── trains.jsx
│   │   │   ├── bus.jsx
│   │   │   ├── cabs.jsx
│   │   │   ├── packages.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── context/               # React context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── utils/                 # Utility functions
│   │   ├── assets/               # Images and static assets
│   │   └── App.jsx               # Main application component
│   └── package.json
│
└── README.md
```

## Prerequisites

- **Java** 21 or higher
- **Node.js** 18 or higher
- **MySQL** 8.0 or higher
- **Maven** 3.8 or higher

## Installation & Setup

### 1. Clone the Repository

```
bash
[git clone <repository-url>](https://github.com/shravanibhalerao/Travel_planner.git)
cd travelplaner
```

### 2. Backend Setup

#### Configure Database

Make sure MySQL is running and create a database:

```
sql
CREATE DATABASE travelplanner;
```

#### Update Application Properties

Edit `travelplaner/src/main/resources/application.properties` with your database credentials:

```
properties
spring.datasource.url=jdbc:mysql://localhost:3306/travelplanner
spring.datasource.username=your_username
spring.datasource.password=your_password
```

For email configuration, update:
```
properties
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

#### Build and Run Backend

```
bash
cd travelplaner
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8082`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (default Vite port)

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/user` | Get current user |

### Flights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights` | Get all flights |
| GET | `/api/flights/{id}` | Get flight by ID |
| POST | `/api/flights` | Add new flight |
| PUT | `/api/flights/{id}` | Update flight |
| DELETE | `/api/flights/{id}` | Delete flight |

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels` | Get all hotels |
| GET | `/api/hotels/{id}` | Get hotel by ID |
| POST | `/api/hotels` | Add new hotel |
| PUT | `/api/hotels/{id}` | Update hotel |
| DELETE | `/api/hotels/{id}` | Delete hotel |

### Trains
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trains` | Get all trains |
| GET | `/api/trains/{id}` | Get train by ID |
| POST | `/api/trains` | Add new train |
| PUT | `/api/trains/{id}` | Update train |
| DELETE | `/api/trains/{id}` | Delete train |

### Buses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bus` | Get all buses |
| GET | `/api/bus/{id}` | Get bus by ID |
| POST | `/api/bus` | Add new bus |
| PUT | `/api/bus/{id}` | Update bus |
| DELETE | `/api/bus/{id}` | Delete bus |

### Cabs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cabs` | Get all cabs |
| GET | `/api/cabs/{id}` | Get cab by ID |
| POST | `/api/cabs` | Add new cab |
| PUT | `/api/cabs/{id}` | Update cab |
| DELETE | `/api/cabs/{id}` | Delete cab |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/user/{userId}` | Get user bookings |
| POST | `/api/bookings` | Create booking |
| DELETE | `/api/bookings/{id}` | Cancel booking |

### Holiday Packages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | Get all packages |
| GET | `/api/packages/{id}` | Get package by ID |
| POST | `/api/packages` | Add new package |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| DELETE | `/api/admin/users/{id}` | Delete user |

## Environment Variables

### Backend (application.properties)
```
properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/travelplanner
spring.datasource.username=root
spring.datasource.password=your_password

# Server
server.port=8082

# Email (Gmail SMTP)
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8082
```

## Default Users

### Admin
- Email: admin@travelplaner.com
- Password: admin123

### Regular User
Register through the registration page.

## Building for Production

### Backend
```
bash
cd travelplaner
mvn clean package
java -jar target/travelplaner-0.0.1-SNAPSHOT.jar
```

### Frontend
```
bash
cd frontend
npm run build
npm run preview
```

## License

This project is for educational purposes.

## Authors

- Travel Planner Team

## Support

For issues or questions, please contact the development team.
