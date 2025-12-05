export const LightColors = {
  primary: '#E8B4BC',
  primaryDark: '#D4949E',
  secondary: '#B8A9C9',
  secondaryDark: '#9A88B3',
  accent: '#F5E6E8',
  accentDark: '#EDD4D9',
  background: '#FEFCFD',
  backgroundSecondary: '#F8F4F5',
  card: '#FFFFFF',
  text: '#2D2D3A',
  textSecondary: '#6B6B7B',
  textLight: '#9A9AAA',
  border: '#F0E8EA',
  success: '#7BC9A4',
  warning: '#F5C77E',
  error: '#E88B8B',
  white: '#FFFFFF',
  gradientStart: '#F5E6E8',
  gradientMiddle: '#EDE4F0',
  gradientEnd: '#E8EEF5',
  overlay: 'rgba(45, 45, 58, 0.5)',
  shadowColor: '#D4949E',
};

export const DarkColors = {
  primary: '#E8B4BC', // Keep brand color or slightly adjust? Let's keep for now or desaturate
  primaryDark: '#D4949E',
  secondary: '#B8A9C9',
  secondaryDark: '#9A88B3',
  accent: '#2D2D3A', // Darker accent
  accentDark: '#1F1F2E',
  background: '#12121A', // Dark background
  backgroundSecondary: '#1A1A24',
  card: '#1E1E28', // Dark card
  text: '#EAEAEA', // Light text
  textSecondary: '#A0A0B0',
  textLight: '#6B6B7B',
  border: '#2D2D3A',
  success: '#7BC9A4',
  warning: '#F5C77E',
  error: '#E88B8B',
  white: '#FFFFFF', // White text on buttons usually stays white if button is colored.
  // But wait, if I use "white" for background of something, it should be dark.
  // However, "white" usually implies the color White.
  // I should probably introduce "cardBackground" vs "white".
  // But existing code uses "white".
  // I will map "white" to a dark color? No, "white" is usually absolute white.
  // I'll keep white as white, but check usage.
  // If usage is background, I should change usage to "card".
  gradientStart: '#1A1A24',
  gradientMiddle: '#12121A',
  gradientEnd: '#0D0D12',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadowColor: '#000000',
};

export default LightColors;
