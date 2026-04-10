# Data Architecture & Schemas

## 1. Task Schema
The core model representing a single task, chore, or time block.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Task",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier (UUID) for the task."
    },
    "title": {
      "type": "string",
      "description": "The name of the task."
    },
    "lifeZones": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Array of Life Zone IDs or tags (e.g., ['home_chores', 'life_admin'])."
    },
    "estimatedDurationMinutes": {
      "type": "integer",
      "description": "Expected duration in minutes."
    },
    "isQuickWin": {
      "type": "boolean",
      "description": "Flag indicating if this task is a candidate for the Quick Win emergency button (typically < 5 mins)."
    },
    "type": {
      "type": "string",
      "enum": ["time_block", "quick_chore"],
      "description": "Determines routing (time_block -> Calendar sync, quick_chore -> stays in-app)."
    },
    "recurrence": {
      "type": "object",
      "properties": {
        "intervalValue": { "type": "integer" },
        "intervalType": { "type": "string", "enum": ["days", "weeks", "months", "years"] },
        "degradationRate": {
          "type": "number",
          "description": "Rate at which the health bar depletes per day (used for the Gamification UI)."
        }
      },
      "description": "Used to calculate both the next due date and the UI 'health bar' visual state."
    },
    "healthPercentage": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "Current 'health' state of this task, updated daily by the background engine."
    },
    "createdAt": { "type": "string", "format": "date-time" },
    "lastCompletedAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "title", "type"]
}
```

## 2. Starter Pack Payload Schema
The structure for exporting/importing pre-built life engines via URL payloads, QR codes, or JSON files. This creates a frictionless onboarding experience.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "StarterPackPayload",
  "type": "object",
  "properties": {
    "packId": {
      "type": "string",
      "description": "Unique identifier for this specific starter pack (e.g., 'college_student_adhd_v1')."
    },
    "packName": {
      "type": "string",
      "description": "Human-readable name of the pack."
    },
    "description": {
      "type": "string",
      "description": "Brief summary of who/what this pack is for."
    },
    "lifeZones": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "colorTheme": { "type": "string" }
        }
      },
      "description": "The base taxonomy mapping to be injected."
    },
    "tasks": {
      "type": "array",
      "items": {
        "description": "Task Schema objects representing the template tasks.",
        "type": "object" 
      }
    }
  },
  "required": ["packId", "packName", "tasks"]
}
```
