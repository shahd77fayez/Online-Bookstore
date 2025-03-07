import process from 'node:process';
import nodemailer from 'nodemailer';

export const createHtml = ({subject, title, username, message}) => {
  return `  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px #ccc; }
          .header { background: #007bff; color: white; text-align: center; padding: 10px; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; font-size: 16px; color: #333; }
          .footer { text-align: center; padding: 10px; font-size: 14px; color: #666; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>${title}</h2>
          </div>
          <div class="content">
              <p>Hello <b>${username}</b>,</p>
              <p>${message}</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Online Bookstore. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
};

export const sendEmail = async ({to, subject, title, username, message}) => {
  if (!to) {
    console.error('No recipient email provided!');
    throw new Error('No recipient email provided');
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {

      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  const htmlContent = createHtml({subject, title, username, message});

  const info = await transporter.sendMail({
    from: `"Online Book Store" <${process.env.EMAIL}>`,
    to,
    subject,
    html: htmlContent
  });
  return !info.rejected.length;
};
