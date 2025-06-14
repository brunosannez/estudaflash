
export const validateFiles = (files: File[]) => {
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      console.error('❌ Invalid files found:', invalidFiles.map(f => f.name));
      throw new Error(`Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB
            throw new Error(`File ${file.name} is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 10MB`);
        }
    }
}
