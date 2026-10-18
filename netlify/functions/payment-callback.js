exports.handler = async (event, context) => {
  if (event.httpMethod === "POST") {
    try {
      const data = JSON.parse(event.body || "{}");
      console.log("Payment Callback Data:", data);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Success" }),
      };
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON" }),
      };
    }
  }

  return {
    statusCode: 200,
    body: "Callback URL is active!",
  };
};
