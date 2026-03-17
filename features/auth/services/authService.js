import { sanitizePhone } from '../../../shared/utils/validation';
import { USER_ROLES } from '../../../shared/constants/roles';

// this stays in memory only, so it resets when the app fully reloads
const mockUsersByKey = {};

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const formatNameFromIdentifier = (identifier = '', role) => {
  if (role === USER_ROLES.STUDENT) {
    const localPart = identifier.split('@')[0] || '';
    if (localPart) {
      // turn something like sam_lee into sam lee
      return localPart
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  }

  return role === USER_ROLES.LANDLORD ? 'Landlord' : 'Roomie Member';
};

const normalizeIdentifier = ({ identifier, role }) => {
  if (role === USER_ROLES.LANDLORD) {
    return sanitizePhone(identifier);
  }
  return identifier.trim().toLowerCase();
};

// role + identifier together make one stable mock account key
const buildUserKey = ({ identifier, role }) => `${role}:${normalizeIdentifier({ identifier, role })}`;

export const login = async ({ identifier, role, password = '' }) => {
  await delay();

  const normalizedIdentifier = normalizeIdentifier({ identifier, role });
  const userKey = buildUserKey({ identifier: normalizedIdentifier, role });

  // first login creates a basic mock profile if we have never seen this user before
  if (!mockUsersByKey[userKey]) {
    mockUsersByKey[userKey] = {
      identifier: normalizedIdentifier,
      role,
      displayName: formatNameFromIdentifier(normalizedIdentifier, role),
      bio: '',
      location: 'Prince George, BC',
      profileImageUri: '',
      lastLoginPasswordLength: password.length,
    };
  }

  mockUsersByKey[userKey] = {
    ...mockUsersByKey[userKey],
    lastLoginPasswordLength: password.length,
  };

  return mockUsersByKey[userKey];
};

export const signup = async ({ identifier, role, password, displayName }) => {
  await delay();

  const normalizedIdentifier = normalizeIdentifier({ identifier, role });
  const userKey = buildUserKey({ identifier: normalizedIdentifier, role });

  // signup stores a fuller profile than login does because the form asks for a name
  mockUsersByKey[userKey] = {
    identifier: normalizedIdentifier,
    role,
    displayName: displayName.trim(),
    bio: '',
    location: 'Prince George, BC',
    profileImageUri: '',
    passwordHintLength: password.length,
  };

  return mockUsersByKey[userKey];
};

export const updateProfile = async ({ user, updates }) => {
  await delay(80);
  const userKey = buildUserKey({ identifier: user.identifier, role: user.role });

  // profile edits overwrite the stored mock user so the next screen sees fresh data
  const nextUser = {
    ...user,
    ...updates,
  };

  mockUsersByKey[userKey] = nextUser;
  return nextUser;
};

export const logout = async () => {
  await delay(40);
};
