const Messages = {
  USER: {
    LOGGIN_ERROR: 'Error at user resource',
    NOT_FOUND: 'User not found',
    ALREADY_EXISTS: 'An user with that email already exists',
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
    RETRIEVED: 'User retrieved successfully',
  },
  AUTH: {
    LOGIN_SUCCESS: 'User logged in successfully',
    LOGIN_ERROR: 'Error on user or password',
    REGISTER_SUCCESS: 'User registered successfully',
    REGISTER_ERROR: 'Error registering user',
    TOKEN_INVALID: 'Invalid or expired token',
  },
  POSITION: {
    NOT_FOUND: 'Position not found',
    CREATED: 'Position created successfully',
    UPDATED: 'Position updated successfully',
    DELETED: 'Position deleted successfully',
    RETRIEVED: 'Position retrieved successfully',
  },
  PROCESS: {
    NOT_FOUND: 'Process not found',
    CREATED: 'Process created successfully',
    UPDATED: 'Process updated successfully',
    DELETED: 'Process deleted successfully',
    RETRIEVED: 'Process retrieved successfully',
    STAGE_ADDED: 'Stage added successfully',
    CANDIDATE_ADDED: 'Candidate added successfully',
    CANDIDATE_UPDATED: 'Candidate updated successfully',
    CANDIDATE_REMOVED: 'Candidate removed successfully',
  },
  TALENT: {
    PROFILE_NOT_FOUND: 'Profile not found',
    PROFILE_UPDATED: 'Profile updated successfully',
    CV_UPLOADED: 'CV uploaded successfully',
    CV_DELETED: 'CV deleted successfully',
    CV_RETRIEVED: 'CV retrieved successfully',
  },
  STATS: {
    RETRIEVED: 'Stats retrieved successfully',
    GOAL_CREATED: 'Goal created successfully',
    GOAL_UPDATED: 'Goal updated successfully',
  },
  GENERAL: {
    INTERNAL_ERROR: 'Internal error from server',
    UNAUTHORIZED: 'Unauthorized',
    BAD_REQUEST: 'Incorrect request',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Resource not found',
  },
};

export default Messages;
