'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TripDetails() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [preference, setPreference] = useState('');
  const [packingList, setPackingList] = useState(null);
  const [loadingPacking, setLoadingPacking] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const fetchTrip = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${id}`, {
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

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const handleRemoveActivity = async (dayNumber, activityIndex) => {
    const token = localStorage.getItem('token');
    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.day === dayNumber) {
        const newActivities = day.activities.filter((_, idx) => idx !== activityIndex);
        return { ...day, activities: newActivities };
      }
      return day;
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itinerary: updatedItinerary }),
    });
    const data = await res.json();
    setTrip(data.trip);
  };

  const handleAddActivity = async (dayNumber) => {
    const newActivity = prompt('Enter new activity:');
    if (!newActivity) return;

    const token = localStorage.getItem('token');
    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.day === dayNumber) {
        return { ...day, activities: [...day.activities, newActivity] };
      }
      return day;
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ itinerary: updatedItinerary }),
    });
    const data = await res.json();
    setTrip(data.trip);
  };

  const handleRegenerateDay = async (dayNumber) => {
    if (!preference) {
      alert('Please type a preference first (e.g. "more outdoor activities")');
      return;
    }
    setRegeneratingDay(dayNumber);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${id}/regenerate-day`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dayNumber, preference }),
        }
      );
      const data = await res.json();
      setTrip(data.trip);
      setPreference('');
    } catch (err) {
      console.error('Failed to regenerate day', err);
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handleGetPackingList = async () => {
  setLoadingPacking(true);
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${id}/packing-list`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setPackingList(data.packingList);
  } catch (err) {
    console.error('Failed to get packing list', err);
  } finally {
    setLoadingPacking(false);
  }
};

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

        {/* Regenerate preference input */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium mb-2">
            Regenerate preference (used when you click "Regenerate" on any day)
          </label>
          <input
            type="text"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            placeholder='e.g. "more outdoor activities" or "relaxing and low-cost"'
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Itinerary Section */}
        <div className="space-y-4">
          {trip.itinerary.map((day) => (
            <div key={day.day} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Day {day.day}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddActivity(day.day)}
                    className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200"
                  >
                    + Add Activity
                  </button>
                  <button
                    onClick={() => handleRegenerateDay(day.day)}
                    disabled={regeneratingDay === day.day}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 disabled:opacity-50"
                  >
                    {regeneratingDay === day.day ? 'Regenerating...' : 'Regenerate Day'}
                  </button>
                </div>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {day.activities.map((activity, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span>{activity}</span>
                    <button
                      onClick={() => handleRemoveActivity(day.day, idx)}
                      className="text-red-500 text-xs hover:underline ml-2"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Packing List Section */}
<div className="bg-white rounded-lg shadow p-6 mt-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">🎒 Smart Packing Checklist</h2>
    <button
      onClick={handleGetPackingList}
      disabled={loadingPacking}
      className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 disabled:opacity-50 text-sm"
    >
      {loadingPacking ? 'Generating...' : packingList ? 'Regenerate' : 'Generate Packing List'}
    </button>
  </div>

  {packingList && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {packingList.map((category) => (
        <div key={category.category} className="bg-gray-50 rounded-md p-4">
          <h3 className="font-semibold mb-2">{category.category}</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {category.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )}
</div>
      </div>
    </div>
  );
}