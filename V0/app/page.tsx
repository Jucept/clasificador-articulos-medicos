"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import {
  Brain,
  FileText,
  BarChart3,
  Zap,
  Upload,
  HelpCircle,
  Activity,
  Target,
  TrendingUp,
  Database,
  Sparkles,
  Globe,
  Github,
  Play,
  Eye,
  CommandIcon,
} from "lucide-react"

// Mock data
const medicalCategories = [
  "Oncología",
  "Cardiología",
  "Epidemiología",
  "Ensayo clínico",
  "Revisión sistemática",
  "Diagnóstico por imagen",
  "Neurología",
]

const sampleAbstracts = [
  "Estudio retrospectivo de 245 pacientes con diagnóstico de carcinoma hepatocelular tratados con sorafenib entre 2018-2022. Se evaluó la supervivencia global y tiempo hasta progresión. Los resultados muestran una mediana de supervivencia de 14.2 meses con toxicidad manejable.",
  "Análisis de cohorte prospectivo evaluando factores de riesgo cardiovascular en población mediterránea. Se incluyeron 1,847 participantes seguidos durante 5 años. La adherencia a dieta mediterránea se asoció con reducción del 23% en eventos cardiovasculares mayores.",
  "Revisión sistemática y meta-análisis de 28 estudios sobre eficacia de resonancia magnética en detección temprana de Alzheimer. La sensibilidad combinada fue del 87% y especificidad del 82% para biomarcadores de neuroimagen.",
]

const mockMetrics = {
  accuracy: 0.82,
  macroF1: 0.77,
  baseline: { accuracy: 0.74, macroF1: 0.69 },
}

const confusionMatrix = [
  [45, 3, 2, 1, 0, 1, 0],
  [2, 38, 1, 2, 1, 0, 1],
  [1, 1, 42, 2, 1, 0, 0],
  [0, 2, 3, 41, 1, 0, 1],
  [1, 0, 1, 2, 39, 2, 0],
  [0, 1, 0, 1, 1, 43, 1],
  [0, 0, 1, 1, 0, 2, 44],
]

export default function MedicalAIApp() {
  const [currentSection, setCurrentSection] = useState(0)
  const [inputText, setInputText] = useState("")
  const [predictions, setPredictions] = useState<any[]>([])
  const [isClassifying, setIsClassifying] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [liveMode, setLiveMode] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })

  const sections = [
    { id: "hero", title: "Inicio" },
    { id: "problem", title: "El Problema" },
    { id: "pipeline", title: "Pipeline" },
    { id: "playground", title: "Playground" },
    { id: "results", title: "Resultados" },
    { id: "ethics", title: "Ética" },
  ]

  // Mock classification function
  const classifyText = async (text: string) => {
    setIsClassifying(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const mockPredictions = medicalCategories
      .map((category) => ({
        category,
        probability: Math.random() * 0.8 + 0.1,
        confidence: Math.random() * 0.3 + 0.7,
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3)

    setPredictions(mockPredictions)
    setIsClassifying(false)
  }

  // Live classification with debounce
  useEffect(() => {
    if (liveMode && inputText.length > 50) {
      const timer = setTimeout(() => {
        classifyText(inputText)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [inputText, liveMode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && inputText) {
        e.preventDefault()
        classifyText(inputText)
      }
      if (e.key === "?" && !showCommandPalette) {
        setShowCommandPalette(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [inputText, showCommandPalette])

  const scrollToSection = (index: number) => {
    setCurrentSection(index)
    const element = document.getElementById(sections[index].id)
    element?.scrollIntoView({ behavior: "smooth" })
  }

  const text = {
    es: {
      hero: {
        title: "AI + Data Challenge",
        subtitle: "Clasificador de Literatura Médica",
        description: "Explora, clasifica y explica resultados en tiempo real",
        tryDemo: "Probar demo",
        seeStory: "Ver historia",
      },
      problem: {
        title: "El Problema",
        points: [
          "Volumen masivo de papers médicos dificulta el triage eficiente",
          "Necesidad de etiquetas precisas: tema, diseño de estudio, población",
          "Riesgos de sesgo y la importancia de no sustituir criterio clínico",
        ],
      },
      pipeline: {
        title: "Datos y Pipeline",
        steps: ["Ingesta", "Limpieza", "Split train/val/test", "Entrenamiento"],
        reproducibility: "Reproducibilidad garantizada (seed fija)",
        warning: "Sin datos PII - Cuidado con desbalance de clases",
      },
      playground: {
        title: "Playground de Clasificación",
        placeholder: "Pega aquí tu abstract médico para clasificar...",
        classify: "Clasificar",
        liveMode: "Modo tiempo real",
        upload: "Subir archivo",
        why: "¿Por qué?",
        examples: "Ejemplos",
      },
      results: {
        title: "Resultados y Métricas",
        accuracy: "Precisión",
        macroF1: "Macro-F1",
        baseline: "Baseline",
        transformer: "Transformer",
        confusionMatrix: "Matriz de Confusión",
      },
      ethics: {
        title: "Consideraciones Éticas",
        warning: "No reemplaza juicio clínico. Riesgo de sesgos por dominio/idioma.",
        deliverables: "Entregables: repo, notebook, demo, README, métricas",
        repo: "Ver repositorio",
        continue: "Continuar iteración",
      },
    },
    en: {
      hero: {
        title: "AI + Data Challenge",
        subtitle: "Medical Literature Classifier",
        description: "Explore, classify and explain results in real time",
        tryDemo: "Try demo",
        seeStory: "See story",
      },
      problem: {
        title: "The Problem",
        points: [
          "Massive volume of medical papers makes efficient triage difficult",
          "Need for precise labels: topic, study design, population",
          "Bias risks and importance of not replacing clinical judgment",
        ],
      },
      pipeline: {
        title: "Data and Pipeline",
        steps: ["Ingestion", "Cleaning", "Train/val/test split", "Training"],
        reproducibility: "Guaranteed reproducibility (fixed seed)",
        warning: "No PII data - Beware of class imbalance",
      },
      playground: {
        title: "Classification Playground",
        placeholder: "Paste your medical abstract here to classify...",
        classify: "Classify",
        liveMode: "Live mode",
        upload: "Upload file",
        why: "Why?",
        examples: "Examples",
      },
      results: {
        title: "Results and Metrics",
        accuracy: "Accuracy",
        macroF1: "Macro-F1",
        baseline: "Baseline",
        transformer: "Transformer",
        confusionMatrix: "Confusion Matrix",
      },
      ethics: {
        title: "Ethical Considerations",
        warning: "Does not replace clinical judgment. Risk of domain/language bias.",
        deliverables: "Deliverables: repo, notebook, demo, README, metrics",
        repo: "View repository",
        continue: "Continue iteration",
      },
    },
  }

  const t = text[language]

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-mono text-sm">MedAI</span>
            </div>

            <div className="flex items-center gap-4">
              <Progress value={(currentSection / (sections.length - 1)) * 100} className="w-32" />
              <Button variant="ghost" size="sm" onClick={() => setShowCommandPalette(true)} className="gap-2">
                <CommandIcon className="w-4 h-4" />
                <span className="hidden sm:inline">⌘K</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "es" ? "en" : "es")}>
                <Globe className="w-4 h-4" />
                {language.toUpperCase()}
              </Button>
            </div>
          </div>
        </nav>

        {/* Section indicators */}
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSection === index
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>

        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute inset-0">
            {/* Animated particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 2,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t.hero.title}
              </h1>
              <h2 className="text-2xl md:text-4xl font-light mb-6 text-muted-foreground">{t.hero.subtitle}</h2>
              <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto">{t.hero.description}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => scrollToSection(3)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t.hero.tryDemo}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection(1)}
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  {t.hero.seeStory}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="min-h-screen flex items-center py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-12 text-center">{t.problem.title}</h2>

              <div className="grid md:grid-cols-3 gap-8">
                {t.problem.points.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-lg leading-relaxed">{point}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pipeline Section */}
        <section id="pipeline" className="min-h-screen flex items-center py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-12 text-center">{t.pipeline.title}</h2>

              <div className="grid md:grid-cols-4 gap-6 mb-12">
                {t.pipeline.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-primary font-bold">{index + 1}</span>
                        </div>
                        <h3 className="font-semibold">{step}</h3>
                      </CardContent>
                    </Card>
                    {index < t.pipeline.steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/50" />
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Database className="w-4 h-4 mr-2" />
                  {t.pipeline.reproducibility}
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {t.pipeline.warning}
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Playground Section */}
        <section id="playground" className="min-h-screen flex items-center py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-12 text-center">{t.playground.title}</h2>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Clasificador Inteligente
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLiveMode(!liveMode)}
                        className={liveMode ? "text-primary" : ""}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        {t.playground.liveMode}
                        {liveMode && <Badge className="ml-2 bg-primary text-primary-foreground">LIVE</Badge>}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={t.playground.placeholder}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-32 bg-input border-border/50"
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => classifyText(inputText)}
                      disabled={!inputText || isClassifying}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isClassifying ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                        />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      {t.playground.classify}
                    </Button>

                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      {t.playground.upload}
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          {t.playground.examples}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Ejemplos de Abstracts</DialogTitle>
                          <DialogDescription>Haz clic en cualquier ejemplo para probarlo</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {sampleAbstracts.map((abstract, index) => (
                            <Card
                              key={index}
                              className="cursor-pointer hover:bg-accent/50 transition-colors"
                              onClick={() => {
                                setInputText(abstract)
                                toast({ title: "Ejemplo cargado", description: "Texto copiado al playground" })
                              }}
                            >
                              <CardContent className="p-4">
                                <p className="text-sm">{abstract}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Predictions */}
                  <AnimatePresence>
                    {predictions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          Predicciones
                        </h3>

                        <div className="grid gap-3">
                          {predictions.map((pred, index) => (
                            <motion.div
                              key={pred.category}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant={index === 0 ? "default" : "secondary"}>{pred.category}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {(pred.probability * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={pred.probability * 100} className="w-20 h-2" />
                                <Sheet>
                                  <SheetTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <HelpCircle className="w-4 h-4" />
                                      {t.playground.why}
                                    </Button>
                                  </SheetTrigger>
                                  <SheetContent>
                                    <SheetHeader>
                                      <SheetTitle>Explicación: {pred.category}</SheetTitle>
                                      <SheetDescription>¿Por qué el modelo predijo esta categoría?</SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-6 space-y-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Palabras clave detectadas:</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {["tratamiento", "pacientes", "estudio", "resultados"].map((word) => (
                                            <Badge key={word} variant="outline">
                                              {word}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Confianza del modelo:</h4>
                                        <Progress value={pred.confidence * 100} className="w-full" />
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {(pred.confidence * 100).toFixed(1)}% de confianza
                                        </p>
                                      </div>
                                    </div>
                                  </SheetContent>
                                </Sheet>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section id="results" className="min-h-screen flex items-center py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-12 text-center">{t.results.title}</h2>

              {/* Metrics Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      {t.results.accuracy}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {(mockMetrics.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      +{((mockMetrics.accuracy - mockMetrics.baseline.accuracy) * 100).toFixed(1)}% vs baseline
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-secondary" />
                      {t.results.macroF1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary mb-2">{mockMetrics.macroF1.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      +{(mockMetrics.macroF1 - mockMetrics.baseline.macroF1).toFixed(2)} vs baseline
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Model Comparison */}
              <Tabs defaultValue="transformer" className="mb-12">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="baseline">{t.results.baseline}</TabsTrigger>
                  <TabsTrigger value="transformer">{t.results.transformer}</TabsTrigger>
                </TabsList>
                <TabsContent value="baseline" className="space-y-4">
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">TF-IDF + Logistic Regression</h3>
                      <p className="text-muted-foreground">
                        Modelo baseline rápido y interpretable. Bueno para prototipado inicial.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="transformer" className="space-y-4">
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">DistilBERT Fine-tuned</h3>
                      <p className="text-muted-foreground">
                        Modelo transformer optimizado para dominio médico. Mayor precisión y comprensión contextual.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Confusion Matrix */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t.results.confusionMatrix}</CardTitle>
                  <CardDescription>Haz clic en cualquier celda para ver ejemplos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-1 text-xs">
                    <div></div>
                    {medicalCategories.map((cat) => (
                      <div key={cat} className="p-2 text-center font-semibold text-muted-foreground">
                        {cat.slice(0, 3)}
                      </div>
                    ))}
                    {confusionMatrix.map((row, i) => (
                      <div key={i} className="contents">
                        <div className="p-2 text-center font-semibold text-muted-foreground">
                          {medicalCategories[i].slice(0, 3)}
                        </div>
                        {row.map((value, j) => (
                          <Tooltip key={j}>
                            <TooltipTrigger asChild>
                              <button
                                className={`p-2 text-center rounded transition-colors ${
                                  i === j
                                    ? "bg-primary/20 text-primary font-bold"
                                    : value > 0
                                      ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                                      : "bg-muted/20 text-muted-foreground"
                                }`}
                              >
                                {value}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Verdadero: {medicalCategories[i]}</p>
                              <p>Predicho: {medicalCategories[j]}</p>
                              <p>Casos: {value}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Ethics Section */}
        <section id="ethics" className="min-h-screen flex items-center py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-12">{t.ethics.title}</h2>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-8">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-destructive" />
                    </div>
                  </div>
                  <p className="text-lg mb-6">{t.ethics.warning}</p>
                  <p className="text-muted-foreground">{t.ethics.deliverables}</p>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Github className="w-5 h-5 mr-2" />
                  {t.ethics.repo}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-secondary/50 hover:bg-secondary/10 bg-transparent"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t.ethics.continue}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Command Palette */}
        <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
          <DialogContent className="max-w-2xl">
            <Command>
              <CommandInput placeholder="Buscar acciones..." />
              <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup heading="Navegación">
                  {sections.map((section, index) => (
                    <CommandItem
                      key={section.id}
                      onSelect={() => {
                        scrollToSection(index)
                        setShowCommandPalette(false)
                      }}
                    >
                      {section.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Acciones">
                  <CommandItem
                    onSelect={() => {
                      setInputText(sampleAbstracts[0])
                      setShowCommandPalette(false)
                      scrollToSection(3)
                    }}
                  >
                    Pegar ejemplo de demo
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setLiveMode(!liveMode)
                      setShowCommandPalette(false)
                    }}
                  >
                    {liveMode ? "Desactivar" : "Activar"} modo tiempo real
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
