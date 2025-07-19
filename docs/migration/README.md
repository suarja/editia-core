# Guide de Migration vers Editia Core

## Vue d'Ensemble

Ce guide vous accompagne dans la migration depuis les anciens services d'authentification vers le package centralisé `@editia/core`.

## 🔄 Changements Principaux

### 1. Configuration

**Avant (Ancien Service) :**

```typescript
// server-primary/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**Après (Editia Core) :**

```typescript
// server-primary/src/app.ts
import { initializeEditiaCore } from '@editia/core';

initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  environment: process.env.NODE_ENV || 'development',
});
```

### 2. Authentification

**Avant (Service Manuel) :**

```typescript
// server-primary/src/services/clerkAuthService.ts
export class ClerkAuthService {
  static async verifyUser(
    authHeader?: string | null
  ): Promise<ClerkAuthResult> {
    // Logique manuelle de vérification
  }
}

// Dans les routes
const authHeader = req.headers.authorization;
const { user, errorResponse: authError } =
  await ClerkAuthService.verifyUser(authHeader);
if (authError) {
  return res.status(authError.status).json(authError);
}
```

**Après (Package Centralisé) :**

```typescript
// Import depuis le package
import { ClerkAuthService } from '@editia/core';

// Dans les routes (même logique)
const authHeader = req.headers.authorization;
const { user, errorResponse: authError } =
  await ClerkAuthService.verifyUser(authHeader);
if (authError) {
  return res.status(authError.status).json(authError);
}
```

### 3. Middleware d'Authentification

**Avant (Middleware Manuel) :**

```typescript
// server-analyzer/src/middleware/auth.ts
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const { user, errorResponse } = await AuthService.verifyUser(authHeader);
  if (errorResponse) {
    return res.status(errorResponse.status).json(errorResponse);
  }
  req.user = user;
  next();
}
```

**Après (Middleware du Package) :**

```typescript
// Import depuis le package
import { authenticateUser } from '@editia/core';

// Utilisation identique
app.use('/api', authenticateUser);
```

## 📋 Checklist de Migration

### Phase 1 : Préparation

- [ ] Installer le package `@editia/core`
- [ ] Vérifier les variables d'environnement
- [ ] Sauvegarder les anciens services

### Phase 2 : Configuration

- [ ] Initialiser Editia Core dans `app.ts`
- [ ] Supprimer l'ancienne configuration Supabase
- [ ] Tester l'initialisation

### Phase 3 : Migration des Services

- [ ] Remplacer les imports des anciens services
- [ ] Migrer les appels d'authentification
- [ ] Tester chaque endpoint

### Phase 4 : Nettoyage

- [ ] Supprimer les anciens services
- [ ] Supprimer les anciens types
- [ ] Mettre à jour la documentation

## 🚨 Points d'Attention

### 1. Variables d'Environnement

Assurez-vous d'avoir toutes les variables requises :

```bash
# Obligatoires
CLERK_SECRET_KEY=sk_...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optionnelles
NODE_ENV=production
```

### 2. Gestion d'Erreurs

Les erreurs retournées par le package sont standardisées :

```typescript
interface AuthErrorResponse {
  status: number;
  message: string;
  code: string;
}
```

### 3. Types TypeScript

Les types sont maintenant centralisés dans le package :

```typescript
// Avant
import { ClerkAuthResult } from '../services/clerkAuthService';

// Après
import { AuthResult } from '@editia/core';
```

## 🔧 Résolution de Problèmes

### Erreur : "Service not initialized"

**Cause :** Le package n'a pas été initialisé avant utilisation.

**Solution :**

```typescript
// Assurez-vous que initializeEditiaCore est appelé au démarrage
import { initializeEditiaCore } from '@editia/core';

// Dans app.ts ou index.ts
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  environment: process.env.NODE_ENV || 'development',
});
```

### Erreur : "RLS policy violation"

**Cause :** Utilisation de la clé anonyme au lieu de la clé de service.

**Solution :**

```typescript
// Utilisez SUPABASE_SERVICE_ROLE_KEY, pas SUPABASE_ANON_KEY
initializeEditiaCore({
  // ...
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!, // ✅
  // supabaseAnonKey: process.env.SUPABASE_ANON_KEY!, // ❌
});
```

### Erreur : "User not found"

**Cause :** L'utilisateur n'existe pas dans la base de données.

**Solution :**

- Vérifiez que l'utilisateur existe dans la table `users`
- Vérifiez que le `clerk_user_id` correspond
- Utilisez la clé de service role pour contourner RLS

## 📊 Comparaison des Performances

### Avant (Services Locaux)

- **Taille du bundle :** +50KB par service
- **Duplication de code :** ~30% entre services
- **Maintenance :** 3 services séparés à maintenir

### Après (Package Centralisé)

- **Taille du bundle :** ~20KB partagé
- **Duplication de code :** 0%
- **Maintenance :** 1 package centralisé

## 🔗 Liens Utiles

- **[Architecture](../architecture/README.md)**
- **[API Reference](../api/README.md)**
- **[Installation & Configuration](../setup/README.md)**
- **[Stratégie Commerciale](../business/strategy.md)**

## 📞 Support

Si vous rencontrez des problèmes lors de la migration :

1. Consultez la [documentation API](../api/README.md)
2. Vérifiez les [logs du serveur](../deployment/monitoring.md)
3. Testez avec les [exemples fournis](../setup/README.md)
