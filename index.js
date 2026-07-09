const functions = require('@google-cloud/functions-framework');
// 1. FIX: Import and initialize the Pub/Sub library
const { PubSub } = require('@google-cloud/pubsub');
const pubsub = new PubSub();


// Register an HTTP function named "fast-ingress-function"
functions.http('fast-ingress-function', async (req, res) => {

  console.log('=========== Starting Fast Ingress ===========');


    // 1. Fetch the raw string from environment variables
  const rawIpString = process.env.TRUSTED_IP_WHITELIST || "";

  // 2. Convert it back into a Set safely
  const trustedIpWhitelist = new Set(
    rawIpString ? rawIpString.split(',').map(ip => ip.trim()) : []
  );

  // 1. Whitelist validation
  const isAllowed = trustedIpWhitelist.has(req.ip);

  if (!isAllowed) {
      console.log(`IP Whitelist Filter IP BLOCKED: ${req.ip} body:${JSON.stringify(req.body)}`);
      return res.status(200).send('Ok'); 
  }


  try {
    // 2. Prepare payload for Pub/Sub (including IP/path metadata for logging later)
    const messageData = {
        body: req.body,
        originIp: req.ip,
        path: req.path
    };
    
    const dataBuffer = Buffer.from(JSON.stringify(messageData));
    console.log(`Sending petition pub/sub async`);
    // 3. Publish to Pub/Sub queue asynchronously
    await pubsub.topic(process.env.TOPIC_NAME).publishMessage({ data: dataBuffer });

  } catch (error) {
    console.error(`Failed to push to Pub/Sub: ${error.message}`);
  } finally {
    
    console.log('=========== End Fast Ingress ===========');
    // Still send 200 to protect client relationship if infrastructure hits a hiccup
    res.status(200).send('Ok'); 
  }

  
});