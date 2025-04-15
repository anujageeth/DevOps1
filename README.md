# 📦 Social Media Web App - DevOps Project

This project is implemented to build a **Social Media Web Application** while integrating key **DevOps practices and tools** such as **Docker, Jenkins, Terraform, Ansible, and AWS**. The goal is not only to develop the application but also to demonstrate an end-to-end DevOps pipeline for deployment and delivery.

---

## 🔧 DevOps Tools Used

### 🟣 GitHub
- **Purpose**: Version control & team collaboration
- **Usage**: Hosts the source code, tracks changes, and supports the CI/CD pipeline through integration with Jenkins.

### 🐳 Docker
- **Version**: 27.5.1 (Build 9f9e405)
- **Purpose**: Containerization
- **Usage**: Packages both the frontend and backend of the web app into isolated containers. Ensures consistency across development and production environments.

### ⚙️ Jenkins
- **Version**: 2.492.1
- **Purpose**: Continuous Integration / Continuous Deployment (CI/CD)
- **Usage**:
  - Monitors changes in GitHub.
  - Builds and tests Docker images.
  - Pushes images to Docker Hub.
  - Automates deployment pipeline for seamless delivery.

---

## 🛠 Application Tools & Dependencies

### 🌐 Node.js
- **Version**: 20.18.1
- **Purpose**: Runtime environment for JavaScript.
- **Usage**: Powers both frontend and backend execution.

### ⚡ Express.js
- **Version**: 4.18.1
- **Purpose**: Backend web framework.
- **Usage**: Creates the RESTful API for the backend.

### ⚛ React.js
- **Version**: 18.1.0
- **Purpose**: Frontend library.
- **Usage**: Builds responsive and dynamic user interfaces.

### 🧬 Mongoose
- **Version**: 6.3.2
- **Purpose**: MongoDB object modeling.
- **Usage**: Interacts with MongoDB for data handling.

---

## 🚀 Automated Deployment Pipeline

Deployment is automated using **Docker** and **Jenkins**.

### 🛠 Pipeline Steps:
1. Jenkins watches for changes in the **main** branch on GitHub.
2. On change:
   - Installs dependencies with `npm install` (for both frontend and backend).
   - Builds the frontend using `npm run build`.
3. Builds Docker images for frontend and backend using their respective `Dockerfile`.
4. Uses `docker-compose.yml` to manage services (e.g., MongoDB).
5. Pushes images to **Docker Hub**.

---

## 🔄 Jenkins Pipeline Stages

### ✅ Stage 1: Checkout Code
- Pulls the latest code from GitHub repository.

### 🧱 Stage 2: Build Frontend
- Installs frontend dependencies.
- Builds production-ready React frontend (`npm run build`).

### 🧱 Stage 3: Build Backend
- Installs backend dependencies (`npm install`).

### 🐋 Stage 4: Dockerize and Push Frontend
- Builds Docker image for frontend.
- Pushes it to Docker Hub.

### 🐋 Stage 5: Dockerize and Push Backend
- Builds Docker image for backend.
- Pushes it to Docker Hub.

---

📌 *This DevOps pipeline ensures continuous integration, reliable delivery, and platform-independent deployment of the Social Media Web Application.*
