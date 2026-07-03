import "server-only";

/**
 * Bir promise'i zaman aşımına bağlar. Dış API çağrıları (Gemini vb.)
 * sonsuza kadar askıda kalıp 'processing' kayıtları kilitleyemesin.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} zaman aşımına uğradı, lütfen tekrar deneyin.`)),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
