# Editia Core

Un package TypeScript pour l'authentification, la monétisation et la gestion de base de données unifiées pour toutes les applications Editia.

## 🚀 Installation

```bash
npm install editia-core
```

## 📦 Fonctionnalités

- **Authentification Clerk + Supabase** : Vérification JWT et gestion utilisateurs
- **Middleware Express** : Protection de routes avec authentification
- **TypeScript** : Types complets et sécurité de type
- **Sans logging** : Délégation de la gestion des logs à l'application

## 🔧 Initialisation

```typescript
import { initializeEditiaCore } from 'editia-core';

// Initialiser le package avec vos variables d'environnement
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  environment: process.env.NODE_ENV || 'development',
});
```

## 🔐 Authentification

### Utilisation du Service Directement

```typescript
import { ClerkAuthService } from 'editia-core';

// Dans un endpoint Express
app.get('/api/user-voices', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { user, clerkUser, errorResponse } =
      await ClerkAuthService.verifyUser(authHeader);

    if (errorResponse) {
      return res.status(errorResponse.status).json(errorResponse);
    }

    // user contient les données de l'utilisateur depuis Supabase
    // clerkUser contient les données de l'utilisateur depuis Clerk

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        clerkId: clerkUser.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});
```

### Utilisation du Middleware

```typescript
import { authenticateUser } from 'editia-core';

// Protéger une route avec le middleware
app.get('/api/protected', authenticateUser, (req, res) => {
  // req.user contient l'utilisateur authentifié
  res.json({
    success: true,
    user: {
      id: req.user?.id,
      email: req.user?.email,
    },
  });
});
```

## 📋 Exemple Complet : Endpoint User Voices

Voici un exemple complet d'implémentation d'un endpoint utilisant le package :

```typescript
import express from 'express';
import { ClerkAuthService, initializeEditiaCore } from 'editia-core';
import { createClient } from '@supabase/supabase-js';

// Initialiser le package
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  environment: 'production',
});

const app = express();
app.use(express.json());

// Endpoint pour récupérer les voix de l'utilisateur
app.get('/api/user-voices', async (req, res) => {
  try {
    // 1. Authentifier l'utilisateur avec le package
    const authHeader = req.headers.authorization;
    const { user, errorResponse } =
      await ClerkAuthService.verifyUser(authHeader);

    if (errorResponse || !user) {
      return res.status(errorResponse?.status || 401).json(
        errorResponse || {
          success: false,
          error: 'User not found',
        }
      );
    }

    // 2. Utiliser Supabase pour récupérer les données
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('voice_clones')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // 3. Retourner les données
    return res.status(200).json({
      success: true,
      data,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 🎯 API Reference

### ClerkAuthService

#### `verifyUser(authHeader?: string)`

Vérifie un token JWT Clerk et retourne les informations utilisateur.

**Paramètres :**

- `authHeader` (string, optionnel) : Header Authorization (format: "Bearer <token>")

**Retour :**

```typescript
{
  user: DatabaseUser | null; // Utilisateur depuis Supabase
  clerkUser: ClerkUser | null; // Utilisateur depuis Clerk
  errorResponse: AuthErrorResponse | null; // Erreur si échec
}
```

#### `getDatabaseUserId(authHeader?: string)`

Récupère uniquement l'ID utilisateur depuis la base de données.

**Retour :** `string | null`

### Middleware

#### `authenticateUser`

Middleware Express pour protéger les routes.

**Utilisation :**

```typescript
app.get('/protected', authenticateUser, (req, res) => {
  // req.user contient l'utilisateur authentifié
});
```

### Types

```typescript
interface DatabaseUser {
  id: string;
  email: string;
  full_name?: string;
  clerk_user_id: string;
  created_at: string;
  updated_at: string;
}

interface AuthErrorResponse {
  success: false;
  error: string;
  status: number;
}

interface AuthenticatedRequest extends Request {
  user?: DatabaseUser;
}
```

## 🔄 Migration depuis l'ancien système

Si vous migrez depuis un système d'authentification existant :

1. **Remplacer les imports :**

   ```typescript
   // Avant
   import { ClerkAuthService } from '../services/clerkAuthService';

   // Après
   import { ClerkAuthService } from 'editia-core';
   ```

2. **Initialiser le package :**

   ```typescript
   // Ajouter au début de votre app.ts
   import { initializeEditiaCore } from 'editia-core';

   initializeEditiaCore({
     clerkSecretKey: process.env.CLERK_SECRET_KEY!,
     supabaseUrl: process.env.SUPABASE_URL!,
     supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
     environment: process.env.NODE_ENV || 'development',
   });
   ```

3. **Les appels d'API restent identiques :**
   ```typescript
   // Le code existant continue de fonctionner
   const { user, clerkUser, errorResponse } =
     await ClerkAuthService.verifyUser(authHeader);
   ```

## 🧪 Tests

Le package inclut des tests complets avec Vitest :

```bash
npm test
```

## 📝 Logs

**Important :** Ce package ne gère pas les logs. La gestion des logs est déléguée à l'application principale pour une meilleure flexibilité et contrôle.

## 🤝 Contribution

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.
