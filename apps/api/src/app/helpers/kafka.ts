import { Kafka } from "kafkajs";
import { User } from "@ararog/microblog-users-api-db";

export const sendMessageToKafka = async (topic: string, user: User) => {

  const sasl = process.env.NODE_ENV === 'production' ? {
    mechanism: 'plain', // scram-sha-256 or scram-sha-512
    username: process.env.KAFKA_USER as string,
    password: process.env.KAFKA_PASSWORD as string
  } : {};


  const kafka = new Kafka({
    clientId: 'microblog',
    brokers: [process.env.KAFKA_BROKER as string],
    ...sasl,
  });

  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(user) }],
  });
}