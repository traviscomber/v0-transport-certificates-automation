# API Reference

## Authentication
All endpoints require authentication via Supabase. Include the Authorization header with your JWT token.

```bash
Authorization: Bearer {jwt_token}
```

## Document Status Endpoints

### PATCH /api/company/documents/[id]/status
Change the status of a document.

**Request:**
```json
{
  "status": "approved|rejected|pending",
  "reason": "Optional reason for the change"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated",
  "documentId": "123",
  "newStatus": "approved",
  "changedAt": "2026-05-04T20:00:00Z"
}
```

**Error Codes:**
- 401: Unauthorized
- 400: Invalid status or missing required fields
- 404: Document not found
- 500: Internal server error

---

## Anomaly Endpoints

### GET /api/anomalies/list
Retrieve anomalies with optional filtering and pagination.

**Query Parameters:**
- `severity`: low|medium|high|critical (optional)
- `actionTaken`: pending|approved|rejected|investigated (optional)
- `page`: number (default: 1)
- `limit`: number (default: 25)

**Response:**
```json
{
  "anomalies": [
    {
      "id": "123",
      "type": "speeding",
      "severity": "high",
      "description": "Vehicle speeding",
      "detectedAt": "2026-05-04T19:00:00Z",
      "actionTaken": "pending"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 25
}
```

---

### POST /api/anomalies/action
Take action on an anomaly.

**Request:**
```json
{
  "anomaly_id": "123",
  "action": "investigate|resolve|dismiss|escalate",
  "notes": "Optional notes about the action"
}
```

**Response:**
```json
{
  "success": true,
  "anomalyId": "123",
  "actionTaken": "investigate",
  "actionAt": "2026-05-04T20:05:00Z"
}
```

---

## Notification Endpoints

### POST /api/notifications/send-email-alert
Send email alert for anomaly (requires authentication).

**Request:**
```json
{
  "anomaly_id": "123",
  "recipient_email": "user@example.com",
  "recipient_name": "John Doe",
  "anomaly_type": "speeding",
  "severity": "high",
  "description": "Vehicle exceeded speed limit",
  "driver_name": "John Smith",
  "company_name": "Test Company"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email queued for sending"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

---

## Rate Limiting

Rate limits are enforced per user:
- 100 requests per minute for standard endpoints
- 10 requests per minute for email notifications

---

## Versioning

Current API version: **v1**

All endpoints are versioned in the URL: `/api/v1/...`

Future breaking changes will be released as `/api/v2/...`
