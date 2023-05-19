import axios from 'axios';

export async function PostRequest<
  T extends object,
  Y extends object,
  Z extends object,
>(requestUrl: string, requestBody: T, requestMeta?: Y): Promise<Z> {
  return await axios.post(requestUrl, requestBody, requestMeta);
}
