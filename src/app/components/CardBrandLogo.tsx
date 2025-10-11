import Image from "next/image";

interface CardBrandLogoProps {
  brand: string;
  className?: string;
}

export default function CardBrandLogo({
  brand,
  className = "h-8",
}: CardBrandLogoProps) {
  const brandLower = brand.toLowerCase();

  if (brandLower === "visa") {
    return (
      <Image
        src="/visa-svgrepo-com.svg"
        alt="Visa"
        width={80}
        height={48}
        className={className}
      />
    );
  }

  if (brandLower === "mastercard") {
    return (
      <Image
        src="/mastercard-svgrepo-com.svg"
        alt="Mastercard"
        width={70}
        height={48}
        className={className}
      />
    );
  }

  if (brandLower === "amex" || brandLower === "american express") {
    return (
      <Image
        src="/amex-svgrepo-com.svg"
        alt="Amex"
        width={80}
        height={48}
        className={className}
      />
    );
  }

  if (brandLower === "discover") {
    return (
      <Image
        src="/icons8-discover-card.svg"
        alt="Discover"
        width={80}
        height={48}
        className={className}
      />
    );
  }

  return (
    <div className={`${className} flex items-center`}>
      <span className="text-sm font-bold uppercase text-white/90">{brand}</span>
    </div>
  );
}
