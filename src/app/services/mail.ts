
import sgMail  from "@sendgrid/mail";
import Handlebars from "handlebars";
import { promises as fs } from 'fs';

const sendMail = async (to: string, subject: string, content: unknown, htmlTemplate: string ) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not set");
  }

  const file = await fs.readFile(process.cwd() + htmlTemplate, 'utf8');
  const template = Handlebars.compile(file);

  const html = template(content);

  sgMail.setApiKey(apiKey);

  const msg = {
    to: to,
    from: 'rogerio.araujo@gmail.com',
    subject: subject,
    html: html
  };

  await sgMail.send(msg);
};

export default sendMail;