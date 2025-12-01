/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    TWILIO_ACCOUNT_SID: process.env.AC94c7baafaf78a1951ab2427e004310e3,
    TWILIO_AUTH_TOKEN: process.env.184adf49a4ad8e5dc987e019aa930edf,
    TWILIO_NUMBER: process.env.+1415523-8886,
    ADMIN_WHATSAPP: process.env.557588669207,
    DATABASE_URL: process.env.postgresql://postgres.uaasrealnqocaynryvlg:theuzin123@aws-0-sa-east-1.pooler.supabase.com:6543/postgres,
    BASE_URL: process.env.https://milly-nails-ak7y.vercel.app
  },
}

module.exports = nextConfig