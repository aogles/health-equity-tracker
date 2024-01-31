const ThemeStandardScreenSizes = {
  xs: '0px',
  tiny: '350px',
  sm: '600px',
  smMd: '768px',
  md: '960px',
  lg: '1280px',
  lgXl: '1440px',
  xl: '1920px',
  full: '100%',
}

const ThemeZIndexValues = {
  /*
          NOTE: some z indexes are generated by npm packages
          multimap modal blur backdrop: -1
          MUI sticky headers assigned: 2
          joyride warm welcome auto-assigned: 101
          */
  bottom: -999,
  middle: 0,
  almostTop: 3,
  top: 999,
}

const ThemeLineHeightValues = {
  lhSuperLoose: 2.45,
  lhLoose: 1.6,
  lhSomeMoreSpace: 1.3,
  lhSomeSpace: 1.15,
  lhNormal: 1,
  lhTight: 0.95,
  lhModalHeading: 1.25,
}
const het = {
  alertColor: '#d85c47',
  altBlack: '#383838',
  altDark: '#5f6368',
  altGreen: '#0b5240',
  altGrey: '#bdbdbd',
  altOrange: '#9d4d3f',
  altRed: '#d32f2f',
  barChartDark: '#0b5420',
  barChartLight: '#91c684',
  bgColor: '#e2e2e2',
  black: '#000',
  borderColor: '#3e3e3e',
  darkBlue: '#255792',
  darkGreen: '#083f31',
  dividerGrey: '#0000001f',
  exploreBgColor: '#f1f4f8',
  footerColor: '#edf3f0',
  greyDark: '#222',
  greyGridColor: '#f9f9f9',
  hexShareIconGray: '#757575',
  howToColor: '#bdc1c6',
  infobarColor: '#f8e8b0',
  joinEffortBg1: '#a5cdc0',
  joinEffortBg2: '#edb2a6',
  joinEffortBg3: '#275141',
  listboxColor: '#f1f3f4',
  mapDarkZero: '#35403d',
  mapDark: '#027e47',
  mapDarker: '#185e49',
  mapDarkest: '#134b3a',
  mapLightZero: '#fff9c1',
  mapLight: '#7db640',
  mapLighter: '#b9ce3a',
  mapLightest: '#f2e62f',
  mapMedicareDarkZero: '#090121',
  mapMedicareDark: '#365c8d',
  mapMedicareDarkest: '#46327f',
  mapMedicareEvenLighter: '#9fda3a',
  mapMedicareLightZero: '#fff9c1',
  mapMedicareLight: '#1fa187',
  mapMedicareLighter: '#4bc16c',
  mapMedicareLightest: '#f0e525',
  mapMedicareMid: '#267f8e',
  mapMid: '#3e9b42',
  mapWomenDarkZero: '#120161',
  mapWomenDark: '#8b0aa5',
  mapWomenDarker: '#5402a3',
  mapWomenDarkest: '#320161',
  mapWomenLightZero: '#f3e221',
  mapWomenLight: '#db5b68',
  mapWomenLighter: '#f48849',
  mapWomenLightest: '#febc2b',
  mapWomenMid: '#b93389',
  methodologyGreen: '#B5C7C2',
  navlinkColor: '#202124',
  redOrange: '#ed573f',
  reportAlert: '#ff9800',
  secondaryDark: '#167b6f',
  secondaryLight: '#89d5cc',
  secondaryMain: '#228b7e',
  standardInfo: '#f8f9fa',
  standardWarning: '#fff8eb',
  tableZebra: '#FDFFF9',
  teamBorderColor: '#9aa0a6',
  timeCyanBlue: '#79b4b7',
  timeDarkRed: '#8c0000',
  timePastelGreen: '#547d6b',
  timePink: '#ff85b3',
  timePurple: '#816d98',
  timeYellow: '#fcb431',
  toggleColor: '#e1e9e7',
  transparent: '#00000000',
  unknownMapEvenMore: '#2384b9',
  unknownMapLeast: '#d3eece',
  unknownMapLess: '#92d4be',
  unknownMapLesser: '#b8e3be',
  unknownMapMid: '#60bccb',
  unknownMapMore: '#47a8cb',
  unknownMapMost: '#0b61a2',
  white: '#fff',
  whyBoxColor: '#d8ebe5',
}

export {
  het,
  ThemeZIndexValues,
  ThemeLineHeightValues,
  ThemeStandardScreenSizes,
}
