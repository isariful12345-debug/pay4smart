exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ status: "FAILURE", message: "Method Not Allowed" }) 
    };
  }

  try {
    const { number, amount, providerCode, txnId } = JSON.parse(event.body);

    const token = "DQQVHAWL3H1S8GMB2sYatbtB4hpvjD7p";
    const callbackUrl = encodeURIComponent("https://pay4smart.netlify.app/.netlify/functions/payment-callback");

    // PayIcon API Request URL
    const apiUrl = `https://payicon.in/api/recharge?token=${token}&number=${number}&operator=${providerCode}&amount=${amount}&orderid=${txnId}&callback=${callbackUrl}`;

    const apiRes = await fetch(apiUrl);
    const textData = await apiRes.text();

    let parsedData = {};
    try {
      parsedData = JSON.parse(textData);
    } catch (e) {
      parsedData = { status: "RAW_RESPONSE", message: textData };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedData)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "FAILURE", message: err.message })
    };
  }
};
