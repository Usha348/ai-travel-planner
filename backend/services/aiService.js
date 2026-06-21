const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateItinerary = async (destination, days, budgetType, interests) => {
  const prompt = `
You are a travel planning assistant. Create a ${days}-day travel itinerary for ${destination}.
Budget level: ${budgetType}.
Interests: ${interests.join(', ')}.

Return ONLY valid JSON (no markdown, no extra text) in exactly this format:
{
  "itinerary": [
    { "day": 1, "activities": ["activity 1", "activity 2", "activity 3"] },
    { "day": 2, "activities": ["activity 1", "activity 2"] }
  ],
  "budgetEstimate": {
    "flights": 400,
    "accommodation": 300,
    "food": 150,
    "activities": 100,
    "total": 950
  }
}
`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
  });

  const text = completion.choices[0].message.content;

  // Clean up in case AI adds markdown formatting
  const cleanedText = text.replace(/```json|```/g, '').trim();

  return JSON.parse(cleanedText);
};

const regenerateDay = async (destination, dayNumber, preference) => {
  const prompt = `
You are a travel planning assistant. Regenerate Day ${dayNumber} of a trip to ${destination}.
Special preference for this day: ${preference}.

Return ONLY valid JSON (no markdown, no extra text) in exactly this format:
{
  "day": ${dayNumber},
  "activities": ["activity 1", "activity 2", "activity 3"]
}
`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
  });

  const text = completion.choices[0].message.content;
  const cleanedText = text.replace(/```json|```/g, '').trim();

  return JSON.parse(cleanedText);
};

const generatePackingList = async (destination, days, interests, activities) => {
  const prompt = `
You are a travel packing assistant. Based on this trip, suggest a smart packing checklist.

Destination: ${destination}
Duration: ${days} days
Interests: ${interests.join(', ')}
Planned activities: ${activities.join(', ')}

Return ONLY valid JSON (no markdown, no extra text) in exactly this format:
{
  "packingList": [
    { "category": "Clothing", "items": ["item1", "item2"] },
    { "category": "Electronics", "items": ["item1", "item2"] },
    { "category": "Documents", "items": ["item1", "item2"] },
    { "category": "Activity-Specific", "items": ["item1", "item2"] }
  ]
}
`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
  });

  const text = completion.choices[0].message.content;
  const cleanedText = text.replace(/```json|```/g, '').trim();

  return JSON.parse(cleanedText);
};
module.exports = { generateItinerary, regenerateDay, generatePackingList };