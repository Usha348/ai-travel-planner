'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTrip() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budgetType, setBudgetType] = useState('Medium');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const interestOptions = ['Food', 'Culture', 'Adventure', 'Shopping', 'Nature', 'Nightlife'];

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination,
          days: Number(days),
          budgetType,
          interests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to create trip');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/trip/${data.trip._id}`);
    } catch (err) {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Plan a New Trip</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-1">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            placeholder="e.g. Tokyo"
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
          />

          <label className="block text-sm font-medium mb-1">Number of Days</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
            min="1"
            placeholder="e.g. 5"
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
          />

          <label className="block text-sm font-medium mb-1">Budget Type</label>
          <select
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label className="block text-sm font-medium mb-1">Interests</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {interestOptions.map((interest) => (
              <button
                type="button"
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  interests.includes(interest)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating itinerary with AI...' : 'Generate Itinerary'}
          </button>
        </form>
      </div>
    </div>
  );
}