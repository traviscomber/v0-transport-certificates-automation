"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Loader2, Check, AlertCircle, Code } from "lucide-react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"

const sampleDocuments = [
  {
    id: "f30",
    name: "F-30 Certificate",
    path: "/test-documents/f30-sample.jpg",
    type: "f30",
    description: "Chilean F-30 Transport Certificate"
  },
  {
    id: "licencia",
    name: "Driver License",
    path: "/test-documents/licencia-conducir-sample.jpg",
    type: "licencia_conducir",
    description: "Chilean Driver License"
  },
  {
    id: "revision",
    name: "Technical Inspection",
    path: "/test-documents/revision-tecnica-sample.jpg",
    type: "revision_tecnica",
    description: "Vehicle Technical Inspection Certificate"
  },
  {
    id: "permiso",
    name: "Circulation Permit",
    path: "/test-documents/permiso-circulacion-sample.jpg",
    type: "permiso_circulacion",
    description: "Vehicle Registration Permit"
  }
]

export default function TestExtractionPage() {
  const [selectedSample, setSelectedSample] = useState(sampleDocuments[0])
  const [customFile, setCustomFile] = useState<File | null>(null)
  const [customPreview, setCustomPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string>("")
  const [useCustom, setUseCustom] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setCustomFile(file)
        setError(null)
        setResult(null)

        const reader = new FileReader()
        reader.onload = (e) => {
          setCustomPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] }
  })

  const analyzeSample = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (process.env.NODE_ENV === "development") console.log("[v0] Analyzing sample:", selectedSample.name)

      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: selectedSample.path,
          documentType: selectedSample.type
        })
      })

      const data = await response.json()
      setRawResponse(JSON.stringify(data, null, 2))

      if (!response.ok) {
        setError(data.error || "Failed to analyze document")
        return
      }

      setResult(data)
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("[v0] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze document")
    } finally {
      setLoading(false)
    }
  }

  const analyzeCustom = async () => {
    if (!customFile) {
      setError("Please select a file")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", customFile)
      formData.append("documentType", "f30")

      const response = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData
      })

      const data = await response.json()
      setRawResponse(JSON.stringify(data, null, 2))

      if (!response.ok) {
        setError(data.error || "Failed to analyze document")
        return
      }

      setResult(data)
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("[v0] Error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Document Extraction Tester</h1>
          <p className="text-lg text-slate-600">Test OpenAI Vision extraction with sample Chilean documents</p>
        </div>

        <Tabs defaultValue="samples" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="samples">Sample Documents</TabsTrigger>
            <TabsTrigger value="custom">Upload Custom</TabsTrigger>
          </TabsList>

          {/* Sample Documents Tab */}
          <TabsContent value="samples" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sample Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Samples</CardTitle>
                  <CardDescription>Choose a pre-generated test document</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sampleDocuments.map((doc) => (
                    <Button
                      key={doc.id}
                      onClick={() => {
                        setSelectedSample(doc)
                        setResult(null)
                        setError(null)
                      }}
                      variant={selectedSample.id === doc.id ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto py-3"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{doc.name}</span>
                        <span className="text-xs opacity-75">{doc.description}</span>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Preview and Analyze */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative w-full h-64 bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
                      <Image
                        src={selectedSample.path}
                        alt={selectedSample.name}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <Button
                      onClick={analyzeSample}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze Document"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Custom Upload Tab */}
          <TabsContent value="custom" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Zone */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Custom Document</CardTitle>
                  <CardDescription>Upload your own document image</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                    <p className="text-slate-600 font-medium">Drag file here or click to select</p>
                    <p className="text-sm text-slate-500 mt-2">Supported: JPG, PNG, WebP</p>
                  </div>

                  {customPreview && (
                    <>
                      <div className="relative w-full h-64 bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
                        <img src={customPreview} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                      <Button
                        onClick={analyzeCustom}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          "Analyze Document"
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code size={20} />
                    Process Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">What happens when you analyze?</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Image is converted to base64</li>
                      <li>Sent to OpenAI Vision (gpt-4o)</li>
                      <li>Data extracted with specific prompts</li>
                      <li>Results validated and returned</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">Extracted fields:</p>
                    <ul className="space-y-1 text-slate-600">
                      <li>• Document numbers</li>
                      <li>• RUT/Identification</li>
                      <li>• Issue/Expiry dates</li>
                      <li>• Personal information</li>
                      <li>• Vehicle data</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results Section */}
        {(result || error) && (
          <div className="mt-8 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Check className="text-green-600" size={24} />
                    Extraction Successful
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="parsed" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="parsed">Extracted Data</TabsTrigger>
                      <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                    </TabsList>

                    <TabsContent value="parsed" className="space-y-4 mt-4">
                      {result.extractedData && (
                        <div className="space-y-3">
                          {Object.entries(result.extractedData).map(([key, value]: [string, any]) => (
                            <div key={key} className="bg-white p-3 rounded border border-green-200">
                              <p className="text-sm font-semibold text-slate-600 capitalize">
                                {key.replace(/_/g, " ")}
                              </p>
                              <p className="text-slate-900 mt-1 font-mono">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="raw" className="mt-4">
                      <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
                        {rawResponse}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
