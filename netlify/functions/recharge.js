exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Successful preflight call" })
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ status: "FAILED", message: "Method Not Allowed" })
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const { number, amount, providerCode, txnid } = data;

    if (!number || !amount || !providerCode || !txnid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ status: "FAILED", message: "Missing required parameters" })
      };
    }

    // Payicon এর নিউমেরিক কোড ম্যাপিং
    const opLower = String(providerCode || "").toLowerCase().trim();
    let finalOperator = providerCode;

    if (opLower.includes("jio")) {
      finalOperator = "8";
    } else if (opLower.includes("vi") || opLower.includes("vodafone") || opLower.includes("idea")) {
      finalOperator = "10";
    } else if (opLower.includes("bsnl")) {
      finalOperator = "6";
    } else if (opLower.includes("airtel")) {
      // ৩৪৯ বা তার বেশি হলে ৫, অন্যথায় সাধারণ এয়ারটেল কোড (সাধারণত ১)
      finalOperator = Number(amount) >= 349 ? "5" : "1";
    }

    const token = "DQQVHAWL3H1S8GMB2SYatbt04hpvjD7P";
    
    const host = event.headers.host || "dovik-5f6044.netlify.app";
    const callbackUrl = encodeURIComponent(`https://${host}/.netlify/functions/payment-callback`);

    const apiUrl = `https://payicon.in/api/recharge?token=${token}&number=${number}&operator=${finalOperator}&dejamount=${amount}&orderid=${txnid}&callback=${callbackUrl}`;

    const fetchResponse = await fetch(apiUrl);
    const resultText = await fetchResponse.text();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(resultText);
    } catch (e) {
      jsonResponse = { raw: resultText };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "SUCCESS",
        data: jsonResponse
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: "FAILED",
        message: error.message || "Internal Server Error"
      })
    };
  }
};
