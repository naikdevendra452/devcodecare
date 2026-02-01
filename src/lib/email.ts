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


import nodemailer from 'nodemailer';

export async function sendContactEmail({ name, email, subject, message, service, otherService }: { name: string; email: string; subject: string; message: string; service?: string; otherService?: string }) {
  const toAddress = process.env.CONTACT_EMAIL || 'devcodecare@gmail.com';

  const serviceLabels: Record<string, string> = {
    web: 'Web Development',
    mobile: 'Mobile App Development',
    support: 'Technical Support',
    cloud: 'Cloud & DevOps',
  };

  const serviceLabel = service === 'other' ? `Other: ${escapeHtml(otherService || '')}` : (service ? serviceLabels[service] || escapeHtml(service) : '');

  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    ${serviceLabel ? `<p><strong>Service:</strong> ${serviceLabel}</p>` : ''}
    <hr />
    <div>${escapeHtml(message).replace(/\n/g, '<br/>')}</div>
  `;

  const text = `From: ${name} <${email}>\nSubject: ${subject}${serviceLabel ? '\nService: ' + serviceLabel : ''}\n\n${message}`;

  // Prefer SMTP (nodemailer) when SMTP_* env vars are provided
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (smtpHost && smtpUser && smtpPass) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = (process.env.SMTP_SECURE || '') === 'true' || port === 465;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: toAddress,
        subject: `Contact Form: ${subject}${serviceLabel ? ' — ' + serviceLabel : ''}`,
        text,
        html,
        replyTo: email,
      });

      return { success: true, message: 'Your message has been sent. Thank you!' };
    } catch (err) {
      console.error('SMTP sendMail error:', err);
      return { success: false, message: (err instanceof Error) ? err.message : 'SMTP send failed' };
    }
  }

  // Fallback to Resend API if available
  if (process.env.RESEND_API_KEY) {
    const fromAddress = process.env.RESEND_FROM || `no-reply@${process.env.VERCEL_URL ?? 'devcodecare.local'}`;
    const payload = {
      from: fromAddress,
      to: toAddress,
      subject: `Contact Form: ${subject}${serviceLabel ? ' — ' + serviceLabel : ''}`,
      reply_to: email,
      html,
      text: text,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errText = 'Failed to send email (Resend)';
      try {
        const errJson = await response.json();
        errText = errJson?.error || JSON.stringify(errJson);
      } catch {}
      console.error('Resend error:', response.status, await response.text());
      return { success: false, message: errText };
    }

    return { success: true, message: 'Your message has been sent. Thank you!' };
  }

  // Development fallback: if no SMTP or Resend configured, log the email and return success
  console.log('=== Contact Form Email (development fallback) ===');
  console.log('To:', toAddress);
  console.log('Reply-To:', email);
  console.log('Subject:', `Contact Form: ${subject}`);
  console.log('Text:', text);
  console.log('HTML:', html);
  console.log('==============================================');
  return { success: true, message: 'Message logged (development mode)' };
}

// Minimal HTML escape helper
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
