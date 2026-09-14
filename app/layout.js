import "./globals.css";

export const metadata = {
  // title: "3D ULPIN & Vertical Property MappingB",
  title: "BhuVistar 3D",
  description: "Geospatial collateral verification prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
