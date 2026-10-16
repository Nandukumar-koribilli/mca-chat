# UI Design Specification — EduConnect
*Derived directly from reference dashboard mockup*

## 1. Canvas & Layout Tokens
- **Background Canvas**: `#EEF2EF` (soft sage/off-white neutral background).
- **Card Background**: `#FFFFFF` with `rounded-[28px]` (subtle radius ~28px), border `1px solid rgba(0,0,0,0.04)`, soft elevation `shadow-[0_4px_20px_rgba(0,0,0,0.02)]`.
- **Primary Typography**: Inter / system-ui, high readability, font weights 400, 500, 600, 700.
- **Main Text Color**: `#191A1E` (deep charcoal/near black).
- **Secondary Text Color**: `#7A7F87` (cool muted slate).

## 2. Color Palette
- **Active Navigation Pill**: `#1E1F23` (solid charcoal/black) with `#FFFFFF` text.
- **Accent Purple / Violet**:
  - Primary button / Notification: `#8E84F5` / `#7C71F2`
  - Inactive pill badge: `#A59EF8` / `#8F85F3`
  - Status "To do": `#EEEAFC` background with `#6859EA` text.
- **Status "In progress"**:
  - Pill background: `#FEF4E8` with `#D97706` amber text.
  - Progress bar: mint green `#58D68D` & diagonal white striped fill.
- **Status "Done"**:
  - Pill background: `#E6F9EE` with `#16A34A` emerald text.
- **"My notes" Card Colors**:
  - Mint Green Card: `#A5F390` with dark forest `#13381B` typography.
  - Lavender / Violet Card: `#9B94FB` with white `#FFFFFF` / light lavender typography.
  - Additional palette: Amber `#FDE68A`, Rose `#FECDD3`, Sky `#BAE6FD`.

## 3. Reference Component Breakdown
1. **Left Sidebar**:
   - Logo: Rounded square badge with graduation/connect icon + "EduConnect" brand.
   - Nav items: Dashboard (Active: black rounded pill), Schedule, Tasks (badge 3), Tests, Reports, Chat (badge 12), Notes (badge 2).
   - Bottom items: Settings, Log out.
2. **Top Action Toolbar**:
   - Square search icon button (`#1E1F23`).
   - Violet notification button (`#8E84F5`).
   - Profile badge: Circular avatar, student name ("Kate Malone"), class subtitle ("MCA Sem 2"), chevron.
   - Three-dot options button.
3. **"My tasks" Card**:
   - Filter pills: `All task` (black active pill), `To do`, `In progress`, `Done`.
   - Action: `+` circular button at top right.
   - List items with title, subject label, due date, comments counter, status badge, and striped progress indicator for active items.
   - Bottom link: "View all tasks".
4. **"My notes" Card Grid**:
   - Top header with `+` button.
   - Two side-by-side vibrant cards:
     - "Math conspect" (Lime green `#A5F390`)
     - "Biology conspect" (Lavender `#9B94FB`)
5. **"My schedule" Timetable Card**:
   - Header with Date Picker dropdown ("May 14, Mon ˅").
   - Columns: `Time`, `Lesson`, `Teacher`, `Location`.
   - Circular teacher avatars with names and room numbers.
6. **Chat Interface**:
   - Three-panel desktop, responsive drawer on mobile.
   - Prominent search input: `"Search students by username..."`.
   - Instant 1-on-1 direct conversations & cohort group discussion.
