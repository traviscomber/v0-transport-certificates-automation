import { HelpCircle, Lightbulb, Info, CheckCircle2, ArrowRight, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

interface HelpStep {
  step: number
  title: string
  description: string
}

interface HelpBoxProps {
  title: string
  description?: string
  steps?: HelpStep[]
  tips?: string[]
  variant?: "info" | "steps" | "tip"
  compact?: boolean
}

export function HelpBox({ title, description, steps, tips, variant = "info", compact = true }: HelpBoxProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const variants = {
    info: {
      bg: "bg-primary/5 border-primary/30",
      icon: Info,
      iconColor: "text-primary",
      titleColor: "text-primary",
      textColor: "text-foreground/70"
    },
    steps: {
      bg: "bg-secondary/5 border-secondary/30",
      icon: CheckCircle2,
      iconColor: "text-secondary",
      titleColor: "text-secondary",
      textColor: "text-foreground/70"
    },
    tip: {
      bg: "bg-orange-500/5 border-orange-500/30",
      icon: Lightbulb,
      iconColor: "text-orange-500",
      titleColor: "text-orange-500",
      textColor: "text-foreground/70"
    }
  }

  const style = variants[variant]
  const Icon = style.icon

  if (compact) {
    return (
      <Card className={`${style.bg} border`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <CardHeader className="pb-1 py-2">
            <CardTitle className={`text-xs flex items-center gap-2 ${style.titleColor}`}>
              <Icon className={`w-3 h-3 flex-shrink-0 ${style.iconColor}`} />
              <span className="flex-1 text-left">{title}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </button>
        
        {isOpen && (
          <CardContent className={`space-y-2 text-xs ${style.textColor} pb-2`}>
            {description && (
              <p className="text-xs leading-tight">{description}</p>
            )}
            
            {steps && steps.length > 0 && (
              <div className="space-y-1">
                {steps.map((step) => (
                  <div key={step.step} className="flex items-start gap-2">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full ${variant === "steps" ? "bg-secondary" : "bg-primary"} text-white flex items-center justify-center text-xs font-bold`}>
                      {step.step}
                    </div>
                    <div>
                      <p className="font-semibold text-xs">{step.title}</p>
                      <p className="text-xs opacity-75">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tips && tips.length > 0 && (
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-1 text-xs">
                    <ArrowRight className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  // Non-compact version (original large version)
  return (
    <Card className={`${style.bg} border`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg flex items-center gap-2 ${style.titleColor}`}>
          <Icon className={`w-5 h-5 ${style.iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-3 ${style.textColor}`}>
        {description && (
          <p className="text-sm">{description}</p>
        )}
        
        {steps && steps.length > 0 && (
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.step} className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full ${variant === "steps" ? "bg-secondary" : "bg-primary"} text-white flex items-center justify-center text-sm font-bold`}>
                  {step.step}
                </div>
                <div>
                  <p className="font-semibold text-sm">{step.title}</p>
                  <p className="text-sm opacity-90">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tips && tips.length > 0 && (
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

interface QuickHelpProps {
  text: string
}

export function QuickHelp({ text }: QuickHelpProps) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
      <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
      <span>{text}</span>
    </div>
  )
}
