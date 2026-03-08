# Library Microservice — Gestion de Bibliothèque Numérique

![CI/CD](https://github.com/lorisnve/projet-microservice-archi/actions/workflows/ci-cd.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-22-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey)
![License](https://img.shields.io/badge/License-ISC-yellow)

> Microservice REST de gestion de bibliothèque numérique — M1 Architecture Logicielle

---

## Table des matières

- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Endpoints API](#endpoints-api)
- [Tests](#tests)
- [Tests de performance (k6)](#tests-de-performance-k6)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker](#docker)
- [Kubernetes](#kubernetes)
- [Monitoring](#monitoring)
- [Structure du projet](#structure-du-projet)

---

## Architecture

```
┌────────────┐     ┌──────────────────────────────────────┐     ┌────────────┐
│   Client   │────▸│         Library Service (Express)     │────▸│ PostgreSQL │
│  (REST)    │◂────│  Auth · Books · Borrows · Monitoring  │◂────│   16-alpine│
└────────────┘     └──────────────┬───────────────────────┘     └────────────┘
                                  │ /metrics
                    ┌─────────────▼──────────────┐
                    │       Prometheus            │
                    │   (scrape every 15s)        │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │        Grafana              │
                    │   (dashboards auto-prov.)   │
                    └────────────────────────────┘
```

**Couches applicatives :**

```
Routes → Controllers → Services → Repositories → Models (Sequelize)
```

---

## Stack technique

| Composant        | Technologie                         |
|------------------|-------------------------------------|
| Runtime          | Node.js 22                          |
| Langage          | TypeScript 5.9 (ES2022, NodeNext)   |
| Framework HTTP   | Express 5.x                         |
| ORM              | Sequelize 6 + PostgreSQL             |
| Authentification | JWT (jsonwebtoken) + bcrypt          |
| Monitoring       | prom-client (Prometheus) + Grafana   |
| Tests unitaires  | Vitest 4.x + @vitest/coverage-v8    |
| Tests intégration| Vitest + supertest (vraie BDD)       |
| Tests de charge  | k6 (Grafana)                        |
| Linter           | ESLint v10 + typescript-eslint       |
| Conteneurisation | Docker (multistage) + Docker Compose |
| Orchestration    | Kubernetes (Minikube)               |
| CI/CD            | GitHub Actions (5 jobs)             |
| SAST             | CodeQL v4                           |
| Scan images      | Trivy                               |

---

## Prérequis

- **Node.js** ≥ 22
- **npm** ≥ 10
- **Docker** + **Docker Compose** v2
- **kubectl** (pour Kubernetes)
- **Minikube** (pour déploiement local K8s)
- **k6** (pour tests de performance)

---

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/lorisnve/projet-microservice-archi.git
cd projet-microservice-archi

# Installer les dépendances
npm ci

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (JWT_SECRET, DB_PASS, etc.)
```

---

## Lancement

### Mode développement (local)

```bash
npm run dev          # Serveur avec hot-reload (tsx)
```

### Mode production (compilé)

```bash
npm run build        # Compile TypeScript → dist/
npm start            # Lance dist/index.js
```

### Docker Compose (recommandé)

```bash
docker compose up -d --build
```

Cela lance 4 services :

| Service            | Port   | Description                  |
|--------------------|--------|------------------------------|
| `library-service`  | 8080   | API REST                     |
| `postgres`         | 5432   | Base de données PostgreSQL   |
| `prometheus`       | 9090   | Collecte de métriques        |
| `grafana`          | 3001   | Tableaux de bord             |

### Kubernetes (Minikube)

```bash
# Démarrer Minikube
minikube start --driver=docker

# Construire l'image dans le contexte Minikube
& minikube docker-env --shell powershell | Invoke-Expression
docker build -t ghcr.io/lorisnve/projet-microservice-archi:latest .

# Déployer les manifestes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/

# Vérifier le déploiement
kubectl get pods -n library-system
kubectl get svc -n library-system

# Accéder au service
kubectl port-forward svc/library-service-clusterip 8080:80 -n library-system
```

---

## Endpoints API

### Authentification

| Méthode | Endpoint               | Description          | Auth |
|---------|------------------------|----------------------|------|
| POST    | `/api/v1/auth/register`| Inscription          | Non  |
| POST    | `/api/v1/auth/login`   | Connexion (JWT)      | Non  |

### Livres

| Méthode | Endpoint                     | Description           | Rôle   |
|---------|------------------------------|-----------------------|--------|
| GET     | `/api/v1/books`              | Lister (paginé)       | USER+  |
| GET     | `/api/v1/books/:id`          | Détail d'un livre     | USER+  |
| POST    | `/api/v1/books`              | Créer un livre        | ADMIN  |
| PUT     | `/api/v1/books/:id`          | Modifier un livre     | ADMIN  |
| DELETE  | `/api/v1/books/:id`          | Supprimer un livre    | ADMIN  |

### Emprunts

| Méthode | Endpoint                     | Description           | Rôle   |
|---------|------------------------------|-----------------------|--------|
| POST    | `/api/v1/books/:id/borrow`   | Emprunter un livre    | USER+  |
| POST    | `/api/v1/books/:id/return`   | Retourner un livre    | USER+  |

### Monitoring

| Méthode | Endpoint    | Description              | Auth |
|---------|-------------|--------------------------|------|
| GET     | `/health`   | Healthcheck (+ état BDD) | Non  |
| GET     | `/metrics`  | Métriques Prometheus     | Non  |

> **Compte admin par défaut** : `admin@library.com` / `Admin1234!` (configurable via `.env`).

---

## Tests

```bash
# Tests unitaires
npm test

# Tests unitaires avec couverture
npm run test:coverage

# Tests d'intégration (nécessite PostgreSQL)
npm run test:integration

# Tous les tests
npm run test:all
```

| Type        | Nombre | Couverture |
|-------------|--------|------------|
| Unitaires   | 25     | > 80%     |
| Intégration | 27     | -          |

---

## Tests de performance (k6)

Un script k6 complet est fourni dans `k6/load-test.js`. Il simule un scénario réaliste :

- **Ramp-up** progressif jusqu'à 100 VUs
- Health check, login, liste de livres, création, emprunt/retour
- Métriques custom : `login_duration`, `book_list_duration`, `borrow_duration`

```bash
# Lancer le test de charge (Docker Compose doit tourner)
k6 run k6/load-test.js

# Avec une URL personnalisée
k6 run -e BASE_URL=http://localhost:9999 k6/load-test.js
```

**Seuils définis :**
- P95 latence < 500 ms
- P99 latence < 1 000 ms
- Taux d'erreur < 5%

**Résultats obtenus (100 VUs, 2 min 30 s) :**

| Métrique              | Valeur         |
|-----------------------|----------------|
| Requêtes totales      | ~18 300        |
| Throughput            | ~120 req/s     |
| Latence P95           | 28.56 ms ✅    |
| Latence P99           | 48.63 ms ✅    |
| Taux d'erreur         | 0.00% ✅       |
| Checks réussis        | 100% (12 185)  |

---

## CI/CD Pipeline

Le pipeline GitHub Actions (`.github/workflows/ci-cd.yml`) comporte 5 jobs séquentiels :

```
lint → test → build → push → deploy
```

| Job      | Description                                      | Déclenché sur           |
|----------|--------------------------------------------------|-------------------------|
| **lint** | ESLint + `tsc --noEmit` + CodeQL SAST             | push & PR               |
| **test** | Tests unitaires (coverage) + intégration (Postgres)| push & PR               |
| **build**| Docker build + scan Trivy (SARIF)                 | push & PR               |
| **push** | Push vers GHCR (tags : sha, branch, latest)       | push uniquement         |
| **deploy**| `kubectl apply` sur le cluster K8s               | push sur `main` uniquement |

---

## Docker

### Dockerfile

- **Build multistage** : `node:22-alpine` (builder) → `node:22-alpine` (runner)
- **Utilisateur non-root** (`appuser`) — principe du moindre privilège
- **HEALTHCHECK** intégré sur `/health`
- **Image finale** : ~180 Mo (dépendances de production uniquement)

```bash
# Build
docker build -t library-service .

# Run
docker run -p 8080:8080 --env-file .env library-service
```

---

## Kubernetes

Les 8 manifestes dans `k8s/` :

| Fichier            | Ressource                              |
|--------------------|----------------------------------------|
| `namespace.yaml`   | Namespace `library-system`             |
| `configmap.yaml`   | Configuration (PORT, DB_HOST, etc.)    |
| `secret.yaml`      | Secrets (DB_USER, DB_PASS, JWT_SECRET) |
| `pvc.yaml`         | PersistentVolumeClaim 1 Gi             |
| `deployment.yaml`  | PostgreSQL (1 replica) + Library (2 replicas, RollingUpdate) |
| `service.yaml`     | ClusterIP (interne) + LoadBalancer (externe) |
| `ingress.yaml`     | NGINX Ingress → `library.local`        |
| `hpa.yaml`         | HorizontalPodAutoscaler (2–6 pods, CPU 70%) |

**Stratégie de déploiement** : RollingUpdate (`maxSurge: 1`, `maxUnavailable: 0`) — zéro downtime.

**Probes** : Readiness & Liveness sur `GET /health:8080`.

---

## Monitoring

### Prometheus

- **Scrape** : toutes les 15 secondes sur `/metrics`
- **3 règles d'alerte** :
  - `HighErrorRate` — > 5% de réponses 5xx pendant 2 min
  - `HighLatencyP99` — P99 > 500 ms pendant 2 min
  - `ServiceDown` — service inaccessible pendant 1 min

### Grafana

- **Accès** : `http://localhost:3001` (admin/admin)
- **Datasource** Prometheus auto-provisionnée
- **Dashboard auto-provisionné** avec 6 panneaux :
  - Requêtes par seconde (par route et méthode)
  - Latence P50 / P95 / P99
  - Taux d'erreur (%)
  - Emprunts (total)
  - Disponibilité du service
  - Durée des requêtes DB (P95)

### Métriques exposées

| Métrique                          | Type      | Description                    |
|-----------------------------------|-----------|--------------------------------|
| `http_requests_total`             | Counter   | Total des requêtes HTTP        |
| `http_request_duration_seconds`   | Histogram | Durée des requêtes HTTP        |
| `library_borrows_total`           | Counter   | Nombre d'emprunts effectués    |
| `db_query_duration_seconds`       | Histogram | Durée des requêtes BDD         |

---

## Structure du projet

```
├── .github/workflows/ci-cd.yml     # Pipeline CI/CD
├── k6/load-test.js                  # Tests de performance k6
├── k8s/                             # Manifestes Kubernetes
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── pvc.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── monitoring/
│   ├── prometheus.yml               # Configuration Prometheus
│   ├── alert-rules.yml              # Règles d'alertes
│   └── grafana/provisioning/        # Auto-provisioning Grafana
│       ├── datasources/
│       └── dashboards/
├── src/
│   ├── index.ts                     # Point d'entrée
│   ├── app.ts                       # Configuration Express
│   ├── config/database.ts           # Configuration Sequelize
│   ├── models/                      # Modèles Sequelize (User, Book, Borrow)
│   ├── repositories/                # Couche d'accès aux données
│   ├── services/                    # Logique métier
│   ├── controllers/                 # Contrôleurs HTTP
│   ├── routes/                      # Définition des routes
│   ├── middlewares/                  # Auth JWT, validation
│   └── tests/                       # Tests unitaires
├── docker-compose.yml               # Stack complète (4 services)
├── Dockerfile                       # Build multistage
├── .env.example                     # Template des variables d'environnement
├── eslint.config.js                 # Configuration ESLint
├── tsconfig.json                    # Configuration TypeScript
├── vitest.config.ts                 # Configuration tests unitaires
└── vitest.integration.config.ts     # Configuration tests d'intégration
```

---

## Auteur

Projet réalisé dans le cadre du module **Architecture Logicielle** — M1.