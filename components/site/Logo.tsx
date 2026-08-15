// Логотип: картинка из настроек, если загружена, иначе фирменный текстовый.
export function Logo({
  logoUrl,
  size = 26,
  alt = "Paul English",
}: {
  logoUrl?: string | null;
  size?: number;
  alt?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={alt}
        style={{ height: size + 12, width: "auto", maxWidth: 220, objectFit: "contain" }}
      />
    );
  }
  return (
    <>
      <b>Paul</b>
      <span className="dot"></span>
      <b className="serif ital" style={{ fontSize: size }}>English</b>
    </>
  );
}
