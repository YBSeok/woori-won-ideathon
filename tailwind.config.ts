import type { Config } from 'tailwindcss';
import { colors, radius } from './src/design/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        primaryPressed: colors.primaryPressed,
        bg: colors.bg,
        surface: colors.surface,
        textStrong: colors.textStrong,
        textBody: colors.textBody,
        textWeak: colors.textWeak,
        line: colors.line,
        success: colors.success,
        successText: colors.successText,
        caution: colors.caution,
        cautionText: colors.cautionText,
        danger: colors.danger,
        dangerText: colors.dangerText,
        stage: colors.stage,
        ai: colors.ai,
      },
      borderRadius: {
        card: `${radius.card}px`,
        button: `${radius.button}px`,
        chip: `${radius.chip}px`,
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(25, 31, 40, 0.05), 0 8px 20px rgba(25, 31, 40, 0.04)',
      },
      screens: {
        frame: '520px',
      },
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
    },
  },
  plugins: [],
} satisfies Config;
