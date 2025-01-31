import { SignupDetailsForm } from "@ararog/microblog-types"
import {createChannel, createClient, Metadata} from 'nice-grpc';
import {logger} from '@ararog/microblog-server';

import {ProfileServiceDefinition, ProfileServiceClient} from '@ararog/microblog-rpc';
import { Profile } from "@/models/profiles";

const log = logger.child({
  service: "profile"
});

export const createProfile = async (userId: string, data: SignupDetailsForm) => {
  
  const channel = createChannel(process.env.PROFILES_RPC_HOST || 'localhost:8080');
  try {

    const client: ProfileServiceClient = createClient(
      ProfileServiceDefinition,
      channel,
    );

    const response = await client.createProfile({
      name: data.name,
      dateOfBirth: data.birthDate,
    }, {
      metadata: new Metadata({
        'x-user-id': userId
      })
    });

    if (! response) {
      log.error("Failed to create profile");
      return false;
    }
    return true;
  } catch (error) {
    log.error(error);
    return false;
  } finally {
    channel.close();
  }
}

export const getProfile = async (userId: string) : Promise<Profile | undefined> => {
  const channel = createChannel(process.env.PROFILES_RPC_HOST || 'localhost:8080');
  try {

    const client: ProfileServiceClient  = createClient(
      ProfileServiceDefinition,
      channel,
    );

    const response = await client.getProfileByUserId({
      id: userId
    });

    if (! response) {
      log.error("Failed to load profile");
      return undefined;
    }
    return {
      id: response.id,
      name: response.name,
    };
  } catch (error) {
    log.error(error);
    return undefined;
  } finally {
    channel.close();
  }
}