import { Platform } from 'react-native';

const isWebProd = Platform.OS === 'web' && process.env.NODE_ENV === 'production';
const API_URL = isWebProd ? '' : 'http://54.209.56.53';

export const getRules = async () => {
  try {
    const res = await fetch(`${API_URL}/api/rules`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching rules", e);
    return [];
  }
};

export const getPatterns = async () => {
  try {
    const res = await fetch(`${API_URL}/api/patterns`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching patterns", e);
    return [];
  }
};

export const ventAndExtractRule = async (entry) => {
  try {
    const res = await fetch(`${API_URL}/api/vent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry })
    });
    if (!res.ok) throw new Error("Failed to vent");
    return await res.json(); // Returns the new Rule object
  } catch (e) {
    console.error("Error venting", e);
    throw e;
  }
};

export const consultBetterMe = async (query) => {
  try {
    const res = await fetch(`${API_URL}/api/consult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error("Failed to consult");
    const data = await res.json();
    return data.response;
  } catch (e) {
    console.error("Error consulting", e);
    throw e;
  }
};

export const initMirror = async () => {
  try {
    const res = await fetch(`${API_URL}/api/mirror-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error("Failed to init chat");
    const data = await res.json();
    return data.history;
  } catch (e) {
    console.error("Error init chatting", e);
    return [];
  }
};

export const mirrorChat = async (message) => {
  try {
    const res = await fetch(`${API_URL}/api/mirror-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error("Failed to chat");
    const data = await res.json();
    return data.response;
  } catch (e) {
    console.error("Error chatting", e);
    throw e;
  }
};

export const getBrainGraph = async () => {
  try {
    const res = await fetch(`${API_URL}/api/brain/graph`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching brain graph", e);
    return { nodes: [], links: [] };
  }
};

export const createBrainNode = async (title, content, nodeType = 'note') => {
  try {
    const res = await fetch(`${API_URL}/api/brain/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, nodeType })
    });
    if (!res.ok) throw new Error("Failed to create node");
    return await res.json();
  } catch (e) {
    console.error("Error creating brain node", e);
    throw e;
  }
};

export const getFinanceLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/finance`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching finance logs", e);
    return [];
  }
};

export const addFinanceLog = async (amount, type, description, category, person) => {
  try {
    const res = await fetch(`${API_URL}/api/finance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, type, description, category, person })
    });
    if (!res.ok) throw new Error("Failed to add finance log");
    return await res.json();
  } catch (e) {
    console.error("Error adding finance log", e);
    throw e;
  }
};

export const deleteFinanceLog = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/finance/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error("Failed to delete finance log");
    return await res.json();
  } catch (e) {
    console.error("Error deleting finance log", e);
    throw e;
  }
};

export const getSkills = async () => {
  try {
    const res = await fetch(`${API_URL}/api/skills`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching skills", e);
    return [];
  }
};

export const getHabitStreaks = async () => {
  try {
    const res = await fetch(`${API_URL}/api/habits/streaks`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching habit streaks", e);
    return [];
  }
};

export const getWishlist = async () => {
  try {
    const res = await fetch(`${API_URL}/api/wishlist`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching wishlist", e);
    return [];
  }
};

export const addWishlist = async (item) => {
  try {
    const res = await fetch(`${API_URL}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item })
    });
    if (!res.ok) throw new Error("Failed to add wishlist item");
    return await res.json();
  } catch (e) {
    console.error("Error adding wishlist item", e);
    throw e;
  }
};

export const getBuyingAdvice = async (id) => {
  try {
    const res = await fetch(`${API_URL}/api/wishlist/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error("Failed to get buying advice");
    return await res.json();
  } catch (e) {
    console.error("Error getting buying advice", e);
    throw e;
  }
};

export const transcribeAudio = async (base64Audio, mimeType = 'audio/m4a') => {
  try {
    const res = await fetch(`${API_URL}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: base64Audio, mimeType })
    });
    if (!res.ok) throw new Error("Failed to transcribe audio");
    const data = await res.json();
    return data.text;
  } catch (e) {
    console.error("Error transcribing audio", e);
    throw e;
  }
};

export const getTasks = async () => {
  try {
    const res = await fetch(`${API_URL}/api/tasks`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching tasks", e);
    return [];
  }
};

export const createTask = async (title, type = 'everyday') => {
  try {
    const res = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type })
    });
    return await res.json();
  } catch (e) {
    console.error("Error creating task", e);
    throw e;
  }
};

export const updateTaskStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Failed to update task");
    return await res.json();
  } catch (e) {
    console.error("Error updating task", e);
    throw e;
  }
};

export const getFoodLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/food`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching food logs", e);
    return [];
  }
};

export const getDashboardTruth = async () => {
  try {
    const res = await fetch(`${API_URL}/api/dashboard/truth`);
    return await res.json();
  } catch (e) {
    console.error("Error fetching dashboard truth", e);
    return null;
  }
};
