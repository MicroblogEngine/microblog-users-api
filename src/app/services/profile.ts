import { SignupDetailsForm } from "@ararog/microblog-types"

import { api } from "@/helpers/clientApi";

export const createProfile = async (data: SignupDetailsForm, token: string) => {
  
  try {
    await api.post('/profiles', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error(error);
    return false;
  }

  return true
}