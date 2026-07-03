// Vitest ortamında "next/headers" yalnızca Next.js istek bağlamında çalışır.
// rate-limit.ts modülü import edilebilsin diye zararsız bir stub sağlanır;
// getClientIp() testlerde doğrudan çağrılmaz — bkz. vitest.config.ts.
export async function headers(): Promise<Headers> {
  return new Headers();
}
