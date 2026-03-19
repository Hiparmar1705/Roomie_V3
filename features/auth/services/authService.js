import { sanitizePhone } from '../../../shared/utils/validation';
import { USER_ROLES } from '../../../shared/constants/roles';
import { apiRequest } from '../../../shared/services/apiClient';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeIdentifierForRole = ({ identifier = '', role }) => {
  if (role === USER_ROLES.LANDLORD) {
    return sanitizePhone(identifier);
  }

  return identifier.trim().toLowerCase();
};

export const login = async ({ identifier, role, password = '' }) => {
  try {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: normalizeIdentifierForRole({ identifier, role }),
        password,
      }),
    });

    // Store token (you might want to use AsyncStorage or SecureStore)
    // For now, just return the user data
    return result.data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signup = async ({ identifier, role, password, displayName }) => {
  try {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: normalizeIdentifierForRole({ identifier, role }),
        role,
        displayName,
        password,
        bio: '',
        location: 'Prince George, BC',
      }),
    });

    // Store token
    return result.data.user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const updateProfile = async ({ user, updates }) => {
  try {
    const result = await apiRequest(`/auth/profile/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if you have token storage
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    return result.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const logout = async () => {
  // Clear any stored tokens
  // For now, just a simple delay
  await delay(40);
};
