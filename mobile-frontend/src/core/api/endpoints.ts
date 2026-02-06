export const API_ENDPOINTS = {
  events: {
    list: '/events/',
    detail: (id: string) => `/events/${id}/`,
  },
  // Future endpoints can be added here:
  // auth: {
  //   login: '/auth/login',
  //   register: '/auth/register',
  // },
  // users: {
  //   profile: '/users/profile',
  // },
} as const;
