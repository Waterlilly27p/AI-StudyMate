const API_BASE = '/api';

/**
 * Retrieve current authentication token
 */
export function getToken() {
  return localStorage.getItem('study_buddy_token');
}

/**
 * Configure authentication header
 */
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Process API response models or throw standard error payloads
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = 'An unexpected network error occurred';
    try {
      const errPayload = await response.json();
      errorMsg = errPayload.error || errorMsg;
    } catch {
      // Non-JSON error body fallback
      if (response.status === 401 || response.status === 403) {
        errorMsg = 'Your secure study session has expired. Please sign in again.';
      }
    }
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('study_buddy_token');
      localStorage.removeItem('study_buddy_user');
      // Dispatch custom logout event if token becomes stale or invalid
      window.dispatchEvent(new Event('auth-expired'));
    }
    
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  /**
   * 1. Authentication Handlers
   */
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    localStorage.setItem('study_buddy_token', data.token);
    localStorage.setItem('study_buddy_user', JSON.stringify(data.user));
    return data;
  },

  async googleLogin(email, name) {
    const res = await fetch(`${API_BASE}/auth/googleLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await handleResponse(res);
    localStorage.setItem('study_buddy_token', data.token);
    localStorage.setItem('study_buddy_user', JSON.stringify(data.user));
    return data;
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse(res);
    localStorage.setItem('study_buddy_token', data.token);
    localStorage.setItem('study_buddy_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('study_buddy_token');
    localStorage.removeItem('study_buddy_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('study_buddy_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * 2. Subject Concept Explainer
   */
  async explainTopic(topic, level) {
    const res = await fetch(`${API_BASE}/explain`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ topic, level }),
    });
    return handleResponse(res);
  },

  /**
   * 3. Note summaries
   */
  async summarizeNotes(
    filename, 
    fileType, 
    base64Content, 
    rawText
  ) {
    const res = await fetch(`${API_BASE}/summarize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ filename, fileType, base64Content, rawText }),
    });
    return handleResponse(res);
  },

  async summarizeYoutube(url, title) {
    const res = await fetch(`${API_BASE}/summarize-youtube`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url, title }),
    });
    return handleResponse(res);
  },

  async getNotes() {
    const res = await fetch(`${API_BASE}/notes`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getNoteById(id) {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async toggleNoteLock(id, pinCode, isLocked) {
    const res = await fetch(`${API_BASE}/notes/${id}/toggle-lock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pinCode, isLocked }),
    });
    return handleResponse(res);
  },

  async deleteNote(id) {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * 4. Quiz Operations
   */
  async generateQuiz(
    topic, 
    noteId, 
    questionCount, 
    questionType
  ) {
    const res = await fetch(`${API_BASE}/quiz`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ topic, noteId, questionCount, questionType }),
    });
    return handleResponse(res);
  },

  async getQuizzes() {
    const res = await fetch(`${API_BASE}/quizzes`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async submitQuizAttempt(
    quizId, 
    score, 
    total, 
    answers
  ) {
    const res = await fetch(`${API_BASE}/quiz/attempt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ quizId, score, total, answers }),
    });
    return handleResponse(res);
  },

  async getQuizAttempts() {
    const res = await fetch(`${API_BASE}/quiz/attempts`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * 5. Flashcards Actions
   */
  async generateFlashcards(topic, noteId, cardCount) {
    const res = await fetch(`${API_BASE}/flashcards`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ topic, noteId, cardCount }),
    });
    return handleResponse(res);
  },

  async getFlashcardSets() {
    const res = await fetch(`${API_BASE}/flashcards`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * 6. Interactive Chat Operations
   */
  async chatWithNotes(notesId, messages) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ notesId, messages }),
    });
    return handleResponse(res);
  },

  async chatWithAssistant(threadId, messages) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ notesId: threadId, messages }),
    });
    return handleResponse(res);
  },

  async getChatSessions() {
    const res = await fetch(`${API_BASE}/chats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async deleteChatSession(notesId) {
    const res = await fetch(`${API_BASE}/chats/${notesId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * 7. Metrics & Tracker Logs
   */
  async getProgressSummary() {
    const res = await fetch(`${API_BASE}/progress`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
