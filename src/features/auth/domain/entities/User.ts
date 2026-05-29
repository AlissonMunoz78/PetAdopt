export type UserRole = 'adopter' | 'shelter';

export interface UserLocation {
  latitude:  number;
  longitude: number;
  address?:  string;
}

export interface User {
  id:         string;
  email:      string;
  username:   string;
  role:       UserRole;
  avatarUrl?: string;
  location?:  UserLocation;
}
