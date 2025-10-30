// src/hooks/useAuth.js
export default function useAuth() {
  return {
    token: localStorage.getItem('authToken'),
    userName: localStorage.getItem('userName'),
    userRole: localStorage.getItem('userRole')
  };
}
