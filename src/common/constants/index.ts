/**
 * Application global constants
 */
export const constants = {

  REGEX_ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  REGEX_JS_INSENSITIVE: /^[^%&<>;=\+\*\'\"\0\\]*$/, //allows JS non-sensitive characters

  CAPTCHA_RESPONSE: 'captchaResponse' as 'captchaResponse', //CAPTCHA_RESPONSE is a computed property
 
  INVALID_ETHEREUM_ADDRESS_ERROR: 'Invalid ethereum address.',
  GENERIC_ERROR: 'We had an error processing your request.',
  FORBIDDEN_CHARACTERS_ERROR: 'Forbidden characters.',
}
