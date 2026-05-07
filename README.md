# Smart Patient Agenda

Smart Patient Agenda is a multi-tenant SaaS platform built for dental clinics to centralize scheduling, patient management, operational workflows, and inventory-aware appointments.

The project was developed as a real-world full-stack architecture exercise focused on scalable backend design, clean separation of concerns, and production-oriented workflows.

## Live Demo

https://smart-patients-agenda.vercel.app

A temporary demo environment can be created directly from the login screen.

Demo sessions are isolated and automatically cleaned after logout.

---

# The Problem

Many clinics still rely on fragmented workflows involving spreadsheets, generic calendars, manual inventory tracking, and disconnected communication channels.

This often leads to:
- overlapping appointments
- scheduling conflicts
- missing inventory during treatments
- lack of operational visibility
- inefficient onboarding and clinic management

Smart Patient Agenda was designed to solve these operational bottlenecks through a centralized platform.

---

# Features

- Multi-tenant clinic architecture
- Role-aware authentication system
- Clinic onboarding flow
- Intelligent appointment validation
- Staff and module availability checks
- Inventory-aware scheduling warnings
- Treatment management
- Patient management
- Inventory management with movement logs
- Demo environment provisioning and cleanup
- Responsive dashboard UI

---

# Scheduling Engine

The platform includes a custom scheduling engine separated from the persistence layer.

The engine validates:
- overlapping appointments
- staff schedules
- staff absences
- module availability
- treatment compatibility
- inventory requirements

This logic was intentionally designed as a reusable domain layer independent from Prisma and the database.

---

# Tech Stack

## Frontend
- Next.js 16
- React
- TypeScript
- TailwindCSS
- shadcn/ui

## Backend
- Next.js Route Handlers
- Prisma ORM
- PostgreSQL (Supabase)
- Better Auth

## Infrastructure
- Vercel
- Supabase

---

# Architecture

The project follows a layered architecture approach:

- Domain layer for business rules
- Data access layer for orchestration
- Persistence layer with Prisma/PostgreSQL
- Modular UI components and forms

The goal was to keep business logic isolated, testable, and scalable.

---

# Purpose

This project was built to:
- practice production-oriented SaaS architecture
- improve backend and full-stack engineering skills
- implement real-world scheduling logic
- build a portfolio-ready system with practical complexity

---

# Current Status

MVP completed and deployed.

Future improvements include:
- analytics and reporting
- advanced scheduling automation
- notifications and reminders
- mobile-oriented workflows
