
import AuthGuard from './AuthGuard';
import HowItWorks from './upload/HowItWorks';
import UploadDropzone from './upload/UploadDropzone';
import UploadResult from './upload/UploadResult';
import { UploadDebugInfo } from './upload/UploadDebugInfo';
import { UploadTestButton } from './upload/UploadTestButton';
import { useUploadManager } from './upload/UploadManager';

const UploadArea = () => {
  const {
    dragActive,
    selectedFiles,
    uploadResult,
    fileInputRef,
    uploadResults,
    isProcessing,
    batchProgress,
    handleDrag,
    handleDrop,
    handleFileButtonClick,
    handleFileInput,
    handleProcessImages,
    resetAllUploads,
    removeFile,
    handleChooseOther,
    handleAddMoreFiles,
    getBatchSize,
    testOcrFunction,
  } = useUploadManager();

  if (uploadResult) {
    return (
      <UploadResult
        uploadResult={uploadResult}
        onResetUploads={resetAllUploads}
      />
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Botão de teste em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex justify-end">
            <UploadTestButton onTest={testOcrFunction} isProcessing={isProcessing} />
          </div>
        )}
        
        <UploadDropzone
          dragActive={dragActive}
          selectedFiles={selectedFiles}
          uploadResults={uploadResults}
          isProcessing={isProcessing}
          batchProgress={batchProgress}
          fileInputRef={fileInputRef}
          onDrag={handleDrag}
          onDrop={handleDrop}
          onFileButtonClick={handleFileButtonClick}
          onFileInput={handleFileInput}
          onProcessImages={handleProcessImages}
          onRemoveFile={removeFile}
          onChooseOther={handleChooseOther}
          onAddMoreFiles={handleAddMoreFiles}
          getBatchSize={getBatchSize}
        />
        <HowItWorks />
        <UploadDebugInfo />
      </div>
    </AuthGuard>
  );
};

export default UploadArea;
