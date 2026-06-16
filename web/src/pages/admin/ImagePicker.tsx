import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, ImageIcon, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { MediaAsset } from "@shared/schema";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

async function uploadImage(file: File): Promise<MediaAsset> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/images", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Ошибка загрузки");
  return res.json();
}

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const { data: media = [] } = useQuery<MediaAsset[]>({
    queryKey: ["/api/media"],
    enabled: libraryOpen,
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadImage(file);
      onChange(asset.url);
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: "Изображение загружено и оптимизировано" });
    } catch (err) {
      toast({ title: "Не удалось загрузить", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt=""
              className="h-20 w-20 rounded-md object-cover border"
              data-testid="img-picker-preview"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -right-2 -top-2 rounded-full bg-white border p-0.5 shadow"
              data-testid="button-clear-image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed text-gray-400">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInput}
            onChange={handleFile}
            className="hidden"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            data-testid="button-upload-image"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Загрузить
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setLibraryOpen(true)}
            data-testid="button-open-library"
          >
            Из библиотеки
          </Button>
        </div>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="или вставьте URL изображения"
        data-testid="input-image-url"
      />

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Медиа-библиотека</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {media.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onChange(m.url);
                  setLibraryOpen(false);
                }}
                className="group relative overflow-hidden rounded-md border hover:ring-2 hover:ring-primary"
                data-testid={`button-library-${m.id}`}
              >
                <img src={m.url} alt={m.alt} className="aspect-square w-full object-cover" />
              </button>
            ))}
            {media.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-gray-500">
                Библиотека пуста. Загрузите изображения.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
