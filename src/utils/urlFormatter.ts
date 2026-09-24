export const getBaseUrl = (input: string) => {
  let urlString = input.trim();

   if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    urlString = 'https://' + urlString;
   }
   try {
    const url = new URL(urlString);
    return url.origin; // Lấy domain gốc (kèm port nếu có)
   } catch (error) {
     console.error("Invalid URL format:", input);
    return urlString; // Fallback
   }
}