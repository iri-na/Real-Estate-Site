import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import path from 'path';

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// For sending magic sign-in links
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: true,
});

const emailsDir = path.resolve(process.cwd(), 'emails');

// Verification for Magic Link
const sendVerificationRequest = ({ identifier, url }) => {
    const emailFile = readFileSync(path.join(emailsDir, 'confirm-email.html'), {
        encoding: 'utf8',
    });
    const emailTemplate = Handlebars.compile(emailFile);
    transporter.sendMail({
        from: `"✨ SupaVacation" ${process.env.EMAIL_FROM}`,
        to: identifier,
        subject: 'Your sign-in link for SupaVacation',
        html: emailTemplate({
            base_url: process.env.NEXTAUTH_URL,
            signin_url: url,
            email: identifier,
        }),
    });
};

// Welcome Email After Logging In
const sendWelcomeEmail = async ({ user }) => {
    const { email } = user;

    try {
        const emailFile = readFileSync(path.join(emailsDir, 'welcome.html'), {
            encoding: 'utf8',
        });
        const emailTemplate = Handlebars.compile(emailFile);
        await transporter.sendMail({
            from: `"✨ SupaVacation" ${process.env.EMAIL_FROM}`,
            to: email,
            subject: 'Welcome to SupaVacation! 🎉',
            html: emailTemplate({
                base_url: process.env.NEXTAUTH_URL,
                support_email: 'support@themodern.dev',
            }),
        });
    } catch (error) {
        console.log(`❌ Unable to send welcome email to user (${email})`);
    }
};

export default NextAuth({
    providers: [
        // Magic Link Authentication
        EmailProvider({
            maxAge: 10 * 60,
            sendVerificationRequest,
        }),
    ],
    adapter: PrismaAdapter(prisma),
    pages: {
        // user will be redirected to homepage after
        signIn: '/',
        signOut: '/',
        error: '/',
        verifyRequest: '/',
    },
    events: { createUser: sendWelcomeEmail },
});
