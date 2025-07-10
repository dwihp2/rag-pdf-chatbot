import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface PDFUploadProps {
  onUploadComplete?: () => void;
}

export default function PDFUpload({ onUploadComplete }: PDFUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(
      file => file.type === "application/pdf"
    );

    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error("Only PDF files are allowed");
    }

    setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10485760, // 10MB
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one PDF file to upload");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to upload files" }));
        throw new Error(errorData.error || "Failed to upload files");
      }

      setUploadProgress(100);

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setFiles([]);
        toast.success("Your PDF files have been processed and indexed");
        onUploadComplete?.();
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "There was an error processing your files";

      if (errorMessage.includes("Rate limit exceeded")) {
        toast.error("⚠️ API Rate Limit Exceeded", {
          description: "You've reached the monthly limit for your Cohere API trial. Please upgrade your plan or wait until next month.",
          duration: 8000,
        });
      } else {
        toast.error(errorMessage);
      }

      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Drop the PDF files here"
                : "Drag & drop PDF files here, or click to select files"}
            </p>
            <p className="text-xs text-gray-500">
              (Only PDF files up to 10MB are accepted)
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">Selected Files:</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-md"
                >
                  <span className="truncate max-w-[250px]">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploading && (
          <div className="mt-4 space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-gray-500">
              Uploading and processing PDFs... {uploadProgress}%
            </p>
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="w-full"
          >
            {uploading ? "Processing..." : "Upload and Process PDFs"}
          </Button>
        </div>
      </Card>
    </div>
  );
}