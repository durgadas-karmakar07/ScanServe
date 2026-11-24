// UPI payment link (upi://pay): opens the customer's UPI app with the café's UPI ID and the
// amount filled in. Parameters are built with URLSearchParams (Rules.md section 5) and the
// amount is the order total from the server, never typed in on the phone.
const MAX_NAME_LENGTH = 50;

export function upiPayLink({ upiId, payeeName, amount, note }) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName.slice(0, MAX_NAME_LENGTH),
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
  });
  // URLSearchParams writes spaces as "+", which some UPI apps show literally, and "@" as "%40",
  // which some apps do not decode in the UPI ID. "@" is allowed in a link as it is.
  return `upi://pay?${params.toString().replace(/\+/g, '%20').replace(/%40/g, '@')}`;
}
