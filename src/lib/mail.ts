interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async (to: string, subject: string, content: string): Promise<Response> => {
    const result = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: to,
            subject: subject,
            html: content,
        } as EmailPayload),
    });
    return result;
};