
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
    <Card className="overflow-hidden">
      <CardContent className="p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
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
            <div className="space-y-4">
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
