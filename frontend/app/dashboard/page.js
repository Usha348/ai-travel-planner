'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/');
      return;
    }

    const fetchTrips = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/trips', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTrips(data.trips || []);
      } catch (err) {
        console.error('Failed to fetch trips', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-600">My Trips</h1>
        <div className="flex gap-4">
          
            <a href="/dashboard/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + New Trip
          </a>
          <button
            onClick={handleLogout}
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </div>

      {trips.length === 0 ? (
        <p className="text-gray-500">No trips yet. Create your first one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trips.map((trip) => (
            
              <a key={trip._id}
              href={`/dashboard/trip/${trip._id}`}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{trip.destination}</h2>
              <p className="text-gray-500">{trip.days} days · {trip.budgetType} budget</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}