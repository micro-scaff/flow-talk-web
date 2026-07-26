const MAX_AVATAR_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function isAvatarFileSizeAllowed(file: File): boolean {
  return file.size <= MAX_AVATAR_FILE_SIZE_BYTES;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(String(reader.result || ""));
    });
    reader.addEventListener("error", () => {
      reject(new Error("头像读取失败"));
    });
    reader.readAsDataURL(file);
  });
}

export {
  isAvatarFileSizeAllowed,
  isImageFile,
  MAX_AVATAR_FILE_SIZE_BYTES,
  readFileAsBase64
};
