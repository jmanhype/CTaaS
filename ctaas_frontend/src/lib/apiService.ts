import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'; // Adjust if your API is hosted elsewhere

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Authorization headers will be added dynamically if needed
  },
});

// Function to add authorization token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// --- Trial Endpoints --- //
export const getTrials = async (params = {}) => {
  try {
    const response = await apiClient.get('/trials', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching trials:', error);
    throw error;
  }
};

export const getTrialById = async (trialId: string) => {
  try {
    const response = await apiClient.get(`/trials/${trialId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching trial ${trialId}:`, error);
    throw error;
  }
};

export const createTrial = async (trialData: any) => {
  try {
    const response = await apiClient.post('/trials', trialData);
    return response.data;
  } catch (error) {
    console.error('Error creating trial:', error);
    throw error;
  }
};

export const updateTrial = async (trialId: string, trialData: any) => {
  try {
    const response = await apiClient.put(`/trials/${trialId}`, trialData);
    return response.data;
  } catch (error) {
    console.error(`Error updating trial ${trialId}:`, error);
    throw error;
  }
};

// --- Protocol Endpoints --- //
export const getProtocolsForTrial = async (trialId: string) => {
  try {
    const response = await apiClient.get(`/trials/${trialId}/protocols`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching protocols for trial ${trialId}:`, error);
    throw error;
  }
};

export const draftProtocol = async (trialId: string, draftParams: any) => {
  try {
    const response = await apiClient.post(`/trials/${trialId}/protocols/draft`, draftParams);
    return response.data; // Should include a task_id
  } catch (error) {
    console.error(`Error drafting protocol for trial ${trialId}:`, error);
    throw error;
  }
};

export const getProtocolGenerationStatus = async (taskId: string) => {
  try {
    const response = await apiClient.get(`/protocols/generation-status/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching protocol generation status for task ${taskId}:`, error);
    throw error;
  }
};

// --- IRB Submission Endpoints --- //
export const getIRBSubmissionsForTrial = async (trialId: string) => {
  try {
    const response = await apiClient.get(`/trials/${trialId}/irb-submissions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching IRB submissions for trial ${trialId}:`, error);
    throw error;
  }
};

export const createIRBSubmission = async (trialId: string, submissionData: any) => {
  try {
    const response = await apiClient.post(`/trials/${trialId}/irb-submissions`, submissionData);
    return response.data;
  } catch (error) {
    console.error(`Error creating IRB submission for trial ${trialId}:`, error);
    throw error;
  }
};

// --- Site Endpoints --- //
export const getGlobalSites = async (params = {}) => {
  try {
    const response = await apiClient.get('/sites', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching global sites:', error);
    throw error;
  }
};

export const getSitesForTrial = async (trialId: string) => {
  try {
    const response = await apiClient.get(`/trials/${trialId}/sites`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sites for trial ${trialId}:`, error);
    throw error;
  }
};

export const associateSiteToTrial = async (trialId: string, siteData: any) => {
  try {
    const response = await apiClient.post(`/trials/${trialId}/sites`, siteData);
    return response.data;
  } catch (error) {
    console.error(`Error associating site to trial ${trialId}:`, error);
    throw error;
  }
};

// --- Patient Endpoints --- //
export const getPatientsForTrial = async (trialId: string) => {
  try {
    const response = await apiClient.get(`/trials/${trialId}/patients`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching patients for trial ${trialId}:`, error);
    throw error;
  }
};

export const identifyPatientsForTrial = async (trialId: string, criteria: any) => {
  try {
    const response = await apiClient.post(`/trials/${trialId}/patients/identify`, criteria);
    return response.data; // Should include a task_id
  } catch (error) {
    console.error(`Error identifying patients for trial ${trialId}:`, error);
    throw error;
  }
};

export const getPatientIdentificationStatus = async (taskId: string) => {
  try {
    const response = await apiClient.get(`/patients/identification-status/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient identification status for task ${taskId}:`, error);
    throw error;
  }
};

// --- Monitoring Endpoints --- //
export const getMonitoringSummary = async (trialId: string) => {
  try {
    const response = await apiClient.get(`/trials/${trialId}/monitoring/summary`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching monitoring summary for trial ${trialId}:`, error);
    throw error;
  }
};

export const getMonitoringEvents = async (trialId: string) => {
  try {
    const response = await apiClient.get(`/trials/${trialId}/monitoring/events`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching monitoring events for trial ${trialId}:`, error);
    throw error;
  }
};

// --- Regulatory Report Endpoints --- //
export const generateRegulatoryReport = async (trialId: string, reportParams: any) => {
  try {
    const response = await apiClient.post(`/trials/${trialId}/regulatory-reports/generate`, reportParams);
    return response.data; // Should include a task_id or report details
  } catch (error) {
    console.error(`Error generating regulatory report for trial ${trialId}:`, error);
    throw error;
  }
};

export const getRegulatoryReportStatus = async (taskId: string) => {
  try {
    const response = await apiClient.get(`/regulatory-reports/generation-status/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching regulatory report status for task ${taskId}:`, error);
    throw error;
  }
};

// --- User Management (Admin) Endpoints --- //
export const getUsers = async (params = {}) => {
  try {
    // Assuming admin prefix for these routes as per design doc discussion
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData: any) => {
  try {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: any) => {
  try {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// --- Authentication Endpoints --- //
export const loginUser = async (credentials: any) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    // Assuming the token is in response.data.token or response.data.access_token
    if (response.data.access_token) {
      setAuthToken(response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    setAuthToken(null);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Call a logout endpoint if it exists, e.g., /auth/logout
    // await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Error logging out:', error);
    // Even if logout API call fails, clear token locally
  } finally {
    setAuthToken(null);
    // Additional cleanup like clearing user from global state
  }
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/users/me/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserPassword = async (passwordData: any) => {
  try {
    const response = await apiClient.put('/users/me/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export default apiClient;

