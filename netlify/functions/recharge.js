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

    // যদি PayIcon সঠিক JSON পাঠায়
    try {
      parsedData = JSON.parse(textData);
    } catch (e) {
      // যদি PayIcon কোনো HTML/CSS এরর পেজ পাঠায় (যেমন Low Balance ইত্যাদি)
      let cleanMsg = "Provider rejected the request.";
      if (textData.toLowerCase().includes("balance")) {
        cleanMsg = "PayIcon Wallet-এ ব্যালেন্স নেই! দয়া করে PayIcon-এ ব্যালেন্স যোগ করুন।";
      } else if (textData.toLowerCase().includes("token") || textData.toLowerCase().includes("auth")) {
        cleanMsg = "Invalid API Token or Authentication Error.";
      } else if (textData.toLowerCase().includes("operator")) {
        cleanMsg = "Invalid Operator Code.";
      }
      parsedData = { status: "FAILURE", message: cleanMsg };
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
