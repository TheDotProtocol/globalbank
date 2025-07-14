import nodemailer from 'nodemailer';

// Email configuration for Resend
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY,
  },
});

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@globalbank.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

// Email templates
export const emailTemplates = {
  welcome: (userName: string, email: string, accountNumber?: string) => ({
    subject: 'Welcome to GlobalBank! 🏦',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to GlobalBank!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your digital banking journey starts here</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to GlobalBank! We're excited to have you as part of our digital banking family. 
            Your account has been successfully created and you're now ready to experience modern banking.
          </p>
          
          ${accountNumber ? `
          <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-bottom: 15px;">📋 Your Account Details</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Account Number:</strong> ${accountNumber}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Account Type:</strong> Savings Account</p>
            <p style="color: #666; margin: 5px 0;"><strong>Currency:</strong> USD</p>
          </div>
          ` : ''}
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Complete your KYC verification</li>
              <li>Set up two-factor authentication</li>
              <li>Explore our fixed deposit options</li>
              <li>Try our AI assistant, BankBugger</li>
              <li>Generate virtual cards for secure payments</li>
              <li>Use e-checks for digital payments</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            If you have any questions, our support team is here to help. 
            You can also chat with our AI assistant, BankBugger, for instant help.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The GlobalBank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This email was sent to ${email}</p>
          <p>© 2024 GlobalBank. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Welcome to GlobalBank!

Hello ${userName}!

Welcome to GlobalBank! We're excited to have you as part of our digital banking family. 
Your account has been successfully created and you're now ready to experience modern banking.

${accountNumber ? `
Your Account Details:
Account Number: ${accountNumber}
Account Type: Savings Account
Currency: USD
` : ''}

What's Next?
- Complete your KYC verification
- Set up two-factor authentication  
- Explore our fixed deposit options
- Try our AI assistant, BankBugger
- Generate virtual cards for secure payments
- Use e-checks for digital payments

Login to your account: ${process.env.NEXT_PUBLIC_APP_URL}/login

If you have any questions, our support team is here to help.

Best regards,
The GlobalBank Team
    `
  }),

  transactionNotification: (userName: string, transactionType: string, amount: number, description: string) => ({
    subject: `Transaction ${transactionType === 'credit' ? 'Received' : 'Sent'} - $${amount.toFixed(2)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Transaction Notification</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${transactionType === 'credit' ? 'Money Received' : 'Payment Sent'}</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
          
          <div style="background: ${transactionType === 'credit' ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${transactionType === 'credit' ? '#28a745' : '#dc3545'};">
            <h3 style="color: #333; margin-bottom: 10px;">
              ${transactionType === 'credit' ? '✅ Money Received' : '💸 Payment Sent'}
            </h3>
            <p style="color: #666; margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Description:</strong> ${description}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Transaction Details
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you didn't authorize this transaction, please contact our support team immediately.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The GlobalBank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 GlobalBank. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Transaction Notification

Hello ${userName}!

${transactionType === 'credit' ? '✅ Money Received' : '💸 Payment Sent'}

Amount: $${amount.toFixed(2)}
Description: ${description}
Date: ${new Date().toLocaleDateString()}

View transaction details: ${process.env.NEXT_PUBLIC_APP_URL}

If you didn't authorize this transaction, please contact our support team immediately.

Best regards,
The GlobalBank Team
    `
  }),

  securityAlert: (userName: string, alertType: string, details: string) => ({
    subject: `Security Alert - ${alertType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Security Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${alertType}</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
          
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #333; margin-bottom: 10px;">⚠️ Security Alert</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Type:</strong> ${alertType}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Details:</strong> ${details}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Security Settings
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If this activity was not authorized by you, please contact our support team immediately.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The GlobalBank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 GlobalBank. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Security Alert

Hello ${userName}!

⚠️ Security Alert

Type: ${alertType}
Details: ${details}
Time: ${new Date().toLocaleString()}

Review security settings: ${process.env.NEXT_PUBLIC_APP_URL}/profile

If this activity was not authorized by you, please contact our support team immediately.

Best regards,
The GlobalBank Team
    `
  }),

  kycStatus: (userName: string, status: string) => ({
    subject: `KYC Status Update - ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">KYC Status Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${status}</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-bottom: 10px;">📋 KYC Status Update</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Status:</strong> ${status}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View KYC Status
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for your patience during the verification process.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The GlobalBank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 GlobalBank. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
KYC Status Update

Hello ${userName}!

📋 KYC Status Update

Status: ${status}
Date: ${new Date().toLocaleDateString()}

View KYC status: ${process.env.NEXT_PUBLIC_APP_URL}/profile

Thank you for your patience during the verification process.

Best regards,
The GlobalBank Team
    `
  })
};

// Email sending functions
export const sendWelcomeEmail = async (userEmail: string, userName: string, accountNumber?: string) => {
  const template = emailTemplates.welcome(userName, userEmail, accountNumber);
  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendTransactionNotification = async (userEmail: string, userName: string, transactionType: string, amount: number, description: string) => {
  const template = emailTemplates.transactionNotification(userName, transactionType, amount, description);
  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendSecurityAlert = async (userEmail: string, userName: string, alertType: string, details: string) => {
  const template = emailTemplates.securityAlert(userName, alertType, details);
  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendKYCStatusEmail = async (userEmail: string, userName: string, status: string) => {
  const template = emailTemplates.kycStatus(userName, status);
  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}; 