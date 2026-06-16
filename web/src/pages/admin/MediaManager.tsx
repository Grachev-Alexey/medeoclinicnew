import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MediaAsset } from "@shared/schema";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaManager() {
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { data: media = [], isLoading } = useQuery<MediaAsset[]>({
    queryKey: ["/api/media"],
  });

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/images", {
          method: "POST",
          body: form,
          credentials: "include",
        });
        if (!res.ok) throw new Error("upload failed");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({ title: `Загружено и оптимизировано: ${files.length}` });
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const remove = async (id: string) => {
    await apiRequest("DELETE", `/api/admin/media/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/media"] });
    toast({ title: "Удалено" });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Ссылка скопирована" });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Медиа-библиотека</h1>
          <p className="mt-1 text-sm text-gray-500">
            Все изображения автоматически оптимизируются (WebP) при загрузке
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInput}
          onChange={handleFiles}
          className="hidden"
        />
        <Button onClick={() => fileInput.current?.click()} disabled={uploading} data-testid="button-upload-media">
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Загрузить
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-gray-400">
          Нет загруженных изображений
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-lg border bg-white" data-testid={`media-${m.id}`}>
              <img src={m.url} alt={m.alt} className="aspect-square w-full object-cover" />
              <div className="space-y-2 p-3">
                <p className="line-clamp-1 text-xs text-gray-600">{m.originalName}</p>
                <p className="text-xs text-gray-400">
                  {m.width}×{m.height} · {formatSize(m.size)}
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => copyUrl(m.url)}>
                    <Copy className="mr-1 h-3 w-3" /> URL
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(m.id)} data-testid={`button-delete-media-${m.id}`}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
