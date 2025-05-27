export function attachDevAuthInterceptor(instance, getToken, onMissingToken) {
  return instance.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    } else {
      onMissingToken();
    }
    return config;
  });
}
