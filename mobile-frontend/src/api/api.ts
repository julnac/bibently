const API_URL = "http://192.168.1.25:5001";

// GET /events
export async function getEvents() {
  try {
    const response = await fetch(`${API_URL}/events`);

    const text = await response.text();
    console.log("RAW =>", text);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("getEvents error:", error);
    throw error;
  }
}

// GET /events/{id}
export async function getEventById(id: string) {
  try {
    const response = await fetch(`${API_URL}/events/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("getEventById error:", error);
    throw error;
  }
}

