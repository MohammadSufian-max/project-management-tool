
export function readStorage<T>(
  key: string,
  initialData: T,
): T {
  try {
    const savedData = localStorage.getItem(key);

    if (savedData === null) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }

    return JSON.parse(savedData) as T;
  } catch (error) {
    console.error(`Failed to read storage key "${key}"`, error);
    return initialData;
  }
}

export function writeStorage<T>(
  key: string,
  data: T,
): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save storage key "${key}"`, error);
    throw error;
  }
}
