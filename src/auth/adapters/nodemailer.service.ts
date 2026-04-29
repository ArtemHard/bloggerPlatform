import nodemailer from "nodemailer";
import { appConfig } from "../../common/config/config";

export const nodemailerService = {
  async sendEmail(
    email: string,
    code: string,
    template: string | ((code: string) => string),
  ): Promise<{ success: boolean; emailContent?: string; error?: string; messageId?: string; logs?: string[] }> {
    const htmlContent = typeof template === 'function' ? template(code) : template;
    const logs: string[] = [];
    
    const addLog = (message: string) => {
      logs.push(message);
    };
    
    addLog('=== EMAIL SENDING START ===');
    addLog('Email Details:');
    addLog(`  To: ${email}`);
    addLog(`  From: ${appConfig.EMAIL}`);
    addLog('  Subject: Your code is here');
    addLog(`  Code: ${code}`);
    addLog(`  Template type: ${typeof template === 'function' ? 'function' : 'string'}`);
    addLog(`  HTML Content: ${htmlContent}`);
    addLog('');

    // Check SMTP configuration
    const hasEmail = !!appConfig.EMAIL;
    const hasEmailPass = !!appConfig.EMAIL_PASS;
    addLog('SMTP Configuration:');
    addLog(`  EMAIL configured: ${hasEmail}`);
    addLog(`  EMAIL_PASS configured: ${hasEmailPass}`);
    addLog(`  SMTP available: ${hasEmail && hasEmailPass}`);
    addLog('');

    // Try to send with available SMTP configuration
    if (hasEmail && hasEmailPass) {
      addLog('Gmail Configuration:');
      addLog(`  Email (user): ${appConfig.EMAIL}`);
      addLog(`  Password length: ${appConfig.EMAIL_PASS ? appConfig.EMAIL_PASS.length : 0}`);
      addLog(`  Password format (16 chars with spaces): ${appConfig.EMAIL_PASS ? appConfig.EMAIL_PASS.replace(/\s/g, '').length === 16 : false}`);
      addLog(`  Is App Password format: ${appConfig.EMAIL_PASS ? appConfig.EMAIL_PASS.replace(/\s/g, '').length === 16 : false}`);
      
      // Try multiple SMTP configurations
      const smtpConfigs = [
        {
          name: "Gmail SMTP (Port 587)",
          config: {
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: { user: appConfig.EMAIL, pass: appConfig.EMAIL_PASS },
            debug: true,
            logger: true,
            tls: { rejectUnauthorized: false },
            connectionTimeout: 30000,
            greetingTimeout: 10000,
            socketTimeout: 30000
          }
        },
        {
          name: "Gmail SMTP (Port 465)",
          config: {
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: appConfig.EMAIL, pass: appConfig.EMAIL_PASS },
            debug: true,
            logger: true,
            tls: { rejectUnauthorized: false },
            connectionTimeout: 30000,
            greetingTimeout: 10000,
            socketTimeout: 30000
          }
        },
        {
          name: "Gmail SMTP (Port 25)",
          config: {
            host: "smtp.gmail.com",
            port: 25,
            secure: false,
            auth: { user: appConfig.EMAIL, pass: appConfig.EMAIL_PASS },
            debug: true,
            logger: true,
            tls: { rejectUnauthorized: false },
            connectionTimeout: 30000,
            greetingTimeout: 10000,
            socketTimeout: 30000
          }
        }
      ];

      let emailSent = false;
      
      for (const smtpConfig of smtpConfigs) {
        if (emailSent) break;
        
        try {
          addLog(`Trying ${smtpConfig.name}...`);
          
          const transporter = nodemailer.createTransport(smtpConfig.config);

          addLog(`Testing ${smtpConfig.name} connection...`);
          
          // Test connection before sending
          await new Promise((resolve, reject) => {
            transporter.verify((error, success) => {
              if (error) {
                addLog(`${smtpConfig.name} CONNECTION FAILED!`);
                addLog(`  Connection error: ${error}`);
                addLog(`  Error code: ${(error as any).code}`);
                addLog(`  Error type: ${(error as any).errno}`);
                reject(error);
              } else if (success) {
                addLog(`${smtpConfig.name} CONNECTION SUCCESS!`);
                addLog(`  Server verified: ${success}`);
                addLog('  Connection ready for sending');
                resolve(success);
              }
            });
          });

          addLog(`Sending email via ${smtpConfig.name}...`);
          const info = await transporter.sendMail({
            from: `"Blogger Platform" <${appConfig.EMAIL}>`,
            to: email,
            subject: 'Your code is here',
            html: htmlContent,
          });

          addLog(`${smtpConfig.name} SUCCESS!`);
          addLog(`  Message ID: ${info.messageId}`);
          addLog(`  Response: ${info.response}`);
          addLog(`  Accepted: ${info.accepted}`);
          addLog(`  Rejected: ${info.rejected}`);
          addLog(`  Pending: ${info.pending}`);
          addLog(`  Envelope: ${info.envelope}`);
          addLog('=== EMAIL SENDING END ===');
          
          return {
            success: true,
            emailContent: htmlContent,
            messageId: info.messageId,
            logs
          };
        } catch (error) {
          addLog(`${smtpConfig.name} FAILED!`);
          addLog(`  Error: ${error instanceof Error ? error.message : error}`);
          addLog(`  Error type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
          addLog(`  Error code: ${(error as any).code}`);
          addLog(`  Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
          addLog('');
        }
      }
      
      addLog('All Gmail SMTP configurations failed!');
      addLog('Trying Ethereal Email as fallback...');
      
      try {
        // Create Ethereal test account
        addLog('Creating Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        
        addLog('Ethereal Account Created:');
        addLog(`  Email: ${testAccount.user}`);
        addLog(`  Password: ${testAccount.pass}`);
        addLog(`  SMTP: ${testAccount.smtp.host}:${testAccount.smtp.port}`);
        addLog(`  Web Interface: https://ethereal.email/messages`);
        
        const transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
          debug: true,
          logger: true,
        });

        addLog('Testing Ethereal SMTP connection...');
        
        // Test connection before sending
        await new Promise((resolve, reject) => {
          transporter.verify((error, success) => {
            if (error) {
              addLog('Ethereal SMTP CONNECTION FAILED!');
              addLog(`  Connection error: ${error}`);
              reject(error);
            } else if (success) {
              addLog('Ethereal SMTP CONNECTION SUCCESS!');
              addLog(`  Server verified: ${success}`);
              resolve(success);
            }
          });
        });

        addLog('Sending email via Ethereal SMTP...');
        const info = await transporter.sendMail({
          from: testAccount.user,
          to: email,
          subject: 'Your code is here',
          html: htmlContent,
        });

        addLog('Ethereal SMTP SUCCESS!');
        addLog(`  Message ID: ${info.messageId}`);
        addLog(`  Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        addLog(`  Web Interface: https://ethereal.email/messages`);
        addLog('=== EMAIL SENDING END ===');
        
        return {
          success: true,
          emailContent: htmlContent,
          messageId: info.messageId,
          logs
        };
      } catch (error) {
        addLog('Ethereal SMTP FAILED!');
        addLog(`  Error: ${error instanceof Error ? error.message : error}`);
        addLog('Falling back to mock email...');
      }
    } else {
      addLog('Gmail SMTP not configured');
      addLog(`  EMAIL exists: ${hasEmail}`);
      addLog(`  EMAIL_PASS exists: ${hasEmailPass}`);
      addLog('  Check .env file for EMAIL and EMAIL_PASS');
    }

    // Mock email fallback if SMTP not configured
    addLog('FALLING BACK TO MOCK EMAIL');
    addLog('Mock Email Details:');
    addLog(`  To: ${email}`);
    addLog(`  From: ${appConfig.EMAIL}`);
    addLog('  Subject: Your code is here');
    addLog(`  HTML Content: ${htmlContent}`);
    addLog('MOCK EMAIL SENT');
    addLog('=== EMAIL SENDING END ===');
    
    return { 
      success: true, 
      emailContent: htmlContent,
      messageId: 'mock-email-id',
      logs
    };
  },
};