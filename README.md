# Delivery Platform — Microservices PFA

Plateforme de livraison **full stack** construite en architecture microservices : authentification JWT, domaines métier découpés, observabilité distribuée (Zipkin), orchestration Docker Compose, et interface React multi-rôles (client, livreur, administrateur).

| | |
|---|---|
| **Auteur** | Amine Içame |
| **Type** | Projet de fin d'année (PFA) |
| **Stack back** | Java 17 · Spring Boot 3.5 · Spring Cloud 2025.0 · PostgreSQL 15 |
| **Stack front** | React 19 · Vite · Axios · React Router · Recharts · Tailwind |
| **Infra** | Docker Compose · Eureka · Config Server · API Gateway · Zipkin |

---

## Architecture

```
                    ┌─────────────────┐
   Navigateur ─────►│  React (Vite)   │  :5173
                    │  client/driver  │
                    │  /admin         │
                    └────────┬────────┘
                             │ HTTP + Bearer JWT
                             ▼
                    ┌─────────────────┐
                    │ gateway-service │  :8080
                    │ JWT filter +    │
                    │ Eureka locator  │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
   identity-service   customer / product   order / delivery
        :9898         (bases dédiées)      (bases dédiées)
           │
           ▼
   ┌──────────────┐   ┌────────────────┐   ┌────────────┐
   │ discovery    │   │ config-service │   │  Zipkin    │
   │ Eureka :8761 │   │ :8888          │   │  :9411     │
   └──────────────┘   └────────────────┘   └────────────┘
                             │
                             ▼
                      PostgreSQL :5432
           db_delivery_auth | _customer | _product
                            | _order    | _logistics
```

### Services

| Service | Rôle | Port |
|---|---|---|
| `discovery-service` | Annuaire Eureka (service discovery) | `8761` |
| `config-service` | Configuration centralisée (Spring Cloud Config) | `8888` |
| `gateway-service` | Point d'entrée unique, filtre JWT, routage dynamique via Eureka | `8080` |
| `identity-service` | Inscription, login, émission / validation JWT (Spring Security) | `9898` |
| `customer-service` | Profils et gestion des clients | — |
| `product-service` | Catalogue produits (CRUD) | — |
| `order-service` | Commandes + suivi public par numéro de tracking | — |
| `delivery-service` | Livreurs, courses, assignation, statuts de livraison | — |
| `frontend` | SPA React (espaces public, client, livreur, admin) | `5173` → `80` |

Chaque service métier dispose de **sa propre base PostgreSQL** (database-per-service), créée au démarrage via `docker-data/init.sql`.

---

## Fonctionnalités

### Sécurité
- Authentification **JWT** (HS256, TTL 30 min) émise par `identity-service`
- Filtre `AuthenticationFilter` sur la gateway : validation du Bearer token sur toutes les routes sauf liste blanche
- Routes publiques : `/auth/register`, `/auth/token`, suivi de commande `/api/orders/track/...`, Actuator
- Le front injecte le token via un intercepteur Axios (`Authorization: Bearer …`)

### Métier
- **Client** : catalogue, création de commandes, historique, paramètres de profil
- **Livreur** : courses assignées, mise à jour de statut (`PICKED_UP`, `DELIVERED`…), historique
- **Admin** : dashboard, clients, livreurs (validation), produits, commandes, assignation des livraisons
- **Public** : suivi de commande par numéro de tracking (sans authentification)

### Observabilité
- Traçage distribué **Micrometer Tracing + Zipkin** (échantillonnage à 100 % en démo)
- Endpoints Actuator : `health`, `info`, `prometheus`
- Une requête se suit de la gateway jusqu'aux services métier dans l'UI Zipkin (`http://localhost:9411`)

---

## Démarrage rapide

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Compose v2)
- ~8 Go de RAM recommandés pour lancer toute la pile

### Lancer toute la plateforme

```bash
git clone https://github.com/Amine-icame/delivery-microservices-pfa.git
cd delivery-microservices-pfa
docker compose up --build
```

Au premier démarrage, Docker construit les images Maven/Node puis démarre Postgres, Zipkin, les 8 services Spring et le front.

### URLs utiles

| Ressource | URL |
|---|---|
| Application (front) | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Zipkin UI | http://localhost:9411 |
| Config Server | http://localhost:8888 |

### Arrêt

```bash
docker compose down
# avec suppression des volumes Postgres :
docker compose down -v
```

---

## Développement local (sans Docker pour un service)

1. Démarrer au minimum **Postgres**, **Eureka** et **Zipkin** (via Compose ou installés localement).
2. Créer les bases listées dans `docker-data/init.sql`.
3. Lancer un service depuis son module Maven :

```bash
cd delivery-microservices/identity-service/identity-service
./mvnw spring-boot:run
```

4. Front en mode dev :

```bash
cd delivery-frontend
npm install
npm run dev
```

Le front pointe par défaut vers `http://localhost:8080` (gateway). Voir `delivery-frontend/src/services/api.js`.

> Les URLs Eureka / datasource acceptent des variables d'environnement (hybride local + Docker), par ex. `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE`.

---

## Structure du dépôt

```
delivery-microservices-pfa/
├── docker-compose.yml          # Orchestration complète
├── docker-data/
│   └── init.sql                # Création des 5 bases métier
├── delivery-microservices/
│   ├── discovery-service/
│   ├── config-service/
│   ├── gateway-service/        # Filtre JWT + locator Eureka
│   ├── identity-service/       # Auth + JWT
│   ├── customer-service/
│   ├── product-service/
│   ├── order-service/
│   └── delivery-service/
└── delivery-frontend/          # React (Vite) — pages public / client / driver / admin
```

---

## Exemples d'API (via la gateway)

```bash
# Inscription
curl -X POST http://localhost:8080/identity-service/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo\",\"email\":\"demo@example.com\",\"password\":\"secret\"}"

# Login → JWT
curl -X POST http://localhost:8080/identity-service/auth/token \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo\",\"password\":\"secret\"}"

# Catalogue (avec token)
curl http://localhost:8080/product-service/api/products \
  -H "Authorization: Bearer <TOKEN>"

# Suivi public d'une commande
curl http://localhost:8080/order-service/api/orders/track/<TRACKING_NUMBER>
```

> Le routage utilise le **discovery locator** Eureka (`spring.cloud.gateway.discovery.locator.enabled=true`) : les chemins suivent le pattern `/{service-id}/...` en minuscules.

---

## Décisions techniques

| Choix | Pourquoi |
|---|---|
| Database-per-service | Isolation des domaines, évolution indépendante des schémas |
| Gateway + filtre JWT | Sécurité centralisée ; les services métier ne gèrent pas le CORS/auth HTTP |
| Eureka locator | Pas besoin de déclarer chaque route à la main pendant la phase PFA |
| Zipkin 100 % sampling | Débogage et démonstration pédagogique du tracing |
| Monorepo + Compose | Un `docker compose up` suffit pour un recruteur ou un jury |

---

## Pistes d'amélioration

- [ ] Extraire les secrets (mot de passe Postgres, clé JWT) vers un fichier `.env` non versionné
- [ ] Healthchecks Compose + attente explicite d'Eureka/Config avant le démarrage des services métier
- [ ] Remplacer les `System.out.println` du filtre gateway par un logger structuré
- [ ] Tests d'intégration (Testcontainers) sur le parcours login → commande → livraison
- [ ] CI GitHub Actions : build Maven + build front + `docker compose config`

---

## Auteur

**Amine Içame** — Ingénieur logiciel Full Stack  
GitHub : [Amine-icame](https://github.com/Amine-icame)

Projet réalisé dans le cadre d'un **PFA** (projet de fin d'année).
