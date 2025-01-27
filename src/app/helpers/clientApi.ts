import {create} from 'apisauce';

// define the api
export const api = create({
  baseURL: process.env.PROFILES_API_BASE_URL,
});
