// import nodemailer from 'nodemailer';
// import type { ContactFormInput } from './validation';

// // Create reusable transporter
// function createTransporter() {
//   // For development, use a test account or configure SMTP
//   if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
//     console.log('Email service not configured. In development, emails will be logged to console.');
//     return null;
//   }

//   return nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: parseInt(process.env.SMTP_PORT || '587', 10),
//     secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });
// }

// export async function sendContactEmail(data: ContactFormInput): Promise<{
//   success: boolean;
//   message: string;
// }> {
//   const transporter = createTransporter();
//   const contactEmail = process.env.CONTACT_EMAIL || 'contact@devcodecare.in';

//   // Email content with basic HTML escaping
//   const htmlContent = `
//     <h2>New Contact Form Submission</h2>
//     <p><strong>From:</strong> ${escapeHtml(data.name)}</p>
//     <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
//     <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
//     <hr>
//     <h3>Message:</h3>
//     <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
//   `;

//   const textContent = `
// New Contact Form Submission

// From: ${data.name}
// Email: ${data.email}
// Subject: ${data.subject}

// Message:
// ${data.message}
//   `;

//   // In development without SMTP, just log the email
//   if (!transporter) {
//     console.log('=== Contact Form Email ===');
//     console.log(textContent);
//     console.log('=========================');
//     return { success: true, message: 'Message logged (development mode)' };
//   }

//   try {
//     await transporter.sendMail({
//       from: `"DevCodeCare Contact Form" <${process.env.SMTP_USER}>`,
//       replyTo: data.email,
//       to: contactEmail,
//       subject: `Contact Form: ${data.subject}`,
//       text: textContent,
//       html: htmlContent,
//     });

//     return { success: true, message: 'Your message has been sent. Thank you!' };
//   } catch (error) {
//     console.error('Email sending failed:', error);
//     return { success: false, message: 'Failed to send message. Please try again later.' };
//   }
// }

// // HTML escape function to prevent XSS in emails
// function escapeHtml(text: string): string {
//   const htmlEntities: Record<string, string> = {
//     '&': '&amp;',
//     '<': '&lt;',
//     '>': '&gt;',
//     '"': '&quot;',
//     "'": '&#039;',
//   };
//   return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
// }


export const runtime = 'edge';

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "hello@example.com",
      to: "you@example.com",
      subject: `Contact Form: ${name}`,
      text: message,
    }),
  });

  if (!response.ok) {
    return new Response("Failed to send email", { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
