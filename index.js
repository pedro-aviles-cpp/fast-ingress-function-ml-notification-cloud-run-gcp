const functions = require('@google-cloud/functions-framework');

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

    // // 1. Decode and parse the Pub/Sub payload
    // const base64Data = cloudEvent.data.message.data;
    // const payloadString = Buffer.from(base64Data, 'base64').toString();
    // const { body, originIp, path } = JSON.parse(payloadString);

    // // 2. Execute external API tasks in parallel to save time
    // const newRelicTask = logToNewRelic(body, originIp, path);
    // //const vpsTask = logToGcpVps(body);

    // // Run both tasks simultaneously
    // await Promise.allSettled([newRelicTask]);//, vpsTask]);

  console.log('=========== End Fast Ingress ===========');


  res.status(200).send('Hello, World! prod fast ingress function');
});