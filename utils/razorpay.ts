import Razorpay from "razorpay";

const key_id = process.env.RAZORPAY_KEY_ID as string;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string;

if (!key_id || !key_secret) {
  throw new Error("Razorpay API keys are missing in environment variables");
}

const instance = new Razorpay({
  key_id,
  key_secret,
});

export default instance;
