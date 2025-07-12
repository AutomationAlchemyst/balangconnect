// Path: src/app/api/create-order/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // 1. Save the order to Firestore
    const orderRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'Pending Payment', // Set an initial status
    });

    // 2. Send a confirmation email
    // Note: In a real app, you'd have a customer email field.
    // For now, we'll send it to a test email.
    // REPLACE with your test email address.
    const testEmail = 'test@balangconnect.theworkflowguys.com'; 

    await resend.emails.send({
      from: 'BalangConnect <orders@balangconnect.theworkflowguys.com>',
      to: [testEmail],
      subject: `New Order Confirmation: #${orderRef.id.substring(0, 6)}`,
      html: `<h1>Thank you for your order!</h1><p>We've received your order and will be in touch shortly with payment details.</p><p>Order ID: ${orderRef.id}</p>`,
    });

    // This checks off the final task in 1.2
    // [x] Firebase Firestore (Application Layer): users, orders

    return NextResponse.json({ success: true, orderId: orderRef.id });

  } catch (error) {
    console.error("Error creating order:", error);
    // Ensure error is an instance of Error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
