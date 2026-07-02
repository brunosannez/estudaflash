import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Video, 
  Music, 
  Image,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileProcessingItem {
  id: string;
  file_path: string;
  file_type: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_text?: string;
  metadata: Record<string, any>;
  error_message?: string;
  created_at: string;
}

const FileProcessingManager = () => {
  const [processingQueue, setProcessingQueue] = useState<FileProcessingItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Upload file to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `multimodal/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('study-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Determine file type
        const fileType = file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' :
                        file.type === 'application/pdf' ? 'pdf' : 'other';

        // Add to processing queue
        const { data, error } = await supabase
          .from('file_processing_queue')
          .insert({
            user_id: user.id,
            file_path: filePath,
            file_type: fileType,
            processing_status: 'pending',
            metadata: {
              original_name: file.name,
              file_size: file.size,
              mime_type: file.type
            }
          })
          .select()
          .single();

        if (error) throw error;

        setProcessingQueue(prev => [...prev, data as FileProcessingItem]);
        toast.success(`${file.name} adicionado à fila de processamento`);

        // Start processing
        await processFile(data.id);

      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Erro ao fazer upload de ${file.name}`);
      }
    }
    
    setUploading(false);
  }, []);

  const processFile = async (queueId: string) => {
    try {
      // Update status to processing
      await supabase
        .from('file_processing_queue')
        .update({ processing_status: 'processing' })
        .eq('id', queueId);

        setProcessingQueue(prev => 
          prev.map(item => 
            item.id === queueId 
              ? { ...item, processing_status: 'processing' as const }
              : item
          )
        );

      // Here you would call your multimodal processing edge function
      // For now, we'll simulate processing
      setTimeout(async () => {
        await supabase
          .from('file_processing_queue')
          .update({ 
            processing_status: 'completed',
            extracted_text: 'Texto extraído com sucesso (simulado)'
          })
          .eq('id', queueId);

        setProcessingQueue(prev => 
          prev.map(item => 
            item.id === queueId 
              ? { 
                  ...item, 
                  processing_status: 'completed' as const,
                  extracted_text: 'Texto extraído com sucesso (simulado)'
                }
              : item
          )
        );

        toast.success('Arquivo processado com sucesso!');
      }, 3000);

    } catch (error) {
      console.error('Error processing file:', error);
      
      await supabase
        .from('file_processing_queue')
        .update({ 
          processing_status: 'failed',
          error_message: 'Erro durante o processamento'
        })
        .eq('id', queueId);

      setProcessingQueue(prev => 
        prev.map(item => 
          item.id === queueId 
            ? { 
                ...item, 
                processing_status: 'failed' as const,
                error_message: 'Erro durante o processamento'
              }
            : item
        )
      );
    }
  };

  const deleteItem = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from('file_processing_queue')
        .delete()
        .eq('id', queueId);

      if (error) throw error;

      setProcessingQueue(prev => prev.filter(item => item.id !== queueId));
      toast.success('Item removido da fila');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao remover item');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'application/pdf': ['.pdf']
    },
    multiple: true,
    disabled: uploading
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'pdf': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando';
      case 'processing': return 'Processando';
      case 'completed': return 'Concluído';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Processamento Multimodal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-primary/5' 
                : 'border-input hover:border-gray-400'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground/70 mx-auto mb-4" />
            {uploading ? (
              <p className="text-lg font-medium">Fazendo upload...</p>
            ) : isDragActive ? (
              <p className="text-lg font-medium">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Suporte para: Imagens, PDFs, Vídeos, Áudios
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Queue */}
      {processingQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fila de Processamento ({processingQueue.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {processingQueue.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getFileIcon(item.file_type)}
                  <span className="font-medium">
                    {item.metadata.original_name || 'Arquivo'}
                  </span>
                </div>

                <div className="flex-1">
                  {item.processing_status === 'processing' && (
                    <Progress value={66} className="h-2" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(item.processing_status)}
                  <Badge variant={
                    item.processing_status === 'completed' ? 'default' :
                    item.processing_status === 'failed' ? 'destructive' :
                    'secondary'
                  }>
                    {getStatusLabel(item.processing_status)}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {processingQueue.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum arquivo na fila</h3>
            <p className="text-muted-foreground">
              Faça upload de arquivos para processamento automático de conteúdo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileProcessingManager;