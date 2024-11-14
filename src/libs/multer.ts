import multer from "multer";

export const getFileFromRequest = (fieldName: string) => {
  return multer().single(fieldName);
};
