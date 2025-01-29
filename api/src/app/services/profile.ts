import { SignupDetailsForm } from "@ararog/microblog-types"

import { api } from "@/helpers/clientApi";
import { Profile } from "@/models/profiles";
import { logger } from "@/helpers/pino";

const log = logger.child({
  service: "profile"
});

export const createProfile = async (data: SignupDetailsForm, token: string) => {
  
  try {
    const response = await api.post('/profiles', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (! response.ok) {
      log.error(response.data);
      return false;
    }
    return true;
  } catch (error) {
    log.error(error);
    return false;
  }
}

export const getProfile = async (token: string) => {
  try {
    const response = await api.get<Profile>(`/profiles/me`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (! response.ok) {
      log.error(response.data);
      return null;
    }
    return response.data;
  } catch (error) {
    log.error(error);
    return null;
  }
}