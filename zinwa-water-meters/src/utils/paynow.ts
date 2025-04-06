import axios from "axios"
import crypto from "crypto"
import { logger } from "./logger"

interface PaynowPaymentResponse {
  status: string
  pollUrl?: string
  error?: string
  transactionReference: string
}

class PaynowService {
  private integrationId: string
  private integrationKey: string
  private returnUrl: string
  private resultUrl: string
  private paynowUrl: string

  constructor() {
    this.integrationId = process.env.PAYNOW_INTEGRATION_ID || ""
    this.integrationKey = process.env.PAYNOW_INTEGRATION_KEY || ""
    this.returnUrl = process.env.PAYNOW_RETURN_URL || "http://localhost:3000/payment/return"
    this.resultUrl = process.env.PAYNOW_RESULT_URL || "http://localhost:5000/api/payments/update"
    this.paynowUrl = process.env.PAYNOW_URL || "https://www.paynow.co.zw/interface/initiatetransaction"
  }

  private createHash(values: string): string {
    return crypto.createHash("md5").update(values).digest("hex").toUpperCase()
  }

  private parsePaynowResponse(response: string): Record<string, string> {
    const result: Record<string, string> = {}
    response.split("&").forEach((item) => {
      const [key, value] = item.split("=")
      result[key] = value
    })
    return result
  }

  async initiateTransaction(
    email: string,
    phone: string,
    amount: number,
    reference: string,
    description: string,
  ): Promise<PaynowPaymentResponse> {
    try {
      // Build payment data
      const paymentData = {
        id: this.integrationId,
        reference,
        amount: amount.toFixed(2),
        email,
        phone,
        description,
        returnurl: this.returnUrl,
        resulturl: this.resultUrl,
        authemail: email,
        status: "Message",
      }

      // Create string to hash
      let hashString = ""
      Object.entries(paymentData).forEach(([key, value]) => {
        hashString += `${value}`
      })
      hashString += this.integrationKey

      // Generate hash
      const hash = this.createHash(hashString)

      // Add hash to payment data
      const requestData = new URLSearchParams({
        ...paymentData,
        hash,
      })

      // Send request to Paynow
      const response = await axios.post(this.paynowUrl, requestData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      // Parse response
      const parsedResponse = this.parsePaynowResponse(response.data)

      if (parsedResponse.status.toLowerCase() === "error") {
        logger.error("Paynow payment error:", parsedResponse.error)
        return {
          status: "error",
          error: parsedResponse.error,
          transactionReference: reference,
        }
      }

      return {
        status: parsedResponse.status,
        pollUrl: parsedResponse.pollurl,
        transactionReference: reference,
      }
    } catch (error) {
      logger.error("Error initiating Paynow transaction:", error)
      throw error
    }
  }

  async checkTransactionStatus(pollUrl: string): Promise<any> {
    try {
      const response = await axios.get(pollUrl)
      const parsedResponse = this.parsePaynowResponse(response.data)
      return parsedResponse
    } catch (error) {
      logger.error("Error checking Paynow transaction status:", error)
      throw error
    }
  }
}

export default new PaynowService()

