import { SignupDetailsForm } from "@ararog/microblog-types"
import {createChannel, createClient, Metadata} from 'nice-grpc';

import {ProfilesServiceClient, ProfilesServiceDefinition} from '@ararog/microblog-rpc';
import { Profile } from "@/models/profiles";

export const createProfile = async (userId: string, data: SignupDetailsForm) => {
  const channel = createChannel(process.env.PROFILES_RPC_HOST || 'localhost:8080');
  try {

    const client: ProfilesServiceClient = createClient(
      ProfilesServiceDefinition,
      channel,
    );

    const response = await client.createProfile({
      name: data.name,
      birthDate: data.birthDate,
    }, {
      metadata: new Metadata({
        'x-user-id': userId
      })
    });

    if (! response) {
      console.error("Failed to create profile");
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    channel.close();
  }
}

export const getProfile = async (userId: string) : Promise<Profile | undefined> => {
  const channel = createChannel(process.env.PROFILES_RPC_HOST || 'localhost:8080');
  try {

    const client: ProfilesServiceClient  = createClient(
      ProfilesServiceDefinition,
      channel,
    );

    const response = await client.getProfileByUserId({
      id: userId
    });

    if (! response) {
      console.error("Failed to load profile");
      return undefined;
    }
    return response.profile;
  } catch (error) {
    console.error(error);
    return undefined;
  } finally {
    channel.close();
  }
}