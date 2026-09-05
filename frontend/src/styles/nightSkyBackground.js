// Lekki motyw "nocnego nieba" — te same drobne gwiazdy co w Footer.jsx i Feed.jsx,
// żeby ciemne tła na całej stronie wyglądały spójnie (zamiast ciężkiego, rozmytego
// wariantu z dużymi radialnymi plamami, który był używany wcześniej).
const STAR_LAYERS = 9; // liczba warstw radial-gradient poniżej — musi się zgadzać!

export const nightSkyBackground = `
  radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
  radial-gradient(1px 1px at 75px 120px, #fff, rgba(0,0,0,0)),
  radial-gradient(1.5px 1.5px at 150px 60px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
  radial-gradient(1px 1px at 250px 180px, #fff, rgba(0,0,0,0)),
  radial-gradient(1.5px 1.5px at 400px 90px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
  radial-gradient(1px 1px at 580px 150px, #fff, rgba(0,0,0,0)),
  radial-gradient(2px 2px at 700px 50px, #fff, rgba(0,0,0,0)),
  radial-gradient(1px 1px at 850px 130px, #fff, rgba(0,0,0,0)),
  radial-gradient(1.5px 1.5px at 980px 70px, rgba(255,255,255,0.7), rgba(0,0,0,0)),
  linear-gradient(to bottom, #0B0F19, #05070B)
`;

// Liczba wartości MUSI być równa liczbie warstw tła (9 gwiazd + 1 warstwa bazowa) —
// inaczej CSS zapętla krótszą listę i ostatnia (bazowa) warstwa dostaje przypadkowy
// rozmiar/powtarzanie zamiast "pokryj cały kontener", co dawało widoczne pasy na stronie.
export const nightSkyBackgroundSize = Array(STAR_LAYERS).fill('1000px 250px').concat('100% 100%').join(', ');
export const nightSkyBackgroundRepeat = Array(STAR_LAYERS).fill('repeat-x').concat('no-repeat').join(', ');
