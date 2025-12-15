/// <reference types="react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly REACT_APP_SUPABASE_URL: string;
        readonly REACT_APP_SUPABASE_ANON_KEY: string;
        readonly REACT_APP_API_URL?: string;
    }
}
