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

// Fallback transporter for development (logs emails instead of sending)
const devTransporter = {
  sendMail: async (mailOptions: any) => {
    console.log('📧 DEVELOPMENT EMAIL (not sent):', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html ? 'HTML content present' : 'No HTML content'
    });
    return { messageId: 'dev-' + Date.now() };
  }
};

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@globaldotbank.org',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    };

    // Use development transporter if no SMTP credentials or in development
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY;
    const currentTransporter = isDevelopment ? devTransporter : transporter;

    const info = await currentTransporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // In development, don't fail if email sending fails
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would have been sent in production');
      return { success: true, messageId: 'dev-fallback' };
    }
    
    return { success: false, error };
  }
};

// Email templates
export const emailTemplates = {
  welcome: (userName: string, email: string, accountNumber?: string) => ({
    subject: 'Welcome to Global Dot Bank! 🏦',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Global Dot Bank!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your digital banking journey starts here</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Global Dot Bank! We're excited to have you as part of our digital banking family. 
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
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyc/verification" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete KYC Verification
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            If you have any questions, our support team is here to help. 
            You can also chat with our AI assistant, BankBugger, for instant help.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Global Dot Bank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This email was sent to ${email}</p>
          <p>© 2024 Global Dot Bank. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Welcome to Global Dot Bank!

Hello ${userName}!

Welcome to Global Dot Bank! We're excited to have you as part of our digital banking family. 
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

Complete KYC verification: ${process.env.NEXT_PUBLIC_APP_URL}/kyc/verification

If you have any questions, our support team is here to help.

Best regards,
The Global Dot Bank Team
    `
  }),

  kycApproved: (userName: string, email: string) => ({
    subject: '🎉 KYC Verification Approved - Welcome to Global Dot Bank!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">KYC Verification Approved!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account is now fully activated</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your KYC verification has been approved! Your Global Dot Bank account is now fully activated 
            and you can access all our banking features.
          </p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #333; margin-bottom: 15px;">✅ What You Can Do Now</h3>
            <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Access your dashboard</li>
              <li>Create virtual cards</li>
              <li>Set up fixed deposits</li>
              <li>Make transfers and payments</li>
              <li>Use e-checks</li>
              <li>Chat with BankBugger AI</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for choosing Global Dot Bank. We're here to make your banking experience seamless and secure.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Global Dot Bank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This email was sent to ${email}</p>
          <p>© 2024 Global Dot Bank. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  kycRejected: (userName: string, email: string, reason?: string) => ({
    subject: '⚠️ KYC Verification Update - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">KYC Verification Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Action required to complete verification</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received your KYC verification submission, but we need additional information to complete the process.
          </p>
          
          ${reason ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #333; margin-bottom: 15px;">📋 Additional Information Required</h3>
            <p style="color: #666; margin: 5px 0;">${reason}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/kyc/verification" 
               style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete KYC Verification
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you need assistance, please contact our support team. We're here to help you complete the verification process.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Global Dot Bank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This email was sent to ${email}</p>
          <p>© 2024 Global Dot Bank. All rights reserved.</p>
        </div>
      </div>
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
            The Global Dot Bank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Global Dot Bank. All rights reserved.</p>
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
The Global Dot Bank Team
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
            The Global Dot Bank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Global Dot Bank. All rights reserved.</p>
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
The Global Dot Bank Team
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
            The Global Dot Bank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Global Dot Bank. All rights reserved.</p>
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
The Global Dot Bank Team
    `
  }),

  passwordReset: (resetUrl: string) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Reset your password</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Global Dot Bank account.
            To proceed with the password reset, please click the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you did not request this password reset, please ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Global Dot Bank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Global Dot Bank. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Password Reset Request

Hello!

We received a request to reset your password for your Global Dot Bank account.
To proceed with the password reset, please click the button below.

${resetUrl}

If you did not request this password reset, please ignore this email.

Best regards,
The Global Dot Bank Team
    `
  }),

  emailVerification: (verificationUrl: string) => ({
    subject: 'Email Verification Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6c5ce7 0%, #7d5fff 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Email Verification</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Verify your email address</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with Global Dot Bank! To complete your registration,
            please click the button below to verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #6c5ce7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you did not create an account with Global Dot Bank, please disregard this email.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Global Dot Bank Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2024 Global Dot Bank. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Email Verification Required

Hello!

Thank you for registering with Global Dot Bank! To complete your registration,
please click the button below to verify your email address.

${verificationUrl}

If you did not create an account with Global Dot Bank, please disregard this email.

Best regards,
The Global Dot Bank Team
    `
  })
};

// Helper functions
export const sendWelcomeEmail = async (userEmail: string, userName: string, accountNumber?: string) => {
  const template = emailTemplates.welcome(userName, userEmail, accountNumber);
  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html
  });
};

export const sendKYCApprovedEmail = async (userEmail: string, userName: string) => {
  const template = emailTemplates.kycApproved(userName, userEmail);
  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html
  });
};

export const sendKYCRejectedEmail = async (userEmail: string, userName: string, reason?: string) => {
  const template = emailTemplates.kycRejected(userName, userEmail, reason);
  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html
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
    ...template
  });
};

export const sendPasswordResetEmail = async (userEmail: string, resetUrl: string) => {
  const template = emailTemplates.passwordReset(resetUrl);
  return await sendEmail({
    to: userEmail,
    ...template
  });
};

export const sendVerificationEmail = async (userEmail: string, verificationUrl: string) => {
  const template = emailTemplates.emailVerification(verificationUrl);
  return await sendEmail({
    to: userEmail,
    ...template
  });
};

interface KYCStatusEmailParams {
  email: string;
  firstName: string;
  lastName: string;
  status: 'APPROVED' | 'REJECTED';
  documentType: string;
  adminNotes?: string;
}

export async function sendKYCStatusEmail({
  email,
  firstName,
  lastName,
  status,
  documentType,
  adminNotes
}: KYCStatusEmailParams) {
  try {
    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = status === 'APPROVED' 
      ? '🎉 Your KYC Verification is Approved!'
      : '⚠️ KYC Verification Update';

    const htmlContent = status === 'APPROVED' 
      ? generateApprovalEmail({ firstName, lastName, documentType, adminNotes })
      : generateRejectionEmail({ firstName, lastName, documentType, adminNotes });

    const textContent = status === 'APPROVED'
      ? `Dear ${firstName} ${lastName},\n\nYour KYC verification has been approved! You can now access all banking features.\n\nBest regards,\nGlobal Dot Bank Team`
      : `Dear ${firstName} ${lastName},\n\nYour KYC verification requires attention. Please review the details and resubmit if needed.\n\nBest regards,\nGlobal Dot Bank Team`;

    // Send email
    const info = await transporter.sendMail({
      from: `"Global Dot Bank" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

function generateApprovalEmail({ firstName, lastName, documentType, adminNotes }: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>KYC Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">🎉</div>
          <h1>KYC Verification Approved!</h1>
        </div>
        <div class="content">
          <h2>Dear ${firstName} ${lastName},</h2>
          <p>Great news! Your KYC verification has been <strong>approved</strong> successfully.</p>
          
          <h3>Document Details:</h3>
          <ul>
            <li><strong>Document Type:</strong> ${documentType}</li>
            <li><strong>Status:</strong> ✅ Approved</li>
            <li><strong>Approved Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>

          ${adminNotes ? `<h3>Admin Notes:</h3><p>${adminNotes}</p>` : ''}

          <p>You can now access all banking features including:</p>
          <ul>
            <li>✅ Full account access</li>
            <li>✅ Money transfers</li>
            <li>✅ Fixed deposits</li>
            <li>✅ Virtual cards</li>
            <li>✅ E-checks</li>
          </ul>

          <a href="https://globaldotbank.org/dashboard" class="button">Access Your Dashboard</a>

          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>
          <strong>Global Dot Bank Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© 2025 Global Dot Bank. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateRejectionEmail({ firstName, lastName, documentType, adminNotes }: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>KYC Update Required</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-icon { font-size: 48px; margin-bottom: 20px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="warning-icon">⚠️</div>
          <h1>KYC Verification Update</h1>
        </div>
        <div class="content">
          <h2>Dear ${firstName} ${lastName},</h2>
          <p>We need to inform you that your KYC verification requires attention.</p>
          
          <h3>Document Details:</h3>
          <ul>
            <li><strong>Document Type:</strong> ${documentType}</li>
            <li><strong>Status:</strong> ❌ Requires Review</li>
            <li><strong>Review Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>

          ${adminNotes ? `<h3>Admin Notes:</h3><p>${adminNotes}</p>` : ''}

          <p>Please review the feedback above and resubmit your documents if needed.</p>

          <a href="https://globaldotbank.org/kyc/verification" class="button">Resubmit Documents</a>

          <p>If you have any questions, please contact our support team for assistance.</p>
          
          <p>Best regards,<br>
          <strong>Global Dot Bank Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© 2025 Global Dot Bank. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 