import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type FitnectLogoProps = {
  size?: number;
};

export function FitnectLogo({ size = 104 }: FitnectLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Defs>
        <LinearGradient id="crimsonGloss" x1="150" y1="132" x2="410" y2="336" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FF3347" />
          <Stop offset="0.45" stopColor="#D20A1E" />
          <Stop offset="1" stopColor="#A60013" />
        </LinearGradient>
        <LinearGradient id="charcoalGloss" x1="122" y1="218" x2="230" y2="374" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#34373A" />
          <Stop offset="1" stopColor="#111315" />
        </LinearGradient>
      </Defs>
      <Path d="M150 372L185 220H276C288 220 294 234 287 244L276 260H197L176 344C172 359 165 365 150 372Z" fill="url(#charcoalGloss)" />
      <Path d="M174 132H410L374 186H247C228 186 218 196 212 216L198 260H152L176 166C181 146 193 132 174 132Z" fill="url(#crimsonGloss)" />
      <Path d="M183 246H285L314 176L348 336L380 250H430" stroke="url(#crimsonGloss)" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="430" cy="250" r="28" fill="url(#crimsonGloss)" />
      <Circle cx="430" cy="250" r="13" fill="#FFFFFF" />
      <Path d="M430 278L414 326" stroke="#17191B" strokeWidth="18" strokeLinecap="round" />
      <Circle cx="414" cy="326" r="22" fill="#17191B" />
      <Circle cx="414" cy="326" r="10" fill="#FFFFFF" />
      <Path d="M193 143H379L359 173H239C224 173 212 183 207 198L195 234" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}
