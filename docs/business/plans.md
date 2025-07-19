# Plans & Fonctionnalités

## Vue d'Ensemble

Ce document détaille les plans d'abonnement et les fonctionnalités d'Editia, ainsi que leur implémentation technique dans le package `@editia/core`.

## 📊 Plans d'Abonnement

### Plan Découverte (Gratuit)

**Objectif :** Moteur de viralité et découverte du produit

| Fonctionnalité            | Limite                  | Description                      |
| ------------------------- | ----------------------- | -------------------------------- |
| **Analyse de Compte**     | 1 analyse unique        | Analyse limitée du compte TikTok |
| **Génération de Scripts** | 3 scripts/mois          | Scripts basiques générés par IA  |
| **Chat avec l'IA**        | ✅ Illimité             | Conseils éditoriaux              |
| **Upload de Vidéos**      | 5 vidéos max            | Vidéos B-roll pour créations     |
| **Clonage de Voix**       | ❌                      | Non disponible                   |
| **Génération de Vidéos**  | **1 vidéo (watermark)** | Vidéo avec filigrane "Editia"    |
| **Styles de Sous-titres** | Basique                 | Styles limités                   |
| **Analyse Niche**         | ❌                      | Non disponible                   |
| **Idées de Contenu**      | ❌                      | Non disponible                   |
| **Programmation**         | ❌                      | Non disponible                   |

### Plan Créateur (€29/mois)

**Objectif :** Outil complet pour professionnels

| Fonctionnalité            | Limite             | Description                 |
| ------------------------- | ------------------ | --------------------------- |
| **Analyse de Compte**     | ✅ Illimité        | Analyses complètes          |
| **Génération de Scripts** | ✅ Illimité        | Scripts personnalisés       |
| **Chat avec l'IA**        | ✅ Illimité        | Conseils avancés            |
| **Upload de Vidéos**      | ✅ Illimité        | Vidéos B-roll illimitées    |
| **Clonage de Voix**       | ✅ 1 voix          | Clone vocal personnel       |
| **Génération de Vidéos**  | **10 vidéos/mois** | Vidéos sans watermark       |
| **Styles de Sous-titres** | ✅ Tous            | Tous les styles disponibles |
| **Analyse Niche**         | ❌                 | Non disponible              |
| **Idées de Contenu**      | ❌                 | Non disponible              |
| **Programmation**         | ❌                 | Non disponible              |

### Plan Pro (€79/mois)

**Objectif :** Outil de croissance et stratégie

| Fonctionnalité            | Limite             | Description                 |
| ------------------------- | ------------------ | --------------------------- |
| **Analyse de Compte**     | ✅ Illimité        | Analyses complètes          |
| **Génération de Scripts** | ✅ Illimité        | Scripts personnalisés       |
| **Chat avec l'IA**        | ✅ Illimité        | Conseils avancés            |
| **Upload de Vidéos**      | ✅ Illimité        | Vidéos B-roll illimitées    |
| **Clonage de Voix**       | ✅ 3 voix          | Multiples clones vocaux     |
| **Génération de Vidéos**  | **30 vidéos/mois** | Vidéos sans watermark       |
| **Styles de Sous-titres** | ✅ Tous            | Tous les styles disponibles |
| **Analyse Niche**         | ✅ Rapports hebdo  | Analyses concurrentielles   |
| **Idées de Contenu**      | ✅ Notifications   | Tendances et suggestions    |
| **Programmation**         | ✅ Connecteurs     | TikTok/YouTube              |

## 🏗️ Implémentation Technique

### Base de Données

#### Table `subscription_plans`

```sql
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  videos_generated_limit INTEGER NOT NULL,
  source_videos_limit INTEGER NOT NULL,
  voice_clones_limit INTEGER NOT NULL,
  account_analysis_limit INTEGER NOT NULL,
  is_unlimited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Données initiales :**

```sql
INSERT INTO subscription_plans VALUES
('decouverte', 'Plan Découverte', 1, 5, 0, 1, false),
('createur', 'Plan Créateur', 10, -1, 1, -1, false),
('pro', 'Plan Pro', 30, -1, 3, -1, false);
```

#### Table `user_usage`

```sql
CREATE TABLE user_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  current_plan_id TEXT REFERENCES subscription_plans(id),
  subscription_status TEXT DEFAULT 'active',

  -- Compteurs de consommation
  videos_generated_count INTEGER DEFAULT 0,
  source_videos_uploaded_count INTEGER DEFAULT 0,
  account_analysis_count INTEGER DEFAULT 0,

  -- Limites actuelles (synchronisées depuis subscription_plans)
  videos_generated_limit INTEGER NOT NULL,
  source_videos_limit INTEGER NOT NULL,
  account_analysis_limit INTEGER NOT NULL,
  voice_clones_limit INTEGER NOT NULL,

  next_reset_date TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Feature Flags

#### Table `feature_flags`

```sql
CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  required_plan TEXT REFERENCES subscription_plans(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Configuration des fonctionnalités :**

```sql
INSERT INTO feature_flags VALUES
('account_analysis', 'Analyse de Compte', 'Analyse approfondie du compte TikTok', NULL, true),
('chat_ai', 'Chat IA Éditorial', 'Chat avec l''IA pour conseils éditoriaux', 'decouverte', true),
('script_generation', 'Génération de Scripts', 'Générer des scripts personnalisés avec IA', 'createur', true),
('video_generation', 'Génération de Vidéos', 'Générer des vidéos automatiquement avec IA', 'createur', true),
('source_videos', 'Upload de Vidéos Sources', 'Uploader des vidéos B-roll pour vos créations', 'createur', true),
('advanced_subtitles', 'Sous-titres Avancés', 'Styles de sous-titres personnalisés', 'createur', true),
('voice_clone', 'Clonage Vocal', 'Créer un clone de votre voix pour la narration', 'createur', true),
('multiple_voices', 'Voix Multiples', 'Gérer plusieurs voix clonées', 'pro', true),
('niche_analysis', 'Analyse de Niche/Compétition', 'Analyses concurrentielles et rapports hebdomadaires', 'pro', true),
('content_ideas', 'Idées de Contenu Proactives', 'Notifications de tendances et suggestions', 'pro', true),
('scheduling', 'Programmation de Contenu', 'Connecter et programmer sur TikTok/YouTube', 'pro', true);
```

## 🔧 API du Package

### Vérification d'Accès aux Fonctionnalités

```typescript
import { FeatureAccessService } from '@editia/core';

// Vérifier l'accès à une fonctionnalité
const { hasAccess, remainingUsage, totalLimit } =
  await FeatureAccessService.checkAccess(userId, 'video_generation');

if (!hasAccess) {
  return res.status(403).json({
    error: 'Feature not available for your plan',
    requiredPlan: 'createur',
  });
}
```

### Suivi d'Usage

```typescript
import { UsageTrackingService } from '@editia/core';

// Incrémenter l'usage
await UsageTrackingService.incrementUsage(userId, 'videos_generated');

// Vérifier les limites
const { canUse, remaining } = await UsageTrackingService.checkLimit(
  userId,
  'videos_generated'
);
```

### Synchronisation des Abonnements

```typescript
import { SubscriptionSyncService } from '@editia/core';

// Synchroniser avec RevenueCat
await SubscriptionSyncService.syncFromRevenueCat(userId, customerInfo);

// Mettre à jour les limites
await SubscriptionSyncService.updateUserLimits(userId, 'pro');
```

## 🎯 Stratégie de Conversion

### Plan Découverte → Créateur

**Triggers de conversion :**

- Utilisateur génère sa première vidéo (watermark)
- Utilisateur atteint la limite de 5 vidéos uploadées
- Utilisateur essaie d'accéder au clonage vocal

**Messages de conversion :**

- "Débloquez 10 vidéos/mois sans watermark"
- "Créez votre clone vocal personnel"
- "Accédez à tous les styles de sous-titres"

### Plan Créateur → Pro

**Triggers de conversion :**

- Utilisateur atteint la limite de 10 vidéos/mois
- Utilisateur essaie d'ajouter une 2ème voix
- Utilisateur consulte les analyses de niche

**Messages de conversion :**

- "Passez à 30 vidéos/mois"
- "Gérez jusqu'à 3 voix clonées"
- "Analysez votre concurrence"

## 📈 Métriques et Analytics

### KPIs à Suivre

**Acquisition :**

- Taux de conversion Découverte → Créateur
- Taux de conversion Créateur → Pro
- Coût d'acquisition client (CAC)

**Rétention :**

- Taux de rétention par plan
- Churn rate mensuel
- Lifetime value (LTV)

**Usage :**

- Vidéos générées par utilisateur
- Utilisation des fonctionnalités par plan
- Limites atteintes

### Implémentation des Métriques

```typescript
import { AnalyticsService } from '@editia/core';

// Tracker une conversion
await AnalyticsService.trackConversion(userId, 'decouverte', 'createur');

// Tracker l'usage d'une fonctionnalité
await AnalyticsService.trackFeatureUsage(userId, 'video_generation');

// Calculer les métriques
const metrics = await AnalyticsService.getUserMetrics(userId);
```

## 🔗 Liens Utiles

- **[Stratégie Commerciale](./strategy.md)**
- **[Feature Flags](./feature-flags.md)**
- **[Paiements & Abonnements](./payments.md)**
- **[API Reference](../api/README.md)**
