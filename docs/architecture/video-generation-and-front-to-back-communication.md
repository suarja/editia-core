# Video Generation Refactoring and Front-to-Back Communication

Pour la future génération de vidéos qui va de la mobile app vers le server primary, l'objectif est non seulement de mettre à jour, en gros d'importer dans l'editia-core, le NPM Package, les types qui sont communs aux deux et qui permettraient de partager les types. Partager les types et les types qui sont déjà en place et qui pourraient être partagés sans casser aucun des deux dossiers. Et aussi créer, par exemple, un peu dans l'esprit, mais seulement l'esprit de TAPC, créer des response types qui permettraient de typer la requête front-end-back-end. En gros, de typer la requête entrante vers le back-end, et la requête, le retour, la réponse, en gros, du back-end vers le front-end, vers le mobile app, par exemple, pour la génération de vidéos. Et ainsi établir une sorte de patron, d'organisation, d'architecture pour cette communication et cette organisation du code. C'est déjà un peu ce qu'on essaie de faire avec Parsimony, puisque le NPM Package n'est pas encore... En fait, en gros, c'est quelque chose que l'on vient d'ajouter à la codebase pour harmoniser le code, mais ce n'est pas en place partout. Et il faut y aller petit à petit.

## Objectifs :

- Utiliser le NPM Package editia-core pour la feature de génération de vidéos
- Partager les types communs aux deux dossiers
- Créer des response types qui permettraient de typer la requête front-end-back-end
- Établir une sorte de patron, d'organisation, d'architecture pour cette communication et cette organisation du code
- Harmoniser le code, la validation, les checks et la strategie de monetization ()
- Créer des tests pour les types
- Documenter l'organisation du code et la feature

## Fichiers à analyser:

- `server-primary/src/routes/api/videos.ts`
- `server-primary/src/services/video/validation.ts`
- `server-primary/src/types/video.ts`
- `mobile/lib/types/video.types.ts`
- `mobile/app/hooks/useVideoRequest.ts`
- `mobile/components/VideoList.tsx`
- `mobile/components/VideoCard.tsx`
- `mobile/lib/services/scriptService.ts`
- `mobile/app/(drawer)/request-video.tsx`
- `mobile/app/(drawer)/script-video-settings.tsx`
- `mobile/app/(drawer)/videos/[id].tsx`
-

## TODO:

- unifier les operations sur le template de video en un seul service?
- Template task:
  - Verifier si les captions are enabled or not and remove them from the generated template
  - Verifier si chaque video à l'interieur du template à une duree au moins egale à la duree du du text (voiceover) estimee avec une formule conservatrice de `script_length * 0.8`

- Fix video details page n'a pas de mise a jour du statut via pooliing de la video-request
- creer un custom hook pour le polling de la video-request

## Points a surviller:

- cote mobile, plusieurs type de videos existent (les videos sources (uploadees par l'user pour etre utilisees dans la genereation) et les videos generées par l'user)

## Points potentiels d'amélioration:

- La validation avec zod dans le VideoValidationService
- S'inspirer de la feature d'analyse de compte tiktok et de son 'real time' status display pour ajouter des status à la `video-request` afin de fournir une experience similaire lors de la génération de vidéos.

                    "text": "You are a software development project manager tasked with creating a detailed plan for a video generation refactoring project. Your goal is to analyze the given task description and create a comprehensive plan that addresses all aspects of the project. Follow these steps:\n\n1. Carefully read and analyze the following task description:\n<task_description>\n{{TASK_DESCRIPTION}}\n</task_description>\n\n2. Based on the task description, identify and list the main objectives of the project.\n\n3. Create a list of files that need to be analyzed and potentially modified during the refactoring process.\n\n4. Develop a detailed plan with specific steps to achieve the project goals. Your plan should include:\n   a. Steps for implementing the use of the NPM Package editia-core\n   b. Process for sharing common types between front-end and back-end\n   c. Creation of response types for front-end to back-end communication\n   d. Establishment of a pattern or architecture for code organization and communication\n   e. Steps for harmonizing code, validation, checks, and monetization strategy\n   f. Process for creating tests for the types\n   g. Documentation of code organization and features\n\n5. Address the points to watch out for, as mentioned in the task description.\n\n6. Suggest potential improvements based on the information provided in the task description.\n\n7. Create a timeline or prioritize the steps in your plan.\n\nPresent your final plan in the following format:\n\n<plan>\n1. Project Objectives:\n   [List the main objectives]\n\n2. Files to Analyze and Modify:\n   [List the files]\n\n3. Detailed Implementation Plan:\n   [Provide a step-by-step plan, including sub-steps where necessary]\n\n4. Points to Watch:\n   [List important considerations]\n\n5. Potential Improvements:\n   [Suggest improvements]\n\n6. Timeline and Priorities:\n   [Provide a prioritized list or timeline of tasks]\n</plan>\n\nEnsure that your plan is comprehensive, addressing all aspects mentioned in the task description, and provides clear guidance for the development team to execute the video generation refactoring project."
