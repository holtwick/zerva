export {}

declare global {
  interface ZContextEvents {
    trackEvent(
      req: any,
      event_type: string,
      event_value: string,
      url?: string
    ): void
    trackPageView(req: any, url?: string): void
  }
}
