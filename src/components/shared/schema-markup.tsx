export function SchemaMarkup() {
  const org = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://steerclub.in",
    name: "SteerClub",
    alternateName: "Steer Co.",
    description:
      "India's first Driving Confidence platform. Take your Steer Score, join structured programs, and earn the road.",
    url: "https://steerclub.in",
    logo: "https://steerclub.in/logo.png",
    image: "https://steerclub.in/og-image.jpg",
    telephone: "+919876543210",
    email: "hello@steerclub.in",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Zirakpur",
      addressRegion: "Punjab",
      addressCountry: "IN",
      postalCode: "140603",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "30.6436",
      longitude: "76.8202",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "07:00",
        closes: "20:00",
      },
    ],
    sameAs: [
      "https://instagram.com/steerclub.in",
      "https://youtube.com/@steerclub",
      "https://linkedin.com/company/steerclub",
    ],
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, UPI, Net Banking",
    areaServed: [
      "Chandigarh", "Zirakpur", "Mohali", "Panchkula",
      "Delhi", "Bangalore", "Mumbai",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://steerclub.in",
    name: "SteerClub",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://steerclub.in/road-notes?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
