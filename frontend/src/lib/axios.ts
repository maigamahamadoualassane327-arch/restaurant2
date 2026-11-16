import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default axiosClient;
// Adresse complète d'une image enregistrée par Laravel
export const imageUrl = (path: string) =>
  (axiosClient.defaults.baseURL ?? '').replace(/\/$/, '') + '/storage/' + path;