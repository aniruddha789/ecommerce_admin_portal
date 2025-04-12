import axios from 'axios';
import { Product, CreateProductInput, UpdateProductInput } from '../types/product';
import JSEncrypt from 'jsencrypt'; // Import JSEncrypt for password encryption

const BASE_URL = 'http://localhost:8082';
// const BASE_URL = 'https://backend.myurbankicks.in:8082';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    config.headers.Authorization = bearerToken;
  }
  return config;
});

// Add response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only logout for auth-related 401s, not for other API failures
    if (error.response?.status === 401 && 
        (error.config.url.includes('/user/') || error.config.url.includes('/auth/'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Product CRUD APIs
export const getAllProducts = async (page: number, pageSize: number): Promise<{ content: Product[], totalPages: number }> => {
  const response = await api.get(`/product/getProductPaged?page=${page}&size=${pageSize}`);
  return response.data;
};

export const getProductsByType = async (type: string, page: number, pageSize: number): Promise<{ content: Product[], totalPages: number }> => {
  const response = await api.get(`/product/getProductByTypePaged/${type}?page=${page}&size=${pageSize}`);
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get(`/product/getProduct/${id}`);
  return response.data;
};

export const createProduct = async (productData: CreateProductInput): Promise<{ status: string, message: string }> => {
  const response = await api.post('/product/addProduct', productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: UpdateProductInput): Promise<{ status: string, message: string }> => {
  // Note: Backend doesn't have update endpoint, you'll need to add it to the backend
  const response = await api.post(`/product/updateProduct/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<{ status: string, message: string }> => {
  const response = await api.post(`/product/deleteProduct/${id}`);
  return response.data;
};

export const productService = {
  getAllProducts,
  getProductsByType,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductInventory: async (productId: number): Promise<Inventory[]> => {
    const response = await api.get(`/product/getInventory/${productId}`);
    return response.data;
  },
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/product/search?query=${query}`);
    return response.data;
  }
};

// Auth types
interface RegisterResponse {
  status: string;
  message: string;
  code: string;
}

interface LoginResponse {
  token: string | null;
  status: string;
  message: string;
  username: string;
  firstname: string;
}

// Function to get public key for encryption
const getPublicKey = async (): Promise<string> => {
  const response = await axios.get(`${BASE_URL}/auth/public-key`);
  const newPublicKey = response.data.publicKey;
  if (!newPublicKey) {
    throw new Error('Failed to fetch public key from server');
  }
  return newPublicKey;
};

// Auth service
export const authService = {
  register: async (username: string, email: string, password: string, firstname: string, lastname: string): Promise<RegisterResponse> => {
    const response = await api.post('/user/register', {
      username,
      email,
      password,
      firstname,
      lastname
    });
    return response.data;
  },

  login: async (username: string, password: string): Promise<LoginResponse> => {
    const publicKey = await getPublicKey();
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encryptedPassword = encrypt.encrypt(password);
    
    if (!encryptedPassword) {
      throw new Error('Password encryption failed');
    }

    const response = await api.post('/user/login', {
      username,
      password: encryptedPassword
    });
    
    if (response.data.token) {
      localStorage.setItem('username', username);
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  validateToken: async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Log token for debugging (remove in production)
      console.log('Token being sent:', token);
      
      // Make sure token is properly formatted
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await axios.get(`${BASE_URL}/user/validate-token`, {
        headers: { 
          'Authorization': bearerToken,
          'Content-Type': 'application/json'
        }
      });

      // Check if the token is valid
      if (!response.data.valid) {
        // Token is invalid, perform logout
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'; // Redirect to login page
        }
        return false;
      }

      return response.data.valid;
    } catch (error) {
      console.error('Error validating token:', error);
      // Handle error (e.g., perform logout)
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'; // Redirect to login page
      }
      return false;
    }
  }
};

// Add Status type to match backend response
interface Status {
  status: string;
  message: string;
  code: string;
} 