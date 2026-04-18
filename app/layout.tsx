export const metadata = {
  title: "Dave's Project Management",
  description: "Lightweight personal project and career planning workspace."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
