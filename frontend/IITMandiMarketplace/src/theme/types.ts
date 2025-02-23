import '@react-navigation/native';

declare module '@react-navigation/native' {
  export type ExtendedTheme = {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
      error: string;
      success: string;
      warning: string;
    };
  };

  export function useTheme(): ExtendedTheme;
}
