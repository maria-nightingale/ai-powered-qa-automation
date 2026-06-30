export const env = {
  url: (process.env.DIDAXIS_URL ?? process.env.BASE_URL ?? '').replace(/\/$/, ''),
  email: process.env.DIDAXIS_EMAIL ?? process.env.ADMIN_EMAIL ?? '',
  password: process.env.DIDAXIS_PASSWORD ?? process.env.ADMIN_PASSWORD ?? '',
  nonAdminEmail: process.env.DIDAXIS_INSTRUCTOR_EMAIL ?? process.env.NON_ADMIN_EMAIL ?? '',
  nonAdminPassword: process.env.DIDAXIS_INSTRUCTOR_PASSWORD ?? process.env.NON_ADMIN_PASSWORD ?? '',
};

if (!env.url || !env.email || !env.password) {
  throw new Error(
    'Missing Didaxis credentials. Set DIDAXIS_URL, DIDAXIS_EMAIL, and DIDAXIS_PASSWORD in .env',
  );
}
