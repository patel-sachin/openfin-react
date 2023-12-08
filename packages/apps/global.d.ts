declare module '*.png';

declare module '*.svg' {
  const content: string;
  // @ts-ignore
  export default content;
}
