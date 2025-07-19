# Documentation Editia Core

## Vue d'Ensemble

Ce package `@editia/core` centralise toute la logique partagée entre les différents projets Editia : **authentification**, **monétisation**, **gestion des types de base de données**, et **utilitaires communs**.

## 📚 Structure de la Documentation

### 🏗️ Architecture & Développement

- **[Architecture](./architecture/README.md)** - Vue d'ensemble de l'architecture du package
- **[Installation & Configuration](./setup/README.md)** - Guide d'installation et de configuration
- **[API Reference](./api/README.md)** - Documentation complète de l'API
- **[Migration Guide](./migration/README.md)** - Guide de migration depuis les anciens services

### 💰 Monétisation & Business

- **[Stratégie Commerciale](./business/strategy.md)** - Stratégie d'offres et de tarification
- **[Plans & Fonctionnalités](./business/plans.md)** - Détail des plans et fonctionnalités
- **[Feature Flags](./business/feature-flags.md)** - Système de gestion des accès
- **[Paiements & Abonnements](./business/payments.md)** - Implémentation des paiements

### 🔐 Authentification & Sécurité

- **[Authentification Clerk](./auth/clerk-integration.md)** - Intégration avec Clerk
- **[Base de Données](./auth/database.md)** - Gestion des utilisateurs dans Supabase
- **[Sécurité & RLS](./auth/security.md)** - Politiques de sécurité et RLS

### 🚀 Déploiement & Production

- **[Checklist de Publication](./deployment/publishing-checklist.md)** - Checklist pour App Store & Google Play
- **[Configuration Production](./deployment/production.md)** - Configuration pour la production
- **[Monitoring & Logs](./deployment/monitoring.md)** - Surveillance et logs

## 🎯 Objectifs du Package

### 1. Centralisation de l'Authentification

- **Clerk Integration** : Gestion unifiée des tokens JWT Clerk
- **Supabase Integration** : Synchronisation avec la base de données
- **User Management** : Services de gestion des utilisateurs
- **Auth Middleware** : Middlewares d'authentification pour Express

### 2. Centralisation de la Monétisation

- **Feature Flags** : Gestion des accès aux fonctionnalités
- **Usage Tracking** : Suivi de l'utilisation des ressources
- **Subscription Management** : Gestion des abonnements et plans
- **Access Control** : Vérification des permissions utilisateur

### 3. Gestion Unifiée des Types

- **Types Supabase** : Génération et synchronisation automatique
- **Types Métier** : Interfaces TypeScript pour l'authentification et la monétisation
- **Validation** : Schémas de validation des données

## 📦 Installation

```bash
npm install @editia/core
```

## ⚡ Utilisation Rapide

```typescript
import { initializeEditiaCore, ClerkAuthService } from '@editia/core';

// Initialisation
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  environment: 'production',
});

// Vérification d'authentification
const { user, error } = await ClerkAuthService.verifyUser(authHeader);
```

## 🔄 Migration

Si vous migrez depuis les anciens services d'authentification, consultez le [Guide de Migration](./migration/README.md).

## 📈 Roadmap

- [ ] Feature flags avancés
- [ ] Système de notifications
- [ ] Analytics intégrés
- [ ] Support multi-tenant

## 🤝 Contribution

Ce package est central pour l'écosystème Editia. Toute modification doit être documentée et testée.

## 📄 Licence

MIT License - voir [LICENSE](../LICENSE) pour plus de détails.
