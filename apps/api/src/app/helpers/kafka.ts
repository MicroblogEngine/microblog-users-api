import { Kafka, SASLOptions } from "kafkajs";
import { User } from "@ararog/microblog-users-api-db";

const CLIENT_ID = process.env.KAFKA_CLIENT_ID ?? 'microblog';

export const sendMessageToKafka = async (topic: string, user: User) => {

  const sasl: SASLOptions | undefined = process.env.NODE_ENV === 'production' ? {
    mechanism: process.env.KAFKA_SASL_MECHANISM as 'plain', // scram-sha-256 or scram-sha-512
    username: process.env.KAFKA_USER as string,
    password: process.env.KAFKA_PASSWORD as string
  } : undefined;

  const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER as string],
    sasl: sasl,
  });

  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(user) }],
  });
}