function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
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
  isImageFile,
  readFileAsBase64
};
