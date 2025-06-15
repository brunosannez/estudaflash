
import { Card, CardContent } from '@/components/ui/card';
import Dropzone from './Dropzone';
import FileList from './FileList';
import UploadActions from './UploadActions';
import { ImageUploadResult } from '@/types/upload';

interface UploadDropzoneProps {
  dragActive: boolean;
  selectedFiles: File[];
  uploadResults: ImageUploadResult[];
  isProcessing: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileButtonClick: () => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessImages: () => void;
  onRemoveFile: (index: number) => void;
  onChooseOther: () => void;
  onAddMoreFiles: (files: File[]) => void;
}

const UploadDropzone = ({
  dragActive,
  selectedFiles,
  uploadResults,
  isProcessing,
  fileInputRef,
  onDrag,
  onDrop,
  onFileButtonClick,
  onFileInput,
  onProcessImages,
  onRemoveFile,
  onChooseOther,
  onAddMoreFiles,
}: UploadDropzoneProps) => {
  const showDropzone = selectedFiles.length === 0 && uploadResults.length === 0;

  return (
    <Card className="overflow-hidden shadow-2xl border-4 border-cyan-200">
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div
          className={`
            border-4 border-dashed rounded-2xl sm:rounded-3xl 
            p-6 sm:p-8 md:p-12 
            text-center transition-all duration-500
            ${dragActive 
              ? 'border-purple-500 bg-gradient-to-br from-purple-100 via-pink-100 to-cyan-100 scale-105' 
              : 'border-cyan-400 bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:via-pink-50 hover:to-cyan-50'
            }
          `}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFileInput}
            className="hidden"
            disabled={isProcessing}
          />
          {showDropzone ? (
            <Dropzone
              onFileButtonClick={onFileButtonClick}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <FileList
                files={selectedFiles}
                uploadResults={uploadResults}
                onRemoveFile={onRemoveFile}
                isProcessing={isProcessing}
              />
              <UploadActions
                selectedFiles={selectedFiles}
                onProcessImages={onProcessImages}
                isProcessing={isProcessing}
                onChooseOther={onChooseOther}
                onAddMoreFiles={onAddMoreFiles}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadDropzone;
