# Installation & Configuration

## Vue d'Ensemble

Ce guide vous accompagne dans l'installation et la configuration du package `@editia/core` dans vos projets.

## 📦 Installation

### Via npm

```bash
npm install @editia/core
```

### Via yarn

```bash
yarn add @editia/core
```

### Via pnpm

```bash
pnpm add @editia/core
```

## ⚙️ Configuration

### 1. Variables d'Environnement

Créez un fichier `.env` avec les variables suivantes :

```bash
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Environment (optionnel)
NODE_ENV=development
```

### 2. Initialisation du Package

Dans votre fichier principal (`app.ts`, `index.ts`, ou `main.ts`) :

```typescript
import { initializeEditiaCore } from '@editia/core';

// Initialisation au démarrage de l'application
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  environment: process.env.NODE_ENV || 'development',
});
```

### 3. Configuration TypeScript

Ajoutez les types dans votre `tsconfig.json` :

```json
{
  "compilerOptions": {
    "types": ["@editia/core"]
  }
}
```

## 🔧 Exemples d'Utilisation

### Authentification Basique

```typescript
import { ClerkAuthService } from '@editia/core';

// Dans une route Express
app.get('/api/user', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { user, errorResponse } = await ClerkAuthService.verifyUser(authHeader);

  if (errorResponse) {
    return res.status(errorResponse.status).json(errorResponse);
  }

  res.json({ user });
});
```

### Middleware d'Authentification

```typescript
import { authenticateUser } from '@editia/core';

// Middleware global
app.use('/api', authenticateUser);

// Ou middleware spécifique
app.get('/api/protected', authenticateUser, (req, res) => {
  // req.user est maintenant disponible
  res.json({ user: req.user });
});
```

### Vérification d'Accès Pro

```typescript
import { ClerkAuthService } from '@editia/core';

app.get('/api/pro-feature', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { user, errorResponse } =
    await ClerkAuthService.verifyProUser(authHeader);

  if (errorResponse) {
    return res.status(errorResponse.status).json(errorResponse);
  }

  // L'utilisateur a accès aux fonctionnalités Pro
  res.json({ message: 'Pro feature accessed' });
});
```

## 🏗️ Intégration par Plateforme

### Express.js (Node.js)

```typescript
import express from 'express';
import { initializeEditiaCore, authenticateUser } from '@editia/core';

const app = express();

// Initialisation
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  environment: process.env.NODE_ENV || 'development',
});

// Middleware global
app.use('/api', authenticateUser);

// Routes
app.get('/api/user', (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000);
```

### Fastify (Node.js)

```typescript
import Fastify from 'fastify';
import { initializeEditiaCore, ClerkAuthService } from '@editia/core';

const fastify = Fastify();

// Initialisation
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  environment: process.env.NODE_ENV || 'development',
});

// Hook de pré-handler
fastify.addHook('preHandler', async (request, reply) => {
  const authHeader = request.headers.authorization;
  const { user, errorResponse } = await ClerkAuthService.verifyUser(authHeader);

  if (errorResponse) {
    return reply.status(errorResponse.status).send(errorResponse);
  }

  request.user = user;
});

// Routes
fastify.get('/api/user', async (request, reply) => {
  return { user: request.user };
});

fastify.listen({ port: 3000 });
```

### React Native (Mobile)

```typescript
// Dans votre app mobile, utilisez les headers d'authentification
import { API_HEADERS } from '@editia/core';

// Pour les appels API
const response = await fetch('/api/user', {
  headers: API_HEADERS.CLERK_AUTH(clerkToken),
});
```

## 🔐 Sécurité

### Variables d'Environnement

- **Ne jamais commiter** les clés secrètes dans le code
- **Utiliser des variables d'environnement** pour toutes les clés
- **Valider les variables** au démarrage

### Clés Supabase

- **Service Role Key** : Pour les opérations serveur (contourne RLS)
- **Anon Key** : Pour les opérations client (respecte RLS)
- **Ne jamais exposer** la clé de service role côté client

### Validation

```typescript
// Validation des variables d'environnement
function validateEnvironment() {
  const required = [
    'CLERK_SECRET_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

// Appeler avant l'initialisation
validateEnvironment();
initializeEditiaCore({...});
```

## 🧪 Tests

### Configuration de Test

```typescript
// test/setup.ts
import { initializeEditiaCore } from '@editia/core';

beforeAll(() => {
  initializeEditiaCore({
    clerkSecretKey: 'test_key',
    supabaseUrl: 'https://test.supabase.co',
    supabaseServiceRoleKey: 'test_service_key',
    environment: 'test',
  });
});
```

### Tests d'Authentification

```typescript
import { ClerkAuthService } from '@editia/core';

describe('Authentication', () => {
  it('should verify valid user', async () => {
    const { user, errorResponse } =
      await ClerkAuthService.verifyUser('Bearer valid_token');

    expect(errorResponse).toBeUndefined();
    expect(user).toBeDefined();
  });

  it('should reject invalid token', async () => {
    const { user, errorResponse } = await ClerkAuthService.verifyUser(
      'Bearer invalid_token'
    );

    expect(errorResponse).toBeDefined();
    expect(errorResponse?.status).toBe(401);
  });
});
```

## 🚨 Dépannage

### Erreur : "Service not initialized"

**Solution :** Assurez-vous d'appeler `initializeEditiaCore` avant d'utiliser les services.

### Erreur : "Invalid environment variables"

**Solution :** Vérifiez que toutes les variables d'environnement sont définies.

### Erreur : "RLS policy violation"

**Solution :** Utilisez `SUPABASE_SERVICE_ROLE_KEY` au lieu de `SUPABASE_ANON_KEY`.

## 🔗 Liens Utiles

- **[Architecture](../architecture/README.md)**
- **[API Reference](../api/README.md)**
- **[Migration Guide](../migration/README.md)**
- **[Stratégie Commerciale](../business/strategy.md)**
