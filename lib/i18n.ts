"use client"

import { useEffect, useState } from "react"
import { getLanguage, onLanguageChange, type Language } from "./language"

// ─────────────────────────────────────────────
// Типы
// ─────────────────────────────────────────────
type Dict = Record<string, string>

export const translations: Record<Language, Dict> = {
  // ═══════════════════════════════════════════
  // 🇺🇸 ENGLISH
  // ═══════════════════════════════════════════
  en: {
    // Header
    "nav.dashboard": "Dashboard",
    "nav.chat": "Chat",
    "nav.welcome": "Welcome",
    "nav.newChat": "New chat",
    "nav.settings": "Settings",
    "nav.language": "Language",
    "nav.theme": "Theme",
    "nav.theme.light": "Light",
    "nav.theme.dark": "Dark",
    "nav.theme.system": "System",

    // Empty state
    "empty.title": "Start messages",
    "empty.subtitle": "AI football predictions",

    // Quick prompts
    "prompt.today": "Give a prediction for today",
    "prompt.top5": "Top 5 matches today",
    "prompt.epl": "Premier League predictions",
    "prompt.risk": "What about risk?",

    // Chat header
    "chat.title": "Pelada",
    "chat.online": "online",
    "chat.analyzing": "analyzing...",

    // Pinned
    "pinned.label": "Pinned",

    // Prediction card
    "prediction.pick": "Pick",
    "prediction.confidence": "Confidence",
    "prediction.odds": "Odds",
    "prediction.why": "Why this prediction?",
    "prediction.copy": "Copy",
    "prediction.regenerate": "Regenerate",
    "prediction.good": "Good",
    "prediction.bad": "Bad",

    // Input
    "input.placeholder1": "Describe a match — I'll give a prediction...",
    "input.placeholder2": "Upload a betting line screenshot...",
    "input.placeholder3": "Top 5 matches today...",
    "input.auto": "Auto",
    "input.mode": "Mode",
    "input.mode.fast": "Fast",
    "input.mode.deep": "Deep analysis",
    "input.imageReady": "Image ready",
    "input.imageHint": "AI will recognize the match",
    "input.uploadTooltip": "Upload match screenshot",
    "input.send": "Send",

    // Drag&drop
    "drag.title": "Drop the image",
    "drag.subtitle": "AI will recognize the match",

    // Errors
    "error.failed": "Failed to get response",
    "error.imagesOnly": "Images only",
    "error.maxSize": "Max 15 MB",
    "error.imageProcess": "Failed to process image",

    // Sidebar predictions
    "side.predictions": "Predictions",
    "side.noPredictions": "No predictions yet",
    "side.askFirst": "Ask the AI for your first pick",
    "side.openChat": "Open chat",
    "side.detailedAnalysis": "Detailed analysis",
    "side.remove": "Remove",
    "side.justNow": "just now",
    "side.yesterday": "Yesterday",

    // AI Settings
    "settings.title": "AI Settings",
    "settings.subtitle": "Configure how your AI analyst thinks, speaks, and picks predictions",
    "settings.prompt.title": "System Prompt",
    "settings.prompt.desc": "Instructions the AI will strictly follow when generating predictions",
    "settings.prompt.label": "Custom instructions",
    "settings.prompt.placeholder": "Example:\nYou are an experienced football analyst...",
    "settings.prompt.hint": "Leave empty to use the built-in default. Custom prompts override the default completely.",
    "settings.prompt.warning": "Your prompt directly affects prediction quality.",
    "settings.save": "Save",
    "settings.saved": "Saved",
    "settings.reset": "Reset",
    "settings.resetAll": "Reset all",
    "settings.saveChanges": "Save changes",
    "settings.lastUpdate": "Last update: just now",

    // Model & Risk
    "settings.model.title": "Model & Risk",
    "settings.model.desc": "Choose the model, tone, and risk appetite",
    "settings.model.label": "AI Model",
    "settings.model.gptMini": "GPT-4o mini (fast)",
    "settings.model.gpt4o": "GPT-4o (recommended)",
    "settings.model.claude": "Claude 3.5 Sonnet",
    "settings.model.deepseek": "DeepSeek V3",
    "settings.risk.label": "Risk Level",
    "settings.risk.low": "Low — confident only (80%+)",
    "settings.risk.medium": "Medium — balanced (65%+)",
    "settings.risk.high": "High — includes risky (50%+)",
    "settings.tone.label": "Tone",
    "settings.tone.analytical": "Analytical — dry, factual",
    "settings.tone.friendly": "Friendly — warm, casual",
    "settings.tone.sharp": "Sharp — short, to the point",
    "settings.lang.label": "Response Language",
    "settings.lang.ru": "Russian",
    "settings.lang.en": "English",
    "settings.lang.pt": "Portuguese (Brazil)",
    "settings.lang.auto": "Auto (match user)",

    // Fine-tuning
    "settings.tune.title": "Fine-tuning",
    "settings.tune.desc": "Advanced parameters — leave defaults if unsure",
    "settings.tune.temp": "Temperature",
    "settings.tune.tempHint": "Lower = consistent & safe. Higher = creative & varied.",
    "settings.tune.tokens": "Max tokens",
    "settings.tune.tokensHint": "Maximum length of a single prediction response.",

    // Features
    "settings.features.title": "Features",
    "settings.features.desc": "Enable or disable specific AI capabilities",
    "settings.feature.vision": "Vision (image analysis)",
    "settings.feature.visionDesc": "Analyze screenshots of betting lines and match photos",
    "settings.feature.express": "Auto-express",
    "settings.feature.expressDesc": "Automatically suggest accumulator tickets from your picks",
    "settings.feature.memory": "Conversation memory",
    "settings.feature.memoryDesc": "Use chat history as context for follow-up predictions",

    "input.takePhoto": "Take photo",
    "input.chooseFromGallery": "Choose from gallery",
  },

  // ═══════════════════════════════════════════
  // 🇷🇺 РУССКИЙ
  // ═══════════════════════════════════════════
  ru: {
    // Header
    "nav.dashboard": "Дашборд",
    "nav.chat": "Чат",
    "nav.welcome": "Привет",
    "nav.newChat": "Новый чат",
    "nav.settings": "Настройки",
    "nav.language": "Язык",
    "nav.theme": "Тема",
    "nav.theme.light": "Светлая",
    "nav.theme.dark": "Тёмная",
    "nav.theme.system": "Системная",

    // Empty state
    "empty.title": "Начать общение",
    "empty.subtitle": "ИИ-прогнозы на футбол",

    // Quick prompts
    "prompt.today": "Дай прогноз на сегодня",
    "prompt.top5": "Топ-5 матчей на сегодня",
    "prompt.epl": "Прогноз на АПЛ",
    "prompt.risk": "Что по риску?",

    // Chat header
    "chat.title": "Pelada",
    "chat.online": "онлайн",
    "chat.analyzing": "анализирует...",

    // Pinned
    "pinned.label": "Закреплено",

    // Prediction card
    "prediction.pick": "Ставка",
    "prediction.confidence": "Уверенность",
    "prediction.odds": "Кэф",
    "prediction.why": "Почему такой прогноз?",
    "prediction.copy": "Копировать",
    "prediction.regenerate": "Перегенерировать",
    "prediction.good": "Хорошо",
    "prediction.bad": "Плохо",

    // Input
    "input.placeholder1": "Опиши матч — я дам прогноз...",
    "input.placeholder2": "Загрузи скриншот линии БК...",
    "input.placeholder3": "Топ-5 матчей на сегодня...",
    "input.auto": "Авто",
    "input.mode": "Режим",
    "input.mode.fast": "Быстрый",
    "input.mode.deep": "Глубокий анализ",
    "input.imageReady": "Изображение готово",
    "input.imageHint": "ИИ распознает матч и даст прогноз",
    "input.uploadTooltip": "Загрузить скриншот матча",
    "input.send": "Отправить",

    // Drag&drop
    "drag.title": "Отпусти изображение",
    "drag.subtitle": "ИИ распознает матч",

    // Errors
    "error.failed": "Не удалось получить ответ",
    "error.imagesOnly": "Только изображения",
    "error.maxSize": "Максимум 15 МБ",
    "error.imageProcess": "Не удалось обработать изображение",

    // Sidebar predictions
    "side.predictions": "Прогнозы",
    "side.noPredictions": "Пока нет прогнозов",
    "side.askFirst": "Спроси ИИ о первом прогнозе",
    "side.openChat": "Открыть чат",
    "side.detailedAnalysis": "Подробный анализ",
    "side.remove": "Удалить",
    "side.justNow": "только что",
    "side.yesterday": "Вчера",

    // AI Settings
    "settings.title": "Настройки ИИ",
    "settings.subtitle": "Настройте, как ИИ-аналитик думает, говорит и выбирает прогнозы",
    "settings.prompt.title": "Системный промпт",
    "settings.prompt.desc": "Инструкции, которым ИИ будет строго следовать при генерации прогнозов",
    "settings.prompt.label": "Свои инструкции",
    "settings.prompt.placeholder": "Пример:\nТы — опытный футбольный аналитик...",
    "settings.prompt.hint": "Оставь пустым, чтобы использовать встроенный дефолтный промпт.",
    "settings.prompt.warning": "Промпт напрямую влияет на качество прогнозов.",
    "settings.save": "Сохранить",
    "settings.saved": "Сохранено",
    "settings.reset": "Сбросить",
    "settings.resetAll": "Сбросить всё",
    "settings.saveChanges": "Сохранить изменения",
    "settings.lastUpdate": "Последнее обновление: только что",

    // Model & Risk
    "settings.model.title": "Модель и риск",
    "settings.model.desc": "Выберите модель, тон и уровень риска",
    "settings.model.label": "Модель ИИ",
    "settings.model.gptMini": "GPT-4o mini (быстрая)",
    "settings.model.gpt4o": "GPT-4o (рекомендуется)",
    "settings.model.claude": "Claude 3.5 Sonnet",
    "settings.model.deepseek": "DeepSeek V3",
    "settings.risk.label": "Уровень риска",
    "settings.risk.low": "Низкий — только уверенные (80%+)",
    "settings.risk.medium": "Средний — баланс (65%+)",
    "settings.risk.high": "Высокий — включая рискованные (50%+)",
    "settings.tone.label": "Тон",
    "settings.tone.analytical": "Аналитичный — сухо, по фактам",
    "settings.tone.friendly": "Дружелюбный — тепло, неформально",
    "settings.tone.sharp": "Sharp — коротко, по делу",
    "settings.lang.label": "Язык ответа",
    "settings.lang.ru": "Русский",
    "settings.lang.en": "Английский",
    "settings.lang.pt": "Португальский (Бразилия)",
    "settings.lang.auto": "Авто (как пользователь)",

    // Fine-tuning
    "settings.tune.title": "Тонкая настройка",
    "settings.tune.desc": "Продвинутые параметры — оставь дефолт, если не уверен",
    "settings.tune.temp": "Температура",
    "settings.tune.tempHint": "Ниже = стабильнее. Выше = креативнее.",
    "settings.tune.tokens": "Макс. токенов",
    "settings.tune.tokensHint": "Максимальная длина одного ответа.",

    // Features
    "settings.features.title": "Функции",
    "settings.features.desc": "Включайте и выключайте возможности ИИ",
    "settings.feature.vision": "Зрение (анализ изображений)",
    "settings.feature.visionDesc": "Анализирует скриншоты линии БК и фото матчей",
    "settings.feature.express": "Авто-экспресс",
    "settings.feature.expressDesc": "Автоматически предлагает экспрессы из прогнозов",
    "settings.feature.memory": "Память диалога",
    "settings.feature.memoryDesc": "Использует историю чата как контекст",

    "input.takePhoto": "Сделать фото",
    "input.chooseFromGallery": "Выбрать из галереи",
  },

  // ═══════════════════════════════════════════
  // 🇧🇷 PORTUGUÊS (BRASIL)
  // ═══════════════════════════════════════════
  "pt-BR": {
    // Header
    "nav.dashboard": "Painel",
    "nav.chat": "Chat",
    "nav.welcome": "Bem-vindo",
    "nav.newChat": "Novo chat",
    "nav.settings": "Configurações",
    "nav.language": "Idioma",
    "nav.theme": "Tema",
    "nav.theme.light": "Claro",
    "nav.theme.dark": "Escuro",
    "nav.theme.system": "Sistema",

    // Empty state
    "empty.title": "Iniciar mensagens",
    "empty.subtitle": "Previsões de futebol com IA",

    // Quick prompts
    "prompt.today": "Dê uma previsão para hoje",
    "prompt.top5": "Top 5 partidas de hoje",
    "prompt.epl": "Previsões da Premier League",
    "prompt.risk": "E o risco?",

    // Chat header
    "chat.title": "Pelada",
    "chat.online": "online",
    "chat.analyzing": "analisando...",

    // Pinned
    "pinned.label": "Fixado",

    // Prediction card
    "prediction.pick": "Palpite",
    "prediction.confidence": "Confiança",
    "prediction.odds": "Odd",
    "prediction.why": "Por que essa previsão?",
    "prediction.copy": "Copiar",
    "prediction.regenerate": "Regerar",
    "prediction.good": "Bom",
    "prediction.bad": "Ruim",

    // Input
    "input.placeholder1": "Descreva uma partida — vou dar uma previsão...",
    "input.placeholder2": "Envie um print da linha de apostas...",
    "input.placeholder3": "Top 5 partidas de hoje...",
    "input.auto": "Auto",
    "input.mode": "Modo",
    "input.mode.fast": "Rápido",
    "input.mode.deep": "Análise profunda",
    "input.imageReady": "Imagem pronta",
    "input.imageHint": "A IA vai reconhecer a partida",
    "input.uploadTooltip": "Enviar print da partida",
    "input.send": "Enviar",

    // Drag&drop
    "drag.title": "Solte a imagem",
    "drag.subtitle": "A IA vai reconhecer a partida",

    // Errors
    "error.failed": "Falha ao obter resposta",
    "error.imagesOnly": "Apenas imagens",
    "error.maxSize": "Máximo 15 MB",
    "error.imageProcess": "Falha ao processar a imagem",

    // Sidebar predictions
    "side.predictions": "Previsões",
    "side.noPredictions": "Nenhuma previsão ainda",
    "side.askFirst": "Peça sua primeira previsão à IA",
    "side.openChat": "Abrir chat",
    "side.detailedAnalysis": "Análise detalhada",
    "side.remove": "Remover",
    "side.justNow": "agora mesmo",
    "side.yesterday": "Ontem",

    // AI Settings
    "settings.title": "Configurações da IA",
    "settings.subtitle": "Configure como seu analista de IA pensa, fala e escolhe previsões",
    "settings.prompt.title": "Prompt do Sistema",
    "settings.prompt.desc": "Instruções que a IA vai seguir rigorosamente ao gerar previsões",
    "settings.prompt.label": "Instruções personalizadas",
    "settings.prompt.placeholder": "Exemplo:\nVocê é um analista experiente de futebol...",
    "settings.prompt.hint": "Deixe vazio para usar o padrão. Prompts customizados substituem o padrão.",
    "settings.prompt.warning": "Seu prompt afeta diretamente a qualidade das previsões.",
    "settings.save": "Salvar",
    "settings.saved": "Salvo",
    "settings.reset": "Redefinir",
    "settings.resetAll": "Redefinir tudo",
    "settings.saveChanges": "Salvar alterações",
    "settings.lastUpdate": "Última atualização: agora mesmo",

    // Model & Risk
    "settings.model.title": "Modelo e Risco",
    "settings.model.desc": "Escolha o modelo, tom e apetite de risco",
    "settings.model.label": "Modelo de IA",
    "settings.model.gptMini": "GPT-4o mini (rápido)",
    "settings.model.gpt4o": "GPT-4o (recomendado)",
    "settings.model.claude": "Claude 3.5 Sonnet",
    "settings.model.deepseek": "DeepSeek V3",
    "settings.risk.label": "Nível de Risco",
    "settings.risk.low": "Baixo — só confiáveis (80%+)",
    "settings.risk.medium": "Médio — equilibrado (65%+)",
    "settings.risk.high": "Alto — inclui arriscados (50%+)",
    "settings.tone.label": "Tom",
    "settings.tone.analytical": "Analítico — seco, factual",
    "settings.tone.friendly": "Amigável — caloroso, casual",
    "settings.tone.sharp": "Direto — curto, objetivo",
    "settings.lang.label": "Idioma da resposta",
    "settings.lang.ru": "Russo",
    "settings.lang.en": "Inglês",
    "settings.lang.pt": "Português (Brasil)",
    "settings.lang.auto": "Auto (igual ao usuário)",

    // Fine-tuning
    "settings.tune.title": "Ajustes finos",
    "settings.tune.desc": "Parâmetros avançados — deixe o padrão se não tiver certeza",
    "settings.tune.temp": "Temperatura",
    "settings.tune.tempHint": "Menor = consistente. Maior = criativo.",
    "settings.tune.tokens": "Máx. tokens",
    "settings.tune.tokensHint": "Tamanho máximo de uma resposta.",

    // Features
    "settings.features.title": "Recursos",
    "settings.features.desc": "Ative ou desative capacidades específicas da IA",
    "settings.feature.vision": "Visão (análise de imagem)",
    "settings.feature.visionDesc": "Analisa prints de linhas de apostas e fotos de partidas",
    "settings.feature.express": "Auto-express",
    "settings.feature.expressDesc": "Sugere automaticamente múltiplas a partir dos seus palpites",
    "settings.feature.memory": "Memória da conversa",
    "settings.feature.memoryDesc": "Usa o histórico do chat como contexto",

    "input.takePhoto": "Tirar foto",
    "input.chooseFromGallery": "Escolher da galeria",
  },
}

// ─────────────────────────────────────────────
// Хук useTranslation
// ─────────────────────────────────────────────
export function useTranslation() {
  const [lang, setLang] = useState<Language>("en")

  useEffect(() => {
    setLang(getLanguage())
    return onLanguageChange(setLang)
  }, [])

  const t = (key: string, fallback?: string): string => {
    const dict = translations[lang] ?? translations.en
    return dict[key] ?? translations.en[key] ?? fallback ?? key
  }

  return { t, lang }
}