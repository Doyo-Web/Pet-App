declare module "expo-razorpay" {
  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    image?: string;
    handler?: (response: any) => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<void>;
  };

  export default RazorpayCheckout;
}
