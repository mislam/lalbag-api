# BulkSMSBD API Documentation

**Provider**: [Bulk SMS BD](https://bulksmsbd.com/) - Bangladesh SMS Gateway  
**API Reference**: [Official Documentation](https://bulksmsbd.com/bulksms-api-bangladesh.php)

> **Overview**: REST API for sending SMS messages in Bangladesh. Supports single messages to multiple recipients and bulk messaging with different content per recipient.

## API Endpoints

### Single SMS API

**URL**: `https://bulksmsbd.net/api/smsapi`  
**Methods**: GET, POST  
**Purpose**: Send one message to multiple recipients

### Bulk SMS API

**URL**: `https://bulksmsbd.net/api/smsapimany`  
**Methods**: GET, POST  
**Purpose**: Send different messages to different recipients

### Balance Check API

**URL**: `https://bulksmsbd.net/api/getBalanceApi`  
**Methods**: GET, POST

## Request Formats

### Single SMS (Same Message to Multiple Recipients)

```json
{
	"api_key": "{your api key}",
	"senderid": "{your sender id}",
	"number": "88013XXXXXXXX,88019XXXXXXXX",
	"message": "{your message content}"
}
```

### Bulk SMS (Different Messages to Different Recipients)

```json
{
	"api_key": "{your api key}",
	"senderid": "{your sender id}",
	"messages": [
		{
			"to": "88016XXXXXXXX",
			"message": "Custom message for recipient 1"
		},
		{
			"to": "88018XXXXXXXX",
			"message": "Different message for recipient 2"
		}
	]
}
```

### Balance Check

```json
{
	"api_key": "{your api key}"
}
```

## Parameters

| Parameter  | Required | Description                                         |
| ---------- | -------- | --------------------------------------------------- |
| `api_key`  | Yes      | Your unique API key from BulkSMSBD dashboard        |
| `senderid` | Yes      | Approved sender ID (e.g., 8809XXXXXXXXX)            |
| `number`   | Yes      | Recipient number(s) with 880 country code prefix    |
| `message`  | Yes      | SMS text content (URL encode special characters)    |
| `messages` | Yes      | Array of recipient/message objects for bulk sending |

## Response Codes

| Code | Status     | Description                                                              |
| ---- | ---------- | ------------------------------------------------------------------------ |
| 202  | ✅ Success | SMS Submitted Successfully                                               |
| 1001 | ❌ Error   | Invalid Number                                                           |
| 1002 | ❌ Error   | sender id not correct/sender id is disabled                              |
| 1003 | ❌ Error   | Please Required all fields/Contact Your System Administrator             |
| 1005 | ❌ Error   | Internal Error                                                           |
| 1006 | ❌ Error   | Balance Validity Not Available                                           |
| 1007 | ❌ Error   | Balance Insufficient                                                     |
| 1011 | ❌ Error   | User Id not found                                                        |
| 1012 | ❌ Error   | Masking SMS must be sent in Bengali                                      |
| 1013 | ❌ Error   | Sender Id has not found Gateway by api key                               |
| 1014 | ❌ Error   | Sender Type Name not found using this sender by api key                  |
| 1015 | ❌ Error   | Sender Id has not found Any Valid Gateway by api key                     |
| 1016 | ❌ Error   | Sender Type Name Active Price Info not found by this sender id           |
| 1017 | ❌ Error   | Sender Type Name Price Info not found by this sender id                  |
| 1018 | ❌ Error   | The Owner of this (username) Account is disabled                         |
| 1019 | ❌ Error   | The (sender type name) Price of this (username) Account is disabled      |
| 1020 | ❌ Error   | The parent of this account is not found.                                 |
| 1021 | ❌ Error   | The parent active (sender type name) price of this account is not found. |
| 1031 | ❌ Error   | Your Account Not Verified, Please Contact Administrator.                 |
| 1032 | ❌ Error   | ip Not whitelisted                                                       |

## Implementation Guidelines

- **Phone Format**: Use full Bangladesh country code `880` (e.g., `8801XXXXXXXXX`)
- **Message Encoding**: URL encode special characters in SMS content
- **HTTP Methods**: Both GET and POST are supported for all endpoints
- **SSL/TLS**: HTTPS is recommended; SSL verification can be disabled for local testing
- **Rate Limits**: API enforces rate limits (see headers: `X-Ratelimit-Limit`, `X-Ratelimit-Remaining`)
- **OTP Format**: Use standard format: `Your {Brand/Company Name} OTP is XXXX`

## Examples

### Example 1: SMS sent successfully

```json
// Request Body (POST)
{
  "api_key": "5X71W7klbd6YJIFOnHNu",
  "senderid": "8809612345678",
  "number": "8801987654321",
  "message": "Your Lalbag OTP is 123456"
}
// Response 200 OK
{
	"response_code": 202,
	"message_id": 12345678,
	"success_message": "SMS Submitted Successfully 1",
	"error_message": ""
}
```

### Example 2: Failed due to invalid `number`

```json
// Request Body (POST)
{
	"api_key": "5X71W7klbd6YJIFOnHNu",
	"senderid": "8809612345678",
	"number": "12345",
	"message": "This is just a test SMS"
}
// Response 200 OK
{
  "response_code": 1001,
  "success_message": "",
  "error_message": "Invalid Number!"
}
```

### Example 3: Failed due to invalid `senderid`

```json
// Request Body (POST)
{
	"api_key": "5X71W7klbd6YJIFOnHNu",
	"senderid": "12345",
	"number": "8801987654321",
	"message": "This is just a test SMS"
}
// Response 200 OK
{
  "response_code": 1005,
  "success_message": "",
  "error_message": "Attempt to read property \"is_masking\" on null"
}
```

## Rate Limiting

**Important**: All API responses return HTTP 200 OK, regardless of success or failure. Check the `response_code` field to determine actual status.

Rate limit information is provided in response headers:

```http
X-Ratelimit-Limit: 60
X-Ratelimit-Remaining: 59
```

- `X-Ratelimit-Limit`: Maximum requests allowed per minute
- `X-Ratelimit-Remaining`: Remaining requests in current window
