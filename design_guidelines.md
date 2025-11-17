# OTT 친구 (OTT Friend) - Design Guidelines

## Design Philosophy
**"Cozy Night Mode"** - A conversational AI friend for OTT content recommendations with warm, rounded aesthetics that feel like chatting with a friend late at night. No sharp corners anywhere - everything is soft and inviting.

## Color Palette (Strict Adherence Required)
- **Background**: `#1A202C` (Dark Navy/Slate-900)
- **Accent/CTA**: `#F59E0B` (Warm Yellow/Amber-500)
- **Text Primary**: `#E2E8F0` (Light Gray/Slate-200)
- **Text Secondary**: `#94A3B8` (Medium Gray/Slate-400)
- **Cards/Borders**: `#334155` (Medium-Dark Gray/Slate-700)

## Typography
- **Font Family**: Pretendard (system fallback if unavailable)
- **H1 (Landing)**: Bold, 48px (3em)
- **H2 (Landing)**: Normal, 24px (1.5em)
- **Body/Chat**: Normal, 16px (1em)

## Spacing System
**4px Grid System**: Use Tailwind spacing units - p-2, p-4, m-2, m-4, etc. Keep spacing consistent and minimal - choose from 2, 4, 8 units primarily.

## Border Radius Philosophy
**No Sharp Corners Policy**:
- Cards/Bubbles/Modals: `rounded-xl` (12px)
- Pill Buttons: `rounded-full` (999px)
- All interactive elements follow this rounded aesthetic

## Component-Specific Styling

### Chat Bubbles
- **AI Messages**: Background `#334155`, `rounded-xl`, left-aligned
- **User Messages**: Background `#F59E0B` (yellow accent), `rounded-xl`, right-aligned

### Pill Buttons (Recommendation Chips)
- Border: `1px solid #94A3B8`
- Background: Transparent
- `rounded-full`
- Hover: Background changes to `#334155`

### CTA Buttons
- Primary: Yellow (`#F59E0B`), `rounded-xl`, bold text
- Secondary: Gray border, transparent background

### Typing Indicator
CSS dot-pulse animation (3 dots bouncing), NOT a spinner

## Layout Structure

### Desktop (≥769px)
**40/60 Split Layout**:
- Left 40%: ChatInterface (fixed, always visible)
- Right 60%: DetailsPanel (fixed, always visible)

### Mobile (≤768px)
- ChatInterface: 100% width
- DetailsPanel: Bottom sheet/slide-in modal (triggered on content selection)

## Landing Page Sections

### Hero Section
- **Headline**: "야, 오늘 뭐 볼까?" (Bold, 3em, white)
- **Subheadline**: "AI 친구와 '진짜 대화'로 넷플, 디플 인생작 추천받기. 다운로드 없는 웹앱." (Gray, 1.5em)
- **CTA Button**: Yellow, rounded, "지금 바로 채팅 시작하기 (무료, 로그인 X) →"
- **Visual**: Right side - animated GIF mockup of mobile chat interface showing conversation flow

### Features Section
3-column grid layout:
1. "AI가 '지금' 볼 수 있는 것만!" + description
2. "어제 본 것도 '기억'하는 진짜 친구 🧠" + description  
3. "AI가 번역한 '글로벌 후기'로 검증까지 🌎" + description

### Pricing Section
2-column comparison table:
- **Free**: "매일 3회 추천", "AI 잡담 50회", Gray CTA
- **Premium**: "첫 달 990원 (이후 1,900원)", "무제한", Yellow CTA with 👑

## DetailsPanel Accordion Structure
4 collapsible sections with consistent "▼" indicators:
1. "그래서, 뭔 내용인데? 📖" → Plot summary
2. "다른 애들 생각은? 🌎" → Translated global reviews (Top 3)
3. "누가 나오는데?" → Cast grid with headshots
4. "우리 친구들 후기는? ✍️" → User comments + input

Always visible above accordions:
- Large poster image
- AI friend's one-liner recommendation
- OTT platform logos (Netflix, Disney+, etc.)

## Animations
- **Transition Duration**: 300ms, ease-in-out for all hovers/interactions
- **Minimal Philosophy**: Use animations sparingly - dot-pulse typing indicator, smooth panel transitions, subtle hover states only

## Images
- **Hero Section**: Animated GIF mockup showing chat interface interaction (right side, ~50% width)
- **Movie Posters**: TMDB API poster images throughout DetailsPanel and user library grids
- **OTT Logos**: Platform logos (Netflix, Disney+) as visual indicators
- **Persona Avatars**: Small profile images for AI friend personas (다정한/츤데레)

## Responsive Breakpoint
Single breakpoint at **768px**:
- Above: Desktop 40/60 layout
- Below: Mobile stacked layout with bottom sheet