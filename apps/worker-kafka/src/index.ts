import { Kafka } from "kafkajs";
import { Topics } from "@ararog/microblog-server";
import { sendResetPasswordMail, sendVerificationMail } from "@/services/mail";

const CLIENT_ID = process.env.KAFKA_CLIENT_ID ?? 'microblog';
const GROUP_ID = process.env.KAFKA_GROUP_ID ?? 'microblog';

const startKafka = async () => {
  console.info('Starting Kafka consumer');

  const sasl = process.env.NODE_ENV === 'production' ? {
    mechanism: 'plain', // scram-sha-256 or scram-sha-512
    username: process.env.KAFKA_USER as string,
    password: process.env.KAFKA_PASSWORD as string
  } : {};

  const kafka = new Kafka({
    clientId: CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    ...sasl,
  });
  
  const consumer = kafka.consumer({ groupId: GROUP_ID })
  await consumer.connect()
  await consumer.subscribe({ topic: Topics.SEND_VERIFICATION_MAIL, fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (topic === Topics.SEND_VERIFICATION_MAIL) {
        const data = JSON.parse(message.value?.toString() ?? '');
        await sendVerificationMail(data);
      } else if (topic === Topics.SEND_RESET_PASSWORD_MAIL) {
        const data = JSON.parse(message.value?.toString() ?? '');
        await sendResetPasswordMail(data);
      }
    },
  })
}

startKafka();