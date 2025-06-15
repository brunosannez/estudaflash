
import AuthGuard from './AuthGuard';
import HowItWorks from './upload/HowItWorks';
import UploadDropzone from './upload/UploadDropzone';
import UploadResult from './upload/UploadResult';
import DashboardUsageOverview from './dashboard/DashboardUsageOverview';
import { useUploadManager } from './upload/UploadManager';

const UploadArea = () => {
  const {
    dragActive,
    selectedFiles,
    uploadResult,
    fileInputRef,
    uploadResults,
    isProcessing,
    handleDrag,
    handleDrop,
    handleFileButtonClick,
    handleFileInput,
    handleProcessImages,
    resetAllUploads,
    removeFile,
    handleChooseOther,
    handleAddMoreFiles,
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <UploadDropzone
              dragActive={dragActive}
              selectedFiles={selectedFiles}
              uploadResults={uploadResults}
              isProcessing={isProcessing}
              fileInputRef={fileInputRef}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onFileButtonClick={handleFileButtonClick}
              onFileInput={handleFileInput}
              onProcessImages={handleProcessImages}
              onRemoveFile={removeFile}
              onChooseOther={handleChooseOther}
              onAddMoreFiles={handleAddMoreFiles}
            />
          </div>
          <div className="lg:col-span-1">
            <DashboardUsageOverview />
          </div>
        </div>
        <HowItWorks />
      </div>
    </AuthGuard>
  );
};

export default UploadArea;
