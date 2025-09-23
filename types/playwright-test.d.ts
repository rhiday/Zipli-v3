declare module '@playwright/test' {
  interface TestInterface {
    (name: string, fn: (args: any) => any): any;
    describe: TestInterface & {
      configure: (...args: any[]) => any;
      skip: TestInterface;
      only: TestInterface;
    };
    beforeAll: (...args: any[]) => any;
    beforeEach: (...args: any[]) => any;
    afterAll: (...args: any[]) => any;
    afterEach: (...args: any[]) => any;
    step: (...args: any[]) => any;
    use: (...args: any[]) => any;
  }

  export const test: TestInterface;
  export const expect: any;
  export const defineConfig: (...args: any[]) => any;
  export const devices: Record<string, any>;
}
