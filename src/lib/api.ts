import axios from 'axios';

axios.defaults.withCredentials = true;

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

api.defaults.withCredentials = true;

// Interceptor for CSRF cookie with Sanctum
api.interceptors.request.use(async (config) => {
    // Before sending a non-GET request, ensure the CSRF cookie is present
    if (config.method !== 'get' && !config.url?.startsWith('/sanctum/csrf-cookie') && !document.cookie.includes('XSRF-TOKEN')) {
        await axios.get('/sanctum/csrf-cookie', {
            withCredentials: true,
            baseURL: '' // This forces the request to go to http://localhost:3000/sanctum/csrf-cookie (Next.js proxy)
        });
    }
    return config;
});

export default api;
