"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  CheckCircle,
  Eye,
  FileSearch,
  FileText,
  FileUp,
  Info,
  Loader2,
  RotateCcw,
  Sparkles,
  Upload
} from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/shared/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { ScrollArea } from "@/shared/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shared/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { toast } from "sonner"

import { cn } from "@/shared/lib/utils"

type UploadedFile = {
  id: string
  name: string
  type: string
  status: "processing" | "done"
}

type ExtractedField = {
  id: number
  label: string
  value: string
  confidence: number
  field: string
  needsReview?: boolean
  originalValue?: string
  isEdited?: boolean
}

type SimulatedExtraction = {
  confidence: number
  detectedSubstance: {
    name: string
    cas: string
    matchedInSystem: string
    confidence: number
  }
  extractedFields: ExtractedField[]
  specifications: Array<{
    parameter: string
    specification: string
    result: string
    method: string
  }>
}

type ImportHistoryEntry = {
  id: string
  document: string
  type: string
  substance: string
  fieldsImported: number
  fieldsTotal: number
  status: "completed" | "draft"
  date: string
}

const mockCoADocument = {
  header: "CERTIFICATE OF ANALYSIS",
  supplier: "ChemSupply Europe GmbH",
  product: "Phenoxyethanol",
  batchNumber: "PE-2024-B1287",
  casNumber: "122-99-6",
  einecs: "204-589-7",
  manufacturingDate: "2024-10-15",
  expiryDate: "2026-10-15",
  specifications: [
    { parameter: "Appearance", specification: "Clear liquid", result: "Conforms", method: "Visual" },
    { parameter: "Purity", specification: "≥ 99.0%", result: "99.5%", method: "GC" },
    { parameter: "Water Content", specification: "≤ 0.5%", result: "0.3%", method: "Karl Fischer" },
    { parameter: "Color (APHA)", specification: "≤ 10", result: "5", method: "ASTM D1209" },
    { parameter: "pH (10% solution)", specification: "6.0 - 8.0", result: "6.8", method: "pH meter" },
    { parameter: "Heavy Metals", specification: "≤ 10 ppm", result: "< 5 ppm", method: "ICP-MS" },
    { parameter: "Arsenic", specification: "≤ 2 ppm", result: "< 1 ppm", method: "ICP-MS" },
    { parameter: "Microbial Count", specification: "≤ 100 CFU/g", result: "< 10 CFU/g", method: "USP" }
  ],
  conclusion: "The above batch meets all specifications and is released for use.",
  signedBy: "Dr. Maria Schmidt, QC Manager",
  date: "2024-10-20"
}

const simulatedExtraction: SimulatedExtraction = {
  confidence: 94,
  detectedSubstance: {
    name: "Phenoxyethanol",
    cas: "122-99-6",
    matchedInSystem: "SUB-2341",
    confidence: 98
  },
  extractedFields: [
    {
      id: 1,
      label: "Batch Number",
      value: "PE-2024-B1287",
      confidence: 100,
      field: "batch_number"
    },
    {
      id: 2,
      label: "Manufacturing Date",
      value: "2024-10-15",
      confidence: 100,
      field: "manufacturing_date"
    },
    {
      id: 3,
      label: "Expiry Date",
      value: "2026-10-15",
      confidence: 100,
      field: "expiry_date"
    },
    {
      id: 4,
      label: "Purity",
      value: "99.5%",
      confidence: 95,
      field: "purity"
    },
    {
      id: 5,
      label: "pH Range",
      value: "6.0 - 8.0",
      confidence: 88,
      field: "ph_range"
    },
    {
      id: 6,
      label: "Water Content",
      value: "0.3%",
      confidence: 92,
      field: "water_content"
    },
    {
      id: 7,
      label: "Heavy Metals",
      value: "< 5 ppm",
      confidence: 75,
      field: "heavy_metals",
      needsReview: true
    },
    {
      id: 8,
      label: "Supplier",
      value: "ChemSupply Europe GmbH",
      confidence: 100,
      field: "supplier"
    }
  ],
  specifications: mockCoADocument.specifications
}

const defaultHistory: ImportHistoryEntry[] = [
  {
    id: "hist-1",
    document: "CoA_Ethylhexylglycerin.pdf",
    type: "CoA",
    substance: "Ethylhexylglycerin",
    fieldsImported: 11,
    fieldsTotal: 12,
    status: "completed",
    date: "20 Oct 2024"
  },
  {
    id: "hist-2",
    document: "MSDS_BenzylAlcohol.pdf",
    type: "MSDS",
    substance: "Benzyl Alcohol",
    fieldsImported: 8,
    fieldsTotal: 8,
    status: "completed",
    date: "18 Oct 2024"
  },
  {
    id: "hist-3",
    document: "TDS_SodiumBenzoate_v3.pdf",
    type: "TDS",
    substance: "Sodium Benzoate",
    fieldsImported: 9,
    fieldsTotal: 10,
    status: "draft",
    date: "16 Oct 2024"
  }
]

function inferDocumentType(filename: string) {
  const lowered = filename.toLowerCase()
  if (lowered.includes("msds") || lowered.includes("sds")) return "MSDS"
  if (lowered.includes("coa")) return "CoA"
  if (lowered.includes("tds")) return "TDS"
  return "Regulatory"
}

export function SmartDocumentProcessor() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<SimulatedExtraction | null>(null)
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([])
  const [selectedMatch, setSelectedMatch] = useState("match-1")
  const [importHistory, setImportHistory] = useState<ImportHistoryEntry[]>(defaultHistory)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const processingTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (processingTimeout.current) {
        clearTimeout(processingTimeout.current)
      }
    }
  }, [])

  const mappedData = useMemo(() => {
    const fieldMap = extractedFields.reduce<Record<string, string>>((acc, field) => {
      acc[field.field] = field.value
      return acc
    }, {})

    return {
      meta: {
        document: mockCoADocument.header,
        batch: mockCoADocument.batchNumber,
        supplier: mockCoADocument.supplier
      },
      extracted: fieldMap,
      specifications: simulatedExtraction.specifications
    }
  }, [extractedFields])

  const validFieldsCount = useMemo(
    () =>
      extractedFields.filter((field) => !field.needsReview && field.confidence >= 80 && field.value.trim().length).length,
    [extractedFields]
  )
  const totalFields = extractedFields.length

  function handleBrowseClick() {
    fileInputRef.current?.click()
  }

  function handleFileSelection(fileList: FileList | null) {
    if (!fileList || !fileList.length) return
    const filesArray = Array.from(fileList).map<UploadedFile>((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      name: file.name,
      type: inferDocumentType(file.name),
      status: "processing"
    }))

    setUploadedFiles(filesArray)
    setIsProcessing(true)

    processingTimeout.current = setTimeout(() => {
      setUploadedFiles((current) =>
        current.map((item) => ({
          ...item,
          status: "done"
        }))
      )
      setIsProcessing(false)

      const fieldsWithMeta = simulatedExtraction.extractedFields.map((field) => ({
        ...field,
        originalValue: field.value,
        isEdited: false
      }))

      setExtractedData(simulatedExtraction)
      setExtractedFields(fieldsWithMeta)
      toast.success("Extraction terminée — données prêtes pour validation.")
    }, 2400)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    handleFileSelection(event.dataTransfer.files)
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
  }

  function handleFieldChange(fieldId: number, nextValue: string) {
    setExtractedFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              value: nextValue,
              isEdited: nextValue !== field.originalValue
            }
          : field
      )
    )
  }

  function handleReprocess() {
    if (!uploadedFiles.length) return
    setIsProcessing(true)
    setExtractedData(null)
    setExtractedFields([])

    processingTimeout.current = setTimeout(() => {
      setUploadedFiles((current) =>
        current.map((item) => ({
          ...item,
          status: "done"
        }))
      )
      setIsProcessing(false)
      const fieldsWithMeta = simulatedExtraction.extractedFields.map((field) => ({
        ...field,
        originalValue: field.value,
        isEdited: false
      }))
      setExtractedData(simulatedExtraction)
      setExtractedFields(fieldsWithMeta)
      toast.info("Re-traitement complété.")
    }, 2000)
  }

  function handleValidateImport() {
    if (!extractedData) return
    const now = new Date()
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })

    setImportHistory((current) => [
      {
        id: `hist-${now.getTime()}`,
        document: uploadedFiles[0]?.name ?? "Smart Import",
        type: uploadedFiles[0]?.type ?? "CoA",
        substance: extractedData.detectedSubstance.name,
        fieldsImported: validFieldsCount,
        fieldsTotal: totalFields,
        status: "completed",
        date: formattedDate
      },
      ...current
    ])
    toast.success("Import validé — substance mise à jour.")
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => handleFileSelection(event.target.files)}
      />

      <Card className="border-2 border-dashed">
        <CardContent className="p-12">
          <div
            className="text-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">Drop your documents here</h3>
            <p className="mb-4 text-sm text-gray-600">
              CoA, MSDS, Technical Sheets, Regulatory Updates
            </p>
            <Button
              onClick={handleBrowseClick}
              disabled={isProcessing}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Browse Files
            </Button>

            {uploadedFiles.length > 0 ? (
              <div className="mt-6 space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-slate-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <Badge variant="secondary">{file.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === "processing" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                          <span className="text-sm text-slate-600">Extracting...</span>
                        </>
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {extractedData ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Extracted Data Review
              </span>
              <Badge variant="outline" className="text-green-600">
                {extractedData.confidence}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="doc-1">
              <TabsList>
                <TabsTrigger value="doc-1">
                  CoA_Phenoxyethanol_2024.pdf
                  <Badge className="ml-2" variant="secondary">
                    {extractedFields.length} fields
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="doc-2" disabled>
                  MSDS_SodiumBenzoate.pdf
                  <Badge className="ml-2" variant="secondary">
                    8 fields
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="doc-1"
                className="mt-4 space-y-6"
              >
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Substance Detection</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <span>
                          Detected:{" "}
                          <strong>{extractedData.detectedSubstance.name}</strong>
                        </span>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Badge variant="outline">
                            CAS: {extractedData.detectedSubstance.cas}
                          </Badge>
                          <Select
                            value={selectedMatch}
                            onValueChange={setSelectedMatch}
                          >
                            <SelectTrigger className="w-[240px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="match-1">
                                ✓ {extractedData.detectedSubstance.name} (ID:{" "}
                                {extractedData.detectedSubstance.matchedInSystem})
                              </SelectItem>
                              <SelectItem value="new">+ Create New Substance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-semibold">
                    <FileSearch className="h-4 w-4" />
                    Extracted Information
                  </h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    {extractedFields.map((field) => (
                      <div
                        key={field.id}
                        className={cn(
                          "rounded-lg border p-3",
                          field.confidence < 80 || field.needsReview
                            ? "border-orange-300 bg-orange-50"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <Label className="text-sm font-medium leading-tight">{field.label}</Label>
                          <div className="flex items-center gap-2">
                            {field.confidence >= 80 && !field.needsReview ? (
                              <Badge variant="outline" className="text-green-600 text-xs">
                                {field.confidence}%
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-orange-600 text-xs">
                                Review needed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Input
                          value={field.value}
                          onChange={(event) => handleFieldChange(field.id, event.target.value)}
                          className={cn(field.isEdited && "border-blue-500")}
                        />
                        {field.originalValue && field.originalValue !== field.value ? (
                          <p className="mt-1 text-xs text-gray-500">
                            Original: {field.originalValue}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <Accordion>
                    <AccordionItem value="specifications">
                      <AccordionTrigger>
                        Specifications Table
                        <Badge className="ml-2">15 parameters</Badge>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Parameter</TableHead>
                              <TableHead>Specification</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockCoADocument.specifications.map((spec) => (
                              <TableRow key={spec.parameter}>
                                <TableCell>{spec.parameter}</TableCell>
                                <TableCell>
                                  <Input defaultValue={spec.specification} />
                                </TableCell>
                                <TableCell>
                                  <Input defaultValue={spec.result} />
                                </TableCell>
                                <TableCell>
                                  <Input defaultValue={spec.method} />
                                </TableCell>
                                <TableCell>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Original Document</h4>
                    <div className="h-[400px] rounded-lg border bg-gray-50 p-4">
                      <iframe
                        title="Mock CoA"
                        src="/mock-coa.pdf"
                        className="h-full w-full rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Extracted &amp; Mapped Data</h4>
                    <ScrollArea className="h-[400px] rounded-lg border p-4">
                      <pre className="text-xs">{JSON.stringify(mappedData, null, 2)}</pre>
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="bg-gray-50">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReprocess}
                  disabled={isProcessing || !uploadedFiles.length}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Re-process
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Original
                </Button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline">Save as Draft</Button>
                <Button
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white"
                  onClick={handleValidateImport}
                  disabled={!uploadedFiles.length}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Validate &amp; Import ({validFieldsCount}/{totalFields})
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Substance</TableHead>
                <TableHead>Fields Imported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.document}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>{item.substance}</TableCell>
                  <TableCell>
                    {item.fieldsImported}/{item.fieldsTotal}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "completed" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
