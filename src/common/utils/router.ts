function transformRouterParams<T>(params: Record<keyof T, string | number | undefined>) {
  return Object.entries(params)
    .map((item) => item.join('='))
    .join('&');
}

export { transformRouterParams };
