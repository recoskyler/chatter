/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { dev } from "$app/environment";
import {
  SMTP_PASSWORD,
  SMTP_USERNAME,
  SMTP_SERVER,
  VITE_HOSTNAME,
  EMAIL_VERIFICATION_EXPIRATION,
  // SMTP_PORT,
} from "$env/static/private";
import { SMTPClient } from "emailjs";

export const mailer = new SMTPClient({
  user: SMTP_USERNAME,
  password: SMTP_PASSWORD,
  host: SMTP_SERVER,
  tls: true,
});

export const sendEmailVerificationEmail = async (to: string, token: string) => {
  try {
    const link = `${dev ? "http://localhost:5173" : `https://${VITE_HOSTNAME}`}/email-verification/${token}`;

    // eslint-disable-next-line max-len
    const content = `Welcome to Chatter!\n\nTo finalize creating your account, please verify your email by clicking the link below within ${EMAIL_VERIFICATION_EXPIRATION} minutes:\n\n${link}`;

    const message = await mailer.sendAsync({
      text: content,
      from: "noreply@recoskyler.com",
      to: to,
      subject: "Chatter | Email Verification",
    });

    console.log(message);

    return true;
  } catch (err) {
    console.error(err);
  }

  return false;
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  try {
    const link = `${dev ? "http://localhost:5173" : `https://${VITE_HOSTNAME}`}/password-reset/${token}`;

    // eslint-disable-next-line max-len
    const content = `Reset your password by clicking the link below within ${EMAIL_VERIFICATION_EXPIRATION} minutes. If you have not requested a password reset, then you can safely ignore this email.\n\n${link}`;

    const message = await mailer.sendAsync({
      text: content,
      from: "noreply@recoskyler.com",
      to: to,
      subject: "Chatter | Password Reset",
    });

    console.log(message);

    return true;
  } catch (err) {
    console.error(err);
  }

  return false;
};
