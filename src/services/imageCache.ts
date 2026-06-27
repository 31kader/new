import { get as getIDB, set as setIDB } from 'idb-keyval';

const objectUrlMap = new Map<string, string>();

export async function getLocalImage(url: string): Promise<string | null> {
  if (!url) return null;
  
  if (objectUrlMap.has(url)) {
    return objectUrlMap.get(url)!;
  }
  
  try {
    const cachedBlob = await getIDB(`img_${url}`);
    if (cachedBlob instanceof Blob) {
      const objUrl = URL.createObjectURL(cachedBlob);
      objectUrlMap.set(url, objUrl);
      return objUrl;
    }
  } catch (err) {
    console.warn('[ImageCache] Error loading from IDB', err);
  }
  return null;
}

export async function cacheImage(url: string): Promise<string | null> {
  if (!url) return null;
  
  if (objectUrlMap.has(url)) {
    return objectUrlMap.get(url)!;
  }
  
  try {
    const cachedBlob = await getIDB(`img_${url}`);
    if (cachedBlob instanceof Blob) {
      const objUrl = URL.createObjectURL(cachedBlob);
      objectUrlMap.set(url, objUrl);
      return objUrl;
    }
    
    const response = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    
    await setIDB(`img_${url}`, blob);
    const objUrl = URL.createObjectURL(blob);
    objectUrlMap.set(url, objUrl);
    return objUrl;
  } catch (err) {
    console.warn(`[ImageCache] Failed to fetch and cache image: ${url}`, err);
    return null;
  }
}
