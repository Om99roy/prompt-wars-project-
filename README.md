# VenueIQ — Real-Time Sports Venue Intelligence

VenueIQ is an AI-powered, real-time sports venue attendee experience platform. Designed to handle the scale of 100,000+ capacity stadiums, the platform offers real-time crowd intelligence, predictive queue management, and indoor navigation to transform the live sports experience.

## Features

- **Live Scorecards**: Integrated real-time match data featuring current scores, innings breakdowns, and win probabilities directly within the app.
- **CrowdSense AI**: Real-time crowd density heatmaps and zone occupancy monitoring. Predicts congestion before it happens using simulated edge-inference data.
- **QueueIQ**: Intelligent queue management providing live wait-time predictions for concession stands and smart redistribution recommendations to minimize bottlenecks.
- **FlowMap Navigation**: Indoor/outdoor wayfinding simulation with accessibility-first routing through complex stadium environments.
- **SafeZone Alerts**: Automated hazard detection, incident monitoring, and simulated emergency broadcasting.
- **Venue Analytics**: Comprehensive post-event insights dashboard detailing attendance, peak zones, average queue times, and crowd flow timelines.
- **Multi-Venue Control**: Centralized management portal for tournament-wide operations spanning multiple venues globally.

## Architecture

Built for scale and sub-200ms latency, the VenueIQ platform utilizes a modern microservices architecture:

- **Frontend**: Pure HTML, CSS, and Vanilla JavaScript for a lightweight, hyper-fast, and responsive UI.
- **API Gateway**: Node.js/Express gateway (port 8000) that serves static files and proxies requests to backend microservices.
- **Venue Service**: Node.js/Express service (port 3000) backed by PostgreSQL (Neon) that manages venue configurations, zones, and the `SimulatedDataEngine` for real-time sensor data.
- **Auth Service**: Go-based microservice (port 8080) handling secure JWT authentication.
- **Event Streaming**: Apache Kafka for real-time sensor data processing (configured for future hardware integration).

## Getting Started

### Prerequisites

- Node.js (v18+)
- Go (1.20+)
- PostgreSQL database (or Neon Serverless Postgres)

### Running Locally

1. **Start the Auth Service (Go)**:
   ```bash
   cd services/auth-service
   go run main.go
   ```

2. **Start the Venue Service (Node.js)**:
   ```bash
   cd services/venue-service
   npm install
   npm start
   ```

3. **Start the API Gateway (Node.js)**:
   ```bash
   cd gateway
   npm install
   npm start
   ```

4. **Access the Application**:
   Open your browser and navigate to `http://localhost:8000`.

## Simulated Data Engine

Currently, the platform runs in a "Simulated Live" mode. The `simulatedData.js` module in the `venue-service` dynamically generates realistic data for match scores, zone densities, and queue times, complete with natural fluctuations and noise. This allows for full UI/UX testing and demonstration without requiring physical IoT sensors to be deployed. When hardware is installed, simply replace the simulation logic with live API calls.