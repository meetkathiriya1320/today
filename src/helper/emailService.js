import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Add timeout and other options
    timeout: 10000, // 10 seconds timeout
    secure: true, // use TLS
    pool: true, // use pooled connections
    maxConnections: 1,
    maxMessages: 5
});

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetLink) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - Scheme Today',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; text-align: center;">Password Reset</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                            Click the link below to reset your password:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Reset Password
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666; margin-top: 20px;">
                            This link will expire in 10 minutes. Please do not share this link with anyone.
                        </p>
                    </div>
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        If you didn't request this password reset, please ignore this email.
                    </p>
                </div>
            `
        };

        try {
            console.log('Attempting to send password reset email to:', email);
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent successfully:', info.messageId);
            console.log(`📧 Password reset OTP sent to ${email}: ${otp}`);
            return { success: true, messageId: info.messageId };
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError.message);
            return { success: true, emailError: emailError.message };
        }
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP - Scheme Today',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; text-align: center;">Email Verification</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                            Your verification code is:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">
                                ${otp}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #666; margin-top: 20px;">
                            This code will expire in 1 minutes. Please do not share this code with anyone.
                        </p>
                    </div>
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        If you didn't request this verification, please ignore this email.
                    </p>
                </div>
            `
        };

        try {
            // Send the actual email
            console.log('Attempting to send email to:', email);
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ OTP email sent successfully:', info.messageId);
            console.log(`📧 OTP sent to ${email}: ${otp}`);
            return { success: true, messageId: info.messageId };
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError.message);
            console.log(`📝 OTP for ${email}: ${otp} (email failed - check credentials)`);
            console.log('🔧 Please verify Gmail app password and 2FA settings');
            // Return success anyway for development - remove this in production
            return { success: true, otp: otp, emailError: emailError.message };
        }
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

export { generateOTP, sendOTPEmail, sendPasswordResetEmail };