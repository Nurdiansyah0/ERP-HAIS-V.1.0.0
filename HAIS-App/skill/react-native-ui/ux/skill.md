# React Native UI/UX Design Skill

## Objective

Design modern, enterprise-grade, production-ready React Native user interfaces that prioritize:

* Usability
* Accessibility
* Performance
* Consistency
* Scalability
* Mobile-first interaction

The output must be suitable for Android and iOS production environments.

---

# Core Design Principles

Priority order:

1. User Experience
2. Readability
3. Accessibility
4. Performance
5. Visual Design

Never sacrifice usability for visual aesthetics.

---

# Mobile-First Design

Always design for mobile devices first.

Target widths:

* Small Phone: 360dp
* Standard Phone: 390dp
* Large Phone: 412dp
* Tablet: Responsive Layout

Avoid desktop-centric layouts.

---

# Design System Requirements

Every application must define:

## Color System

Primary Color

Used for:

* Primary buttons
* Active navigation
* Important actions

Secondary Color

Used for:

* Supporting actions
* Secondary indicators

Semantic Colors

Success:

* Green

Warning:

* Amber

Error:

* Red

Info:

* Blue

---

# Typography

Font hierarchy:

Display

* 32-40

Heading 1

* 28

Heading 2

* 24

Heading 3

* 20

Body

* 16

Caption

* 14

Small Text

* 12

Rules:

* Maximum 2 font families
* Minimum body size 14
* Prefer 16 for readability

---

# Spacing System

Use 8-point grid.

Allowed spacing:

```text
4
8
12
16
24
32
40
48
64
```

Avoid random spacing values.

---

# Component Design

All components must be reusable.

Examples:

Button
Input
Card
Badge
Avatar
Modal
Bottom Sheet
Snackbar
Loader

Never duplicate UI code.

---

# Screen Layout Pattern

Recommended structure:

```text
Screen
│
├── Header
│
├── Content
│
│   ├── Summary
│   ├── Data
│   └── Actions
│
└── Bottom Navigation
```

Maintain consistency across screens.

---

# Navigation UX

Use:

Bottom Tabs
For:

* Dashboard
* Home
* Reports
* Profile

Use:

Stack Navigation

For:

* Details
* Forms
* Workflow screens

Avoid deep navigation nesting.

Maximum depth:

5 screens

---

# Forms UX

Rules:

* Labels always visible
* Required fields clearly marked
* Validation near field
* Keyboard-aware layout
* Auto-scroll to error

Never rely solely on placeholders.

Bad:

```text
[ Enter Name ]
```

Good:

```text
Name *

[ Input ]
```

---

# Dashboard Design

Dashboard must answer:

1. What requires attention?
2. What changed?
3. What actions are available?

Structure:

```text
Header

Quick Stats

Important Alerts

Recent Activity

Quick Actions
```

Avoid overcrowding.

---

# Enterprise Application Design

Examples:

ERP
CMMS
EAM
ARFF
Airport Operations
HRIS

Requirements:

* Dense information
* Fast navigation
* Minimal decoration
* High readability

Prefer:

Cards
Tables
Lists
Status Indicators

Avoid:

Large illustrations
Excessive animations
Unnecessary gradients

---

# Status Indicators

Always use both:

Color
AND
Text

Example:

🟢 Active

🟡 Pending

🔴 Rejected

Never rely on color alone.

---

# Dark Mode

Must support:

Light Theme
Dark Theme

Requirements:

* Sufficient contrast
* Readable typography
* Consistent elevation

---

# Accessibility

Minimum touch target:

48dp × 48dp

Requirements:

* Screen reader labels
* Sufficient contrast
* Dynamic text support
* Focus indicators

---

# Performance Rules

Avoid:

* Nested FlatLists
* Excessive re-rendering
* Large images
* Heavy animations

Use:

FlatList
Memoization
Lazy Loading

Optimize for low-end Android devices.

---

# React Native Component Stack

Preferred:

* React Native
* React Navigation
* React Native Paper
* NativeWind
* Expo Vector Icons
* React Hook Form
* Zod

Avoid unnecessary dependencies.

---

# Login Screen Standard

Structure:

```text
Logo

App Name

Welcome Message

Email

Password

Login Button

Forgot Password

Version Information
```

Do not overload login screens.

---

# Enterprise Theme Recommendation

For operational systems:

Examples:

* Airport Systems
* ARFF Systems
* ERP Systems
* Maintenance Systems

Use:

Professional
Minimal
Structured
Data-focused

Visual inspiration:

* Microsoft Fluent
* Material Design 3
* Atlassian Design
* IBM Carbon

Avoid gaming-style or social-media-style interfaces.

---

# HAIS Design Recommendation

For Hang Nadim ARFF Integrated System:

Theme:

* Aviation
* Emergency Services
* Operational Command Center

Primary Color:

* Deep Blue

Secondary Color:

* Aviation Orange

Status:

* Green
* Amber
* Red

UI Characteristics:

* High information density
* Fast action access
* Large touch targets
* Offline-friendly
* Glove-friendly operation

The design must prioritize operational efficiency over visual decoration.
