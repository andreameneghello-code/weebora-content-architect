"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Upload, ArrowRight, BookOpen, Palmtree,
  Trophy, Users, CheckCircle2, Loader2, X, File,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/lib/use-toast"
import { createProduct, setAllLanguageContents, updateProduct } from "@/lib/local-storage"
import { cn } from "@/lib/utils"
import type { ProductContentData } from "@/lib/gemini"

const CATEGORIES = [
  {
    id: "ACADEMY",
    label: "Academy",
    icon: BookOpen,
    description: "Training camps, clinics, coaching programs",
    color: "text-[#5B3FBF]",
    bg: "bg-[#F0EBFF]",
    selectedBorder: "border-[#3A2895]",
    selectedBg: "bg-[#F5F2FF]",
  },
  {
    id: "HOLIDAY",
    label: "Holiday",
    icon: Palmtree,
    description: "Padel holidays, resort packages, leisure trips",
    color: "text-[#1FA89E]",
    bg: "bg-[#E6F9F8]",
    selectedBorder: "border-[#3EC9C1]",
    selectedBg: "bg-[#F0FAFA]",
  },
  {
    id: "TOURNAMENT",
    label: "Tournament",
    icon: Trophy,
    description: "Tournament tickets, VIP packages, match experiences",
    color: "text-[#C4660A]",
    bg: "bg-[#FFF1E6]",
    selectedBorder: "border-[#FF9B4E]",
    selectedBg: "bg-[#FFF8F2]",
  },
  {
    id: "GROUP_TRIP",
    label: "Group Trip",
    icon: Users,
    description: "Group retreats, squad experiences, social trips",
    color: "text-[#1A9A6B]",
    bg: "bg-[#E6F9F2]",
    selectedBorder: "border-[#3EC9A1]",
    selectedBg: "bg-[#F0FBF7]",
  },
]

const GENERATION_STEPS = [
  "Parsing brief document...",
  "Analysing product category...",
  "Generating English content...",
  "Translating to Italian...",
  "Translating to Spanish...",
  "Translating to French...",
  "Finalising and saving...",
]

export function NewProductWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<"setup" | "generating" | "done">("setup")
  const [category, setCategory] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (f: File | null) => {
    if (!f) return
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ]
    const isDoc =
      allowed.includes(f.type) ||
      f.name.endsWith(".pdf") ||
      f.name.endsWith(".docx") ||
      f.name.endsWith(".doc")
    if (!isDoc) {
      toast({ title: "Invalid file", description: "Please upload a PDF or Word document", variant: "destructive" })
      return
    }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileChange(e.dataTransfer.files[0] ?? null)
  }

  const handleGenerate = async () => {
    if (!category || !file) return

    setStep("generating")
    setGenerationStep(0)
    setProgress(5)

    try {
      // Step 1: Parse document
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error ?? "Failed to parse document")
      }
      const { text } = await uploadRes.json()

      setGenerationStep(1)
      setProgress(15)

      // Create product in localStorage immediately
      const product = createProduct(category as never, text)
      updateProduct(product.id, { status: "GENERATING" })

      setGenerationStep(2)
      setProgress(25)

      // Animate progress steps while generation runs
      let stepIndex = 2
      const stepInterval = setInterval(() => {
        if (stepIndex < GENERATION_STEPS.length - 2) {
          stepIndex++
          setGenerationStep(stepIndex)
          setProgress(25 + Math.round((stepIndex / (GENERATION_STEPS.length - 2)) * 60))
        }
      }, 5000)

      // Call the generate API
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefText: text, category }),
      })
      clearInterval(stepInterval)

      if (!genRes.ok) {
        const err = await genRes.json()
        updateProduct(product.id, { status: "DRAFT" })
        throw new Error(err.error ?? "Generation failed")
      }

      const { content } = await genRes.json() as { content: Record<string, ProductContentData> }

      // Save all language contents to localStorage
      setAllLanguageContents(product.id, content)

      setGenerationStep(GENERATION_STEPS.length - 1)
      setProgress(100)
      setStep("done")

      setTimeout(() => {
        router.push(`/products/${product.id}/edit`)
      }, 1200)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong"
      toast({ title: "Generation failed", description: message, variant: "destructive" })
      setStep("setup")
      setProgress(0)
      setGenerationStep(0)
    }
  }

  if (step === "generating" || step === "done") {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[#EEE9FF] flex items-center justify-center mx-auto mb-6">
            {step === "done" ? (
              <CheckCircle2 size={32} className="text-[#3A2895]" />
            ) : (
              <Loader2 size={32} className="text-[#3A2895] animate-spin" />
            )}
          </div>
          <h2 className="text-xl font-bold text-[#1A1530] mb-2">
            {step === "done" ? "Content Generated!" : "Generating content..."}
          </h2>
          <p className="text-[#6B6882] text-sm mb-8">
            {step === "done"
              ? "Redirecting you to the editor..."
              : "AI is crafting your product content in 4 languages. This takes 30–90 seconds."}
          </p>

          <div className="bg-white rounded-2xl border border-[#E4E0F0] p-6 shadow-[0_4px_16px_rgba(58,40,149,0.06)]">
            <Progress value={progress} className="mb-5" />
            <div className="space-y-2.5">
              {GENERATION_STEPS.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2.5 text-sm transition-all",
                    i < generationStep
                      ? "text-[#2AABA3]"
                      : i === generationStep
                      ? "text-[#3A2895] font-semibold"
                      : "text-[#D0CCDF]"
                  )}
                >
                  {i < generationStep ? (
                    <CheckCircle2 size={14} className="shrink-0" />
                  ) : i === generationStep ? (
                    <Loader2 size={14} className="shrink-0 animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#E4E0F0] shrink-0" />
                  )}
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1530]">New Product</h1>
        <p className="text-[#6B6882] text-sm mt-1">
          Upload a brief and let AI generate complete multilingual content
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1: Category */}
        <div>
          <h2 className="text-base font-semibold text-[#1A1530] mb-1">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#3A2895] text-white rounded-full text-xs font-bold mr-2">
              1
            </span>
            Select product category
          </h2>
          <p className="text-sm text-[#6B6882] mb-4 ml-8">
            The category determines the tone of voice and content strategy.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isSelected = category === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                    isSelected
                      ? `${cat.selectedBorder} ${cat.selectedBg} shadow-[0_4px_12px_rgba(58,40,149,0.1)]`
                      : "border-[#E4E0F0] bg-white hover:border-[#3A2895]/30 hover:shadow-sm"
                  )}
                >
                  <div className={cn("p-2.5 rounded-xl mt-0.5", cat.bg)}>
                    <Icon size={18} className={cat.color} />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A1530] text-sm">{cat.label}</div>
                    <div className="text-xs text-[#9E9BAC] mt-0.5">{cat.description}</div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={16} className={`ml-auto shrink-0 mt-0.5 ${cat.color}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Upload */}
        <div>
          <h2 className="text-base font-semibold text-[#1A1530] mb-1">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#3A2895] text-white rounded-full text-xs font-bold mr-2">
              2
            </span>
            Upload product brief
          </h2>
          <p className="text-sm text-[#6B6882] mb-4 ml-8">
            PDF or Word document with all the product details.
          </p>

          {file ? (
            <div className="flex items-center gap-3 p-4 bg-[#E6F9F8] border border-[#3EC9C1]/30 rounded-2xl">
              <div className="p-2 bg-[#3EC9C1]/20 rounded-xl">
                <File size={18} className="text-[#1FA89E]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#1A1530] truncate">{file.name}</div>
                <div className="text-xs text-[#6B6882]">{(file.size / 1024).toFixed(0)} KB</div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1.5 hover:bg-[#3EC9C1]/20 rounded-lg transition-colors"
              >
                <X size={14} className="text-[#6B6882]" />
              </button>
            </div>
          ) : (
            <div
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                dragOver
                  ? "border-[#3A2895] bg-[#F5F2FF]"
                  : "border-[#E4E0F0] bg-white hover:border-[#3A2895]/40 hover:bg-[#F5F2FF]/50"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#EEE9FF] flex items-center justify-center mx-auto mb-3">
                <Upload size={20} className="text-[#3A2895]/60" />
              </div>
              <p className="text-sm font-semibold text-[#1A1530] mb-1">Drop your brief here</p>
              <p className="text-xs text-[#9E9BAC]">or click to browse · PDF, DOCX · max 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="pt-2 border-t border-[#F0EDF8]">
          <Button
            onClick={handleGenerate}
            disabled={!category || !file}
            className="w-full h-11 text-base gap-2 shadow-[0_4px_16px_rgba(58,40,149,0.25)]"
          >
            Generate Content in 4 Languages
            <ArrowRight size={18} />
          </Button>
          <p className="text-xs text-center text-[#9E9BAC] mt-3">
            AI will generate English content and translate to Italian, Spanish &amp; French
          </p>
        </div>
      </div>
    </div>
  )
}
