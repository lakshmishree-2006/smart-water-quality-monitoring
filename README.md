# IoT-Based Smart Water Quality Monitoring and Contamination Alert Network

## Project Overview

The Smart Water Quality Monitoring and Contamination Alert Network is a web-based prototype designed to monitor important water-quality parameters and display alerts when readings fall outside configured threshold ranges.

The system provides a centralized dashboard for viewing sensor readings, tracking changes, and identifying unusual values.

**Note:** The current prototype uses simulated readings connected to Firebase. Physical ESP32 and water-quality sensor integration is planned for a future implementation stage.

## Objectives

- Monitor pH, Total Dissolved Solids (TDS), turbidity, and temperature.
- Display water-quality readings through a web dashboard.
- Store and retrieve readings using Firebase Realtime Database.
- Generate threshold-based alerts for unusual readings.
- Provide a foundation for future IoT sensor integration.

## Water Quality Parameters

| Parameter | Description |
|---|---|
| pH | Indicates how acidic or alkaline the water is. |
| TDS | Estimates the concentration of dissolved substances. |
| Turbidity | Indicates the cloudiness of water. |
| Temperature | Measures the water temperature. |

The application uses configured thresholds to identify unusual readings. These alerts do not independently confirm contamination or establish whether water is safe to drink.

## Technologies Used

- **Frontend:** React, TypeScript, CSS
- **Development Environment:** Visual Studio Code
- **Build Tool:** Vite
- **Cloud Database:** Firebase Realtime Database
- **Deployment:** Firebase Hosting
- **Version Control:** Git and GitHub

## System Architecture

The planned IoT workflow is:

Water Quality Sensors → ESP32 → Firebase Realtime Database → React Dashboard → Threshold-Based Alerts

The current software prototype implements the Firebase-connected dashboard using simulated readings. Physical sensor-to-ESP32 communication is planned.

## Main Features

- Dashboard displaying four water-quality parameters.
- Live database updates when readings change in Firebase.
- Charts for viewing water-quality data.
- Threshold-based alerts.
- History and monitoring views.
- Cloud-hosted web application.

## Live Demo

[Open the Smart Water Quality Monitoring Dashboard](https://smart-water-quality-84a25.web.app)

## Getting Started

### Prerequisites

- Node.js and npm
- Visual Studio Code
- A Firebase project with Realtime Database configured

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/lakshmishree-2006/smart-water-quality-monitoring.git
   ```

2. Open the project folder:

   ```bash
   cd smart-water-quality-monitoring
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Configure the Firebase connection using the project's existing configuration structure. Do not commit private credentials.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL shown in the terminal.

## Expected Deliverable

A web dashboard connected to a cloud database, together with the foundation for an IoT communication subsystem. Physical sensor integration remains future work.

## Future Enhancements

- Integrate physical water-quality sensors with ESP32.
- Transmit real sensor readings to Firebase.
- Add notification services for threshold alerts.
- Improve historical analysis and reporting.
- Explore anomaly detection after collecting suitable real-world data.

## Disclaimer

This project is an educational prototype. Threshold-based alerts are intended for monitoring and demonstration purposes and should not be treated as laboratory confirmation of water contamination or drinking-water safety.

