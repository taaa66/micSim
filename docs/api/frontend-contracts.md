# Frontend API Contracts (V14.0)

## Overview

This document defines the API contracts between the frontend and backend services.

## Base Configuration

| Environment | Base URL |
|------------|----------|
| Development | `http://localhost:3000/api` |
| QA | `https://qa.ophthalmo-sim.com/api/v1` |
| Production | `https://api.ophthalmo-sim.com/v1` |

---

## Authentication

### `POST /auth/login`

**Request**:
```typescript
{
  email: string;
  password: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    user: ISurgeonProfile;
  };
}
```

### `POST /auth/refresh`

**Request**:
```typescript
{
  refreshToken: string;
}
```

---

## Surgeon Profile

### `GET /surgeons/:id`

**Response**:
```typescript
{
  success: boolean;
  data: ISurgeonProfile;
}
```

### `GET /surgeons/:id/stats`

**Response**:
```typescript
{
  success: boolean;
  data: ISurgeonStats;
}
```

---

## Apex League

### `GET /apex/rankings`

**Query Parameters**:
- `limit`: number (default: 100)
- `offset`: number (default: 0)

**Response**:
```typescript
{
  success: boolean;
  data: IApexRanking[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
```

### `GET /apex/allocation`

**Response**:
```typescript
{
  success: boolean;
  data: IAllocationData;
}
```

### `POST /apex/vote`

**Request**:
```typescript
{
  odId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    voted: boolean;
    updatedAllocation: IAllocationData;
  };
}
```

---

## Training Modules

### `GET /modules`

**Response**:
```typescript
{
  success: boolean;
  data: IModuleData[];
}
```

### `GET /modules/:id`

**Response**:
```typescript
{
  success: boolean;
  data: IModuleData;
}
```

### `POST /modules/:id/session`

**Request**:
```typescript
{
  sessionData: ISessionData;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    score: number;
    grade: string;
    newMastery: number;
  };
}
```

---

## Core Games

### `GET /games/leaderboard`

**Query Parameters**:
- `gameId`: 'tremor-shield' | 'vector-race' | 'nano-grip'

**Response**:
```typescript
{
  success: boolean;
  data: IMotorControlRanking[];
}
```

### `POST /games/:gameId/score`

**Request**:
```typescript
{
  score: ICoreGameScore;
}
```

---

## WebSocket Events

### Connection
```
wss://api.ophthalmo-sim.com/ws
```

### Events

**`rankings:update`**
```typescript
{
  type: 'rankings:update';
  payload: IApexRanking[];
}
```

**`allocation:vote`**
```typescript
{
  type: 'allocation:vote';
  payload: IAllocationData;
}
```

**`heartbeat`**
```typescript
{
  type: 'heartbeat';
  payload: { timestamp: number };
}
```
