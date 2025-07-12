"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Document {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  uploadedAt: Date
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newDocuments = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading" as const,
        progress: 0,
        uploadedAt: new Date(),
      }))

      setDocuments((prev) => [...prev, ...newDocuments])

      // Simulate upload and processing
      for (const doc of newDocuments) {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, progress } : d)))
        }

        // Change to processing
        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "processing", progress: 0 } : d)))

        // Simulate processing
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise((resolve) => setTimeout(resolve, 200))
          setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, progress } : d)))
        }

        // Complete
        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "completed", progress: 100 } : d)))

        toast({
          title: "Document processed",
          description: `${doc.name} has been successfully processed and indexed.`,
        })
      }
    },
    [toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "application/json": [".json"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: true,
  })

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    toast({
      title: "Document removed",
      description: "The document has been removed from your knowledge base.",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: Document["status"]) => {
    const variants = {
      uploading: "secondary",
      processing: "secondary",
      completed: "default",
      error: "destructive",
    } as const

    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
        <p className="text-muted-foreground">Upload and manage documents for your AI knowledge base</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Drag and drop files or click to browse. Supported formats: PDF, CSV, JSON, TXT, DOCX
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">Maximum file size: 10MB per file</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>Track the status of your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {getStatusIcon(doc.status)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{doc.name}</p>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                    </p>

                    {(doc.status === "uploading" || doc.status === "processing") && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <span>{doc.status === "uploading" ? "Uploading" : "Processing"}...</span>
                          <span>{doc.progress}%</span>
                        </div>
                        <Progress value={doc.progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                    disabled={doc.status === "uploading" || doc.status === "processing"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
