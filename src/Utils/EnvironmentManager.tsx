class EnvironmentConfig {
  private static instance: EnvironmentConfig;

  private constructor() {}

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  getApiKey(): string {
    return process.env.API_KEY || '';
  }

  getFirebaseKey(): string {
    return process.env.FIREBASE_KEY || '';
  }
}

export default EnvironmentConfig.getInstance();
