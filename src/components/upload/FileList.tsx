
import { ImageUploadResult } from '@/types/upload';
import ImagePreview from './ImagePreview';

interface FileListProps {
  files: File[];
  uploadResults: ImageUploadResult[];
  onRemoveFile: (index: number) => void;
  isProcessing: boolean;
}

const FileList = ({ files, uploadResults, onRemoveFile, isProcessing }: FileListProps) => {
  const fileList = files.length > 0 ? files : uploadResults.map(r => r.file);
  const showRemoveButton = files.length > 0 && !isProcessing;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {fileList.map((file, index) => (
          <ImagePreview
            key={`${file.name}-${index}-${file.size}`}
            file={file}
            result={uploadResults[index]}
            onRemove={() => onRemoveFile(index)}
            isProcessing={isProcessing}
            showRemoveButton={showRemoveButton}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;
