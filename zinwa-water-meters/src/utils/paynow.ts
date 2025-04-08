import { Paynow } from "paynow";
import { logger } from "../utils/logger";

interface PaynowPaymentResponse {
  status: string;
  pollUrl?: string;
  redirectUrl?: string;
  error?: string;
  transactionReference: string;
}

class PaynowService {
  private paynow: Paynow;

  constructor() {
    const integrationId = process.env.PAYNOW_INTEGRATION_ID || "";
    const integrationKey = process.env.PAYNOW_INTEGRATION_KEY || "";
    const returnUrl = process.env.PAYNOW_RETURN_URL || "http://localhost:3000/payment/return";
    const resultUrl = process.env.PAYNOW_RESULT_URL || "http://localhost:5000/api/payments/update";
    
    this.paynow = new Paynow(integrationId, integrationKey);
    this.paynow.resultUrl = resultUrl;
    this.paynow.returnUrl = returnUrl;
  }

  async initiateTransaction(
    email: string,
    phone: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<PaynowPaymentResponse> {
    try {
      // Create payment
      const payment = this.paynow.createPayment(reference, email);
      
      // Add payment details
      payment.add(description, amount);
      
      // // Set up mobile payment if phone is provided
      // if (phone) {
      //   payment.setPhone(phone);
      // }
      
      // Send payment to Paynow
      const response = await this.paynow.send(payment);

      // Check if payment initiation was successful
      if (response.success) {
        return {
          status: "success",
          pollUrl: response.pollUrl,
          redirectUrl: response.redirectUrl || response.pollUrl,
          transactionReference: reference,
        };
      } else {
        logger.error("Paynow payment error:", response.error);
        return {
          status: "error",
          error: response.error || "Payment initiation failed",
          transactionReference: reference,
        };
      }
    } catch (error) {
      logger.error("Error initiating Paynow transaction:", error);
      throw new Error(`Failed to initiate Paynow transaction: ${(error as Error).message}`);
    }
  }

  async checkTransactionStatus(pollUrl: string): Promise<{
    status: string;
    amount?: number;
    reference?: string;
    paynowReference?: string;
    paid?: boolean;
  }> {
    try {
      const status = await this.paynow.pollTransaction(pollUrl);
      
      return {
        status: status.status,
        amount: status.amount,
        reference: status.reference,
        paynowReference: status.paynowReference,
        paid: status.paid,
      };
    } catch (error) {
      logger.error("Error checking Paynow transaction status:", error);
      throw new Error(`Failed to check transaction status: ${(error as Error).message}`);
    }
  }
}

export default new PaynowService();