# UI/UX Guidelines by Jason Suarez

*Context-driven design principles for AI-powered applications in the LLM era*

## Philosophy: Conversational Design in the AI Era

These guidelines embody a **conversational-first** approach to interface design, optimized for AI-powered workflows where the backend handles complexity and the frontend provides intuitive, chat-like interactions with minimal friction.

### Core Vision
- **Less is More**: Minimal interactions, maximum intelligence
- **AI as a Partner**: Interface anticipates and responds to AI workflows
- **Loading as Interaction**: Transform waiting into engagement through visible reasoning
- **Dark-First**: Sophisticated, distraction-free environments
- **Mobile-Native**: Touch-first, thumb-friendly interactions

## Design Inspirations

### Primary References
- **Airbnb Mobile App**: Sophisticated dark theme with contextual interactions
- **Linear**: Clean, minimal interface with excellent information hierarchy
- **Notion**: Conversational editing experience with progressive disclosure
- **Chat with Your Ex**: Minimal button interactions, conversation-driven UX

### Interaction Paradigms
- **Conversation over Configuration**: Chat interfaces instead of forms
- **Progressive Disclosure**: Show complexity only when needed
- **Contextual Actions**: Right action at the right time
- **Anticipatory UI**: Interface predicts user needs

## Core Principles

### 1. Conversational Interface Patterns
```typescript
// Good: Conversational flow
interface ConversationalFlow {
  type: 'chat' | 'toggle' | 'quick-select' | 'preview';
  immediateResponse: boolean;
  contextualActions: string[];
  loadingState: 'reasoning' | 'processing' | 'generating';
}

// Bad: Traditional form patterns
interface TraditionalForm {
  fields: FormField[];
  validation: ValidationRule[];
  submitButton: SubmitConfig;
}
```

### 2. AI-Aware Loading States
Transform waiting periods into engaging interactions:
- **Show AI Reasoning**: "Analyzing your content style..."
- **Progressive Steps**: Step-by-step breakdown of AI processes
- **Contextual Feedback**: Real-time updates on AI progress
- **Cancelable Operations**: Allow users to interrupt long processes

### 3. Minimal Interaction Patterns
- **Smart Defaults**: AI-powered preset selection
- **Single-Touch Actions**: Toggle complex configurations
- **Swipe Navigation**: Horizontal scrolling for options
- **Live Previews**: Immediate visual feedback

## Visual Design System

### Color Psychology for AI Interfaces

#### Primary Palette (Dark-First)
```json
{
  "background": {
    "primary": "#000000",    // Pure black - focus and sophistication
    "secondary": "#1a1a1a",  // Card backgrounds - subtle layering
    "tertiary": "#333333"    // Borders and dividers
  },
  "text": {
    "primary": "#ffffff",    // High contrast reading
    "secondary": "#cccccc",  // Secondary information
    "tertiary": "#888888",   // Metadata and hints
    "disabled": "#555555"    // Inactive states
  },
  "accent": {
    "primary": "#007AFF",    // iOS blue - trust and reliability
    "success": "#04f827",    // Bright green - completion and success
    "warning": "#FF9500",    // Orange - attention and caution
    "error": "#FF3B30",      // Red - errors and limits
    "ai": "#9c27b0"          // Purple - AI/intelligence indicator
  }
}
```

#### Semantic Color Usage
- **#000000**: App backgrounds, main containers
- **#1a1a1a**: Cards, modals, elevated surfaces
- **#007AFF**: Interactive elements, selected states, links
- **#04f827**: Success states, completion indicators
- **AI Purple (#9c27b0)**: AI processing, intelligent suggestions

### Typography for Conversation

#### Hierarchy
```typescript
interface TypographyScale {
  display: {
    size: 24;
    weight: 700;
    lineHeight: 32;
    usage: 'Screen titles, major sections';
  };
  title: {
    size: 20;
    weight: 600;
    lineHeight: 26;
    usage: 'Section headers, card titles';
  };
  body: {
    size: 16;
    weight: 400;
    lineHeight: 22;
    usage: 'Primary content, descriptions';
  };
  caption: {
    size: 14;
    weight: 500;
    lineHeight: 18;
    usage: 'Metadata, secondary info';
  };
  micro: {
    size: 12;
    weight: 400;
    lineHeight: 16;
    usage: 'Fine print, tags, counters';
  };
}
```

### Spacing System

#### Consistent Scale
- **4px**: Micro spacing (icon gaps, tight elements)
- **8px**: Small spacing (button padding, form elements)
- **12px**: Medium spacing (card internal padding)
- **16px**: Standard spacing (component margins)
- **20px**: Large spacing (screen padding)
- **24px**: Extra large spacing (section separation)
- **32px**: Section breaks (major component separation)

### Component Patterns

#### 1. Conversational Cards
```tsx
// Good: Conversational card with immediate interaction
<ConversationalCard
  title="🎥 Video Style"
  preview="Modern, energetic tone"
  onTap={() => showStyleOptions()}
  showChevron={true}
  aiSuggestion="Based on your previous videos"
/>

// Bad: Traditional form field
<FormField
  label="Video Style Selection"
  options={styleOptions}
  validation={required}
/>
```

#### 2. Smart Toggles
```tsx
// Good: Smart toggle with AI enhancement
<SmartToggle
  title="Subtitles"
  description="AI will choose optimal style"
  enabled={subtitlesEnabled}
  onToggle={handleSubtitleToggle}
  aiPreview="Karaoke-style, bright green"
/>
```

#### 3. Progressive Disclosure
```tsx
// Good: Progressive disclosure
<ExpandableSection
  title="Advanced Options"
  badge={hasAdvancedSettings ? "Configured" : null}
  preview={advancedPreview}
  expanded={showAdvanced}
>
  <AdvancedSettings />
</ExpandableSection>
```

## Interaction Patterns

### 1. Chat-Like Interactions
- **Immediate Response**: Every action provides instant feedback
- **Contextual Suggestions**: AI-powered recommendations
- **Natural Flow**: Conversation-like progression through tasks
- **Undo/Redo**: Easy reversal of actions

### 2. Touch-Optimized Gestures
- **Tap**: Primary actions, selections
- **Long Press**: Context menus, secondary actions
- **Swipe**: Navigation between options, dismissal
- **Pinch**: Zoom for detailed views (when applicable)

### 3. Loading State Conversations
```tsx
// Good: Engaging loading state
<AIProcessingIndicator
  step="Analyzing your script..."
  progress={0.6}
  steps={[
    "Reading your content",
    "Analyzing tone and style", // Current
    "Generating optimized script",
    "Creating visual elements"
  ]}
  allowCancel={true}
/>
```

## AI-Specific UX Patterns

### 1. Intelligent Defaults
- Use AI to predict user preferences
- Show confidence levels for suggestions
- Allow easy override of AI choices
- Learn from user corrections

### 2. Contextual Intelligence
```tsx
// Good: Contextually intelligent component
<IntelligentPresets
  category="video-style"
  userHistory={previousChoices}
  contentContext={currentScript}
  suggestions={aiSuggestions}
  onSelect={handlePresetSelect}
/>
```

### 3. Transparent AI
- Show AI reasoning when helpful
- Indicate AI-generated vs user-created content
- Provide confidence indicators
- Allow feedback on AI suggestions

## Component Architecture

### 1. Composition Over Configuration
```tsx
// Good: Composable components
<VideoCreationFlow>
  <ScriptInput aiEnhanced />
  <StyleSelector aiSuggestions={suggestions} />
  <PreviewSection live />
  <GenerationButton aiReady={isReady} />
</VideoCreationFlow>

// Bad: Monolithic configuration
<VideoCreationForm config={complexConfigObject} />
```

### 2. State Management for AI
- Immediate local state updates
- Optimistic updates for AI operations
- Graceful error handling and rollback
- Context preservation across AI operations

### 3. Responsive Intelligence
```tsx
interface ResponsiveAI {
  mobile: {
    pattern: 'conversational';
    interactions: 'touch-optimized';
    disclosure: 'progressive';
  };
  desktop: {
    pattern: 'sidebar-chat';
    interactions: 'keyboard-shortcuts';
    disclosure: 'expanded-view';
  };
}
```

## Implementation Guidelines

### 1. Development Workflow
1. **Start with Conversation**: Design the chat flow first
2. **Progressive Enhancement**: Add advanced features layer by layer  
3. **AI Integration**: Build AI feedback loops from the beginning
4. **Performance**: Optimize for perceived performance over raw metrics

### 2. Testing for AI UX
- **AI Response Times**: Test with realistic AI latencies
- **Error Scenarios**: Test AI failures and graceful degradation
- **User Learning**: Test how quickly users understand AI capabilities
- **Accessibility**: Ensure AI features work with assistive technologies

### 3. Quality Gates
- [ ] **Conversational Flow**: Can users complete tasks through natural interaction?
- [ ] **AI Transparency**: Do users understand what the AI is doing?
- [ ] **Loading Engagement**: Are waiting periods productive and engaging?
- [ ] **Mobile Performance**: Does it feel native and responsive?
- [ ] **Dark Theme**: Does it maintain readability and hierarchy in dark mode?

## Migration Strategy (StyleSheet → Tailwind)

### Phase 1: Style System Documentation
- Document current StyleSheet patterns
- Create Tailwind utility mappings
- Establish custom class conventions

### Phase 2: Component-by-Component Migration
- Start with leaf components (buttons, inputs)
- Move to composite components (cards, forms)
- Finish with layout components (screens, navigation)

### Phase 3: AI-Enhanced Styling
- Use AI to suggest optimal Tailwind combinations
- Create intelligent design token system
- Implement responsive design with AI insights

## Future Vision: LLM-Era Interfaces

### 2025-2026 Roadmap
- **Voice-First Interactions**: Seamless voice + touch interfaces
- **Predictive UI**: Interface anticipates needs before user acts
- **Adaptive Personalization**: UI evolves based on user behavior
- **Cross-Modal Intelligence**: Seamless transitions between text, voice, and visual input

The goal is to create interfaces that feel less like software and more like intelligent conversation partners, where the complexity of AI is hidden behind intuitive, beautiful, and engaging user experiences.



It's hard. The strategy I'm using:

First step is use Tailwind or other atomic CSS. They do better out of the box. And most importantly, using atomic CSS means that you won't break one page while you're making changes to a different page.

Use some component based framework like React/Angular/etc so that you can work on the view components separately from the rest of the site.

Tell Claude to make a Storybook app for you.

Then browse the Storybook and do a quality check pass on each component one by one (and tell Claude what to fix). It will do a lot better if it's only doing one component at a time, instead of sorting through the noise of the whole site.