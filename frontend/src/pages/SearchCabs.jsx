import { useTravelData } from "../context/TravelDataContext";

export default function SearchCabs() {
  const { cabs, bookCab, loading, error } = useTravelData();

  const handleBooking = async (cabId) => {
    try {
      const result = await bookCab(cabId, {
        passengers: 2,
        date: "2026-02-13",
        userName: "Shravani",
        userPhone: "9876543210",
        userEmail: "shrava@example.com"
      });

      alert(`Booked! ID: ${result.bookingId}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <h2>Available Cabs</h2>

      {cabs.map((cab) => (
        <div key={cab.id} className="card p-3 mb-3">
          <h5>{cab.name}</h5>
          <p>Price: ₹{cab.price}</p>

          <button
            className="btn btn-success rounded-pill"
            onClick={() => handleBooking(cab.id)}
          >
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
}
