export function sendError(statusCode, message) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: false, message })
  };
}

export function sendResponse(response) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: true, ...response })
  };
}
