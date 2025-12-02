# 📅 Rota Management System

## Overview

The Rota Management System is a fully automated, transparent, and fair scheduling module integrated into OphthalmoSim+. It eliminates the administrative burden of manual monthly on-call/shift scheduling for ophthalmology residents and consultants.

## Key Features

### 1. Optimization Engine
- **Constraint-Based Scheduling**: Respects hard limits (contractual max shifts, mandatory rest periods, pre-approved leave)
- **Fairness Algorithm**: Balances equity metrics across all users
- **Preference Integration**: Maximizes fulfillment of user preferences while maintaining fairness

### 2. Equity Metrics
- **Shift Balance**: Tracks running total of shifts over 6 months
- **Weekend/Holiday Load**: Balances weekend and holiday assignments
- **Post-Call Rest**: Enforces minimum 10-hour rest periods
- **Variance Minimization**: Reduces disparity between users

### 3. User Preferences
- **Date-Specific**: Mark specific dates as Must Have, Highly Preferred, Indifferent, or Must Avoid
- **Day-of-Week**: Set recurring preferences for specific days
- **Shift Type**: Indicate preferences for different shift types

### 4. Swap Marketplace
- **Self-Service Exchange**: Users can list shifts for swap
- **Automatic Validation**: System validates eligibility before approval
- **Constraint Checking**: Ensures swaps don't violate rest periods or qualifications

## Architecture

```
src/modules/rota/
├── types.ts                 # TypeScript interfaces
├── optimizationEngine.ts    # Core scheduling algorithm
├── swapService.ts           # Swap validation and processing
├── rotaStore.ts             # Svelte store for state management
├── index.ts                 # Module exports
└── components/
    ├── RotaHub.svelte       # Main hub component
    ├── RotaCalendar.svelte  # Monthly calendar view
    ├── PreferenceInput.svelte # Preference submission modal
    └── SwapMarketplace.svelte # Swap listing and acceptance
```

## Data Models

### User Profile
```typescript
interface RotaUser {
  id: string;
  name: string;
  seniority: 'PGY1' | 'PGY2' | 'PGY3' | 'PGY4' | 'Fellow' | 'Attending' | 'Consultant';
  mandatoryShiftsPerMonth: number;
  maxShiftsPerMonth: number;
  minRestHours: number;
  certifications: string[];
  approvedLeave: DateRange[];
  fairnessScore: number;
}
```

### Shift Types
| Type | Duration | Weight | Required Certifications |
|------|----------|--------|------------------------|
| General On-Call | 12h | 1.0 | None |
| Senior Backup | 12h | 0.8 | senior_qualified |
| Clinic Duty | 8h | 0.5 | None |
| OR Assist | 10h | 0.7 | or_trained |
| Emergency Cover | 12h | 1.2 | emergency_trained |
| Weekend On-Call | 24h | 1.5 | None |
| Night Shift | 12h | 1.3 | None |
| Holiday Cover | 24h | 2.0 | None |

### Preference Levels
| Level | Weight | Description |
|-------|--------|-------------|
| Must Have | +100 | Strongly prefer this assignment |
| Highly Preferred | +75 | Would like this assignment |
| Indifferent | 0 | No preference |
| Must Avoid | -100 | Cannot work this shift |

## Algorithm

### Optimization Process

1. **Input Gathering**
   - Load user profiles and constraints
   - Collect submitted preferences
   - Define shift requirements for the month

2. **Initial Assignment**
   - For each required shift, score all eligible users
   - Score = (Preference Score × 0.4) + (Equity Score × 0.6)
   - Assign to highest-scoring eligible user

3. **Constraint Validation**
   - Verify seniority requirements
   - Check certifications
   - Validate rest periods
   - Confirm within max shift limits

4. **Optimization Pass**
   - Attempt pairwise swaps to improve total score
   - Continue until no improvement found or max iterations

5. **Metrics Calculation**
   - Calculate fairness variance
   - Measure preference fulfillment
   - Generate detailed log

### Fairness Calculation

```typescript
fairnessScore = 50 + 
  (avgShifts - userShifts) / avgShifts * 30 +
  (avgWeekends - userWeekends) / avgWeekends * 15 +
  (avgHolidays - userHolidays) / avgHolidays * 15
```

Users with fewer historical shifts get higher scores, prioritizing them for new assignments.

## Swap Validation

Before approving any swap, the system validates:

1. **Seniority Match**: Accepting user meets shift requirements
2. **Certifications**: Required certifications are present
3. **Limitations**: No user limitations prevent the shift
4. **Leave Status**: User is not on approved leave
5. **Rest Period**: Minimum rest hours maintained
6. **Max Shifts**: Monthly limit not exceeded

## UI Components

### Calendar View
- Color-coded shifts by type
- Highlighted personal assignments
- Click to view shift details
- Navigation between months

### Preference Input
- Interactive calendar for date selection
- Day-of-week preference grid
- Shift type preference selection
- Notes field for special circumstances

### Swap Marketplace
- Available listings from other users
- Validation preview before acceptance
- My listings management
- Swap history tracking

## API Endpoints (Planned)

```
GET    /api/rota/schedule/:month/:year
POST   /api/rota/schedule/generate
GET    /api/rota/preferences/:userId
POST   /api/rota/preferences
GET    /api/rota/swap/listings
POST   /api/rota/swap/list
POST   /api/rota/swap/accept
DELETE /api/rota/swap/:listingId
```

## Satisfaction Tracking

Post-implementation quality assurance includes:

1. **Satisfaction Score Collection**: 1-5 rating after each month
2. **Qualitative Feedback**: Free-text feedback option
3. **Algorithm Tuning**: Adjust equity/preference weights based on feedback
4. **Continuous Improvement**: Mandatory post-launch iteration sprint

## Integration

The Rota module is fully integrated into the OphthalmoSim+ platform:

- Accessible via "MY SHIFTS" button on main dashboard
- Uses existing authentication system
- Follows platform design language
- Self-contained module (no core file modifications)

## Future Enhancements

- [ ] Firebase backend integration
- [ ] Push notifications for schedule changes
- [ ] Mobile-optimized views
- [ ] Export to calendar (iCal, Google Calendar)
- [ ] Multi-department support
- [ ] Automated conflict resolution
- [ ] Machine learning for preference prediction
