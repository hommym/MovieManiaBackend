import jsdom from "jsdom";

export const getDocumentObject = (htmlData: string): Document => {
  const { window } = new jsdom.JSDOM(htmlData);
  return window.document;
};
