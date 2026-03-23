import { HelpCircle, Lightbulb, Info, CheckCircle2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
}

export function HelpBox({ title, description, steps, tips, variant = "info" }: HelpBoxProps) {
  const variants = {
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: Info,
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      textColor: "text-blue-800"
    },
    steps: {
      bg: "bg-green-50 border-green-200",
      icon: CheckCircle2,
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      textColor: "text-green-800"
    },
    tip: {
      bg: "bg-amber-50 border-amber-200",
      icon: Lightbulb,
      iconColor: "text-amber-600",
      titleColor: "text-amber-900",
      textColor: "text-amber-800"
    }
  }

  const style = variants[variant]
  const Icon = style.icon

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
                <div className={`flex-shrink-0 w-7 h-7 rounded-full ${variant === "steps" ? "bg-green-600" : "bg-blue-600"} text-white flex items-center justify-center text-sm font-bold`}>
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
