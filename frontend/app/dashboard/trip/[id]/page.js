'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TripDetails() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/');
      return;
    }

    const fetchTrip = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTrip(data.trip);
      } catch (err) {
        console.error('Failed to fetch trip', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Loading itinerary...</p>;
  }

  if (!trip) {
    return <p className="text-center mt-10">Trip not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <a href="/dashboard" className="text-blue-600 underline">
          ← Back to Dashboard
        </a>

        <h1 className="text-3xl font-bold mt-4 mb-2 text-blue-600">
          {trip.destination}
        </h1>
        <p className="text-gray-500 mb-6">
          {trip.days} days · {trip.budgetType} budget · Interests: {trip.interests.join(', ')}
        </p>

        {/* Budget Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estimated Budget</h2>
          <ul className="space-y-1">
            <li>Flights: ${trip.budgetEstimate.flights}</li>
            <li>Accommodation: ${trip.budgetEstimate.accommodation}</li>
            <li>Food: ${trip.budgetEstimate.food}</li>
            <li>Activities: ${trip.budgetEstimate.activities}</li>
            <li className="font-bold border-t pt-2 mt-2">
              Total: ${trip.budgetEstimate.total}
            </li>
          </ul>
        </div>

        {/* Itinerary Section */}
        <div className="space-y-4">
          {trip.itinerary.map((day) => (
            <div key={day.day} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Day {day.day}</h3>
              <ul className="list-disc list-inside text-gray-700">
                {day.activities.map((activity, idx) => (
                  <li key={idx}>{activity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}