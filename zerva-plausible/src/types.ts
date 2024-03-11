export {}

declare global {
  interface ZContextEvents {
    trackEvent: (
      req: any,
      name: string,
      props?: Record<string, string>,
      url?: string
    ) => void
    trackPageView: (req: any, url?: string) => void
  }
}
