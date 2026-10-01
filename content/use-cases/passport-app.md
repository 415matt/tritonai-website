---
title: Passport Visitor Management
slug: passport-app
summary: Visitors check in for Passport Services at CSC or the UCSD Bookstore while staff manage each location from a shared queue dashboard.
buildPath: Department-built application
status: Production
owner: UC San Diego Passport Services and IPPS Technology and Project Management
lastReviewed: 2026-07-27
audiences: [staff, students, visitors]
source: Production application, public repository, and the June–July 2026 project handoff
measurementPeriod: Production service reviewed in July 2026
dataClassification: Public description; visitor contact and visit details follow the production service's approved controls
canonicalUrl: /use-cases/passport-app.html
relatedSlides: []
humanOversight: Passport Services staff manage each queue, update visitor status, review readiness questions, and make all service decisions.
measurableOutcome: Check-in completion, wait-time visibility, queue accuracy, staff workflow efficiency, and service reliability.
featured: false
stats:
  - { value: "2", label: "Check-in locations", sub: "CSC and UCSD Bookstore" }
  - { value: "Public", label: "Visitor check-in", sub: "Shared device or personal phone" }
  - { value: "Staff", label: "Queue management", sub: "Location-specific dashboards" }
toolHighlights: ["Public check-in", "Location dashboards", "Operational reporting"]
resourceLinks:
  - label: Open the Passport App
    href: https://passports.apps.ucsd.edu/
    description: Choose the CSC or UCSD Bookstore check-in flow in the production service.
  - label: View the public repository
    href: https://github.com/IPPS-TechPM-BSA/passports-app
    description: Review the source code, technical documentation, and release history maintained by IPPS.
---

## Why it was built

Passport Services needed a focused waiting-room tool that matched its check-in process across CSC and the UCSD Bookstore. The team defined a public visitor flow, separate staff views for each location, and operational reporting without bringing unrelated features into the workflow.

## Visitor and staff workflow

Visitors choose a location and provide the information Passport Services needs to organize the visit. Readiness questions help staff identify missing materials before a visitor reaches the counter. Visitors can use a shared device at the office or their own phone.

Staff use a location-specific dashboard to review new check-ins, update queue status, and record notes. They can also manage readiness questions and export operational data. Passport Services staff remain responsible for the queue and every service decision.

## From requirements to ownership

Passport Services and IPPS staff mapped the workflow and built the initial application with AI-assisted development tools. A campus-branded prototype was then prepared for production by application and infrastructure specialists. The work included application cleanup, a deployment path, and campus hosting at `passports.apps.ucsd.edu`.

The project shows how clear requirements and bounded AI-assisted development can shorten the path from an operational need to a working campus service. The production application uses standard web components; staff provide the judgment and oversight.

The Passport App is in production for CSC and the UCSD Bookstore. The public repository is maintained by IPPS Technology and Project Management, giving the service-owning team access to the code and release history for future updates.
