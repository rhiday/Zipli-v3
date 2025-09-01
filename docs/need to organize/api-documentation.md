# Zipli API Documentation

## Overview

The Zipli API provides endpoints for managing food donations, user authentication, and real-time communication between food donors and receivers.

**Base URL**: `https://zipli-v3.vercel.app/api`
**Version**: 1.0
**Authentication**: Token-based authentication

## Authentication

### Generate QR Token

Generate a new QR code token for pickup authentication.

**Endpoint**: `GET /auth/qr-token`

**Headers**:

```
Origin: https://allowed-domain.com
```

**Response**:

```json
{
  "token": "abc123def456",
  "appUrl": "https://zipli-v3.vercel.app",
  "expires_at": "2023-12-01T15:30:00Z"
}
```

**Rate Limit**: 10 requests per minute per IP

### Validate Token

Validate a QR code token for pickup authorization.

**Endpoint**: `GET /auth/validate-token?token={token}`

**Parameters**:

- `token` (required): The QR code token to validate

**Response Success** (200):

```json
{
  "valid": true,
  "user_email": "user@example.com",
  "token_info": {
    "created_at": "2023-12-01T14:30:00Z",
    "expires_at": "2023-12-01T15:30:00Z"
  }
}
```

**Response Error** (404/403):

```json
{
  "valid": false,
  "message": "Invalid token" | "Token has expired" | "Token has already been used"
}
```

**Rate Limit**: 30 requests per minute per IP

## Food Item Processing

### Process Item Details

Extract structured information from natural language description of food items.

**Endpoint**: `POST /process-item-details`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "transcript": "I have 5 kilograms of fresh apples and 2 loaves of bread"
}
```

**Response** (200):

```json
{
  "items": [
    {
      "name": "Fresh Apples",
      "quantity": "5 kg",
      "allergens": [],
      "expiry_info": "Best within 1 week",
      "category": "fruits"
    },
    {
      "name": "Bread Loaves",
      "quantity": "2 pieces",
      "allergens": ["gluten", "wheat"],
      "expiry_info": "Best within 3 days",
      "category": "bakery"
    }
  ],
  "confidence": 0.95,
  "processing_time_ms": 1250
}
```

**Error Response** (400):

```json
{
  "error": "Invalid request body",
  "details": "Transcript is required and must be a non-empty string"
}
```

**Rate Limit**: 20 requests per minute per IP

### Transcribe Audio

Convert audio recordings to text for food item processing.

**Endpoint**: `POST /transcribe-audio`

**Headers**:

```
Content-Type: multipart/form-data
```

**Request Body**:

- `audio` (file): Audio file (MP3, MP4, WAV, WebM, OGG)
- Maximum file size: 25MB

**Response** (200):

```json
{
  "transcript": "I have five kilograms of fresh apples to donate",
  "confidence": 0.98,
  "duration_seconds": 3.2,
  "language": "en"
}
```

**Error Responses**:

**400 - No File**:

```json
{
  "error": "No audio file uploaded or file is empty"
}
```

**400 - File Too Large**:

```json
{
  "error": "Audio file too large. Maximum size is 25MB."
}
```

**400 - Invalid File Type**:

```json
{
  "error": "Invalid file type. Please upload an audio file (MP3, MP4, WAV, WebM, or OGG)."
}
```

**Rate Limit**: 10 requests per minute per IP

## Error Codes

### Standard HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized
- `403` - Forbidden (expired/used token)
- `404` - Not Found (invalid token)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Custom Error Codes

- `INVALID_TOKEN` - Token is malformed or doesn't exist
- `EXPIRED_TOKEN` - Token has passed its expiration time
- `USED_TOKEN` - Token has already been consumed
- `RATE_LIMITED` - Too many requests from this IP
- `INVALID_AUDIO` - Audio file format not supported
- `FILE_TOO_LARGE` - Uploaded file exceeds size limit
- `PROCESSING_ERROR` - AI processing failed
- `MISSING_API_KEY` - OpenAI API key not configured

## Rate Limiting

All endpoints implement rate limiting to prevent abuse:

- **QR Token Generation**: 10 requests per minute per IP
- **Token Validation**: 30 requests per minute per IP
- **Item Processing**: 20 requests per minute per IP
- **Audio Transcription**: 10 requests per minute per IP

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1701435600
```

## CORS Policy

The API implements strict CORS policies for security:

**Allowed Origins**:

- `http://localhost:3000` (development)
- `http://localhost:3001` (development)
- `https://zipli-v3.vercel.app` (production)
- Domain from `NEXT_PUBLIC_APP_URL` environment variable

**Allowed Methods**: `GET`, `POST`, `OPTIONS`
**Allowed Headers**: `Content-Type`, `Authorization`

## Security Features

### Input Sanitization

- All text inputs are sanitized to prevent XSS attacks
- File uploads are validated for type and size
- SQL injection protection through parameterized queries

### Token Security

- Tokens expire after 1 hour
- Tokens can only be used once
- Secure random token generation
- No sensitive data in token payload

### API Key Protection

- OpenAI API keys are server-side only
- No API keys exposed in client-side code
- Environment variable validation

## Usage Examples

### JavaScript/TypeScript

```typescript
// Generate QR token
const generateToken = async () => {
  const response = await fetch('/api/auth/qr-token', {
    method: 'GET',
    headers: {
      Origin: 'https://zipli-v3.vercel.app',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to generate token');
  }

  return await response.json();
};

// Process food items
const processItems = async (transcript: string) => {
  const response = await fetch('/api/process-item-details', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript }),
  });

  return await response.json();
};

// Upload and transcribe audio
const transcribeAudio = async (audioFile: File) => {
  const formData = new FormData();
  formData.append('audio', audioFile);

  const response = await fetch('/api/transcribe-audio', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};
```

### cURL Examples

```bash
# Generate QR token
curl -X GET "https://zipli-v3.vercel.app/api/auth/qr-token" \
  -H "Origin: https://zipli-v3.vercel.app"

# Validate token
curl -X GET "https://zipli-v3.vercel.app/api/auth/validate-token?token=abc123" \
  -H "Origin: https://zipli-v3.vercel.app"

# Process items
curl -X POST "https://zipli-v3.vercel.app/api/process-item-details" \
  -H "Content-Type: application/json" \
  -d '{"transcript": "I have 3 apples and 2 oranges"}'

# Upload audio file
curl -X POST "https://zipli-v3.vercel.app/api/transcribe-audio" \
  -F "audio=@recording.mp3"
```

## Testing

### Postman Collection

A Postman collection is available for API testing:

- Import the collection from `/docs/postman/zipli-api.json`
- Set environment variables for base URL and test tokens
- Run automated tests for all endpoints

### Test Environment

- Base URL: `https://zipli-staging.vercel.app/api`
- Test tokens available in development
- Mock OpenAI responses for consistent testing

## Support

For API support and questions:

- Create an issue in the GitHub repository
- Review the test files in `/tests/api-routes.test.ts`
- Check the implementation in `/src/app/api/` directories

## Changelog

### Version 1.0 (Current)

- Initial API release
- QR token authentication
- Food item AI processing
- Audio transcription
- Rate limiting and CORS security
- Comprehensive error handling
