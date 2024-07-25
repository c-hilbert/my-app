function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Ensure it has 10 digits (assuming US numbers)
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`;
  } else {
    console.warn('Invalid phone number format:', phoneNumber);
    return null;
  }
}


module.exports = { formatPhoneNumber };