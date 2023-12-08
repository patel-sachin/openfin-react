import OpenFin, { fin } from '@openfin/core';

export const getWindowBounds = async (): Promise<OpenFin.WindowBounds> => {
  const finWindow = fin.Window.getCurrentSync();
  return finWindow.getBounds();
};
