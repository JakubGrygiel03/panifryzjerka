export type SalonPhoto = {
  src: string;
  title: string;
  tag: string;
  alt: string;
};

export const salonGallery: SalonPhoto[] = [
  {
    src: "/salon/biz-06.jpg",
    title: "Szycie siwizny",
    tag: "Airtouch",
    alt: "Blond z efektem szycia siwizny i airtouch",
  },
  {
    src: "/salon/biz-11.jpg",
    title: "Koloryzacja",
    tag: "Fale",
    alt: "Półdługie fale w odcieniu piaskowego blondu",
  },
  {
    src: "/salon/biz-02.jpg",
    title: "Długie fale",
    tag: "Różowy blond",
    alt: "Długie różowo-blond fale, widok z tyłu",
  },
  {
    src: "/salon/biz-05.jpg",
    title: "Szycie siwizny",
    tag: "Przed i po",
    alt: "Porównanie włosów przed zabiegiem i po szyciu siwizny",
  },
  {
    src: "/salon/biz-03.jpg",
    title: "Koloryzacja",
    tag: "Wiśniowe pasemka",
    alt: "Krótkie włosy z wiśniowymi pasemkami",
  },
  {
    src: "/salon/biz-08.jpg",
    title: "Szycie siwizny",
    tag: "Przed i po",
    alt: "Metamorfoza szycia siwizny: odrost i efekt po zabiegu",
  },
  {
    src: "/salon/inspiration-01.jpg",
    title: "Trwała ondulacja",
    tag: "Męska",
    alt: "Męska trwała ondulacja, krótkie loki",
  },
  {
    src: "/salon/biz-07.jpg",
    title: "Koloryzacja",
    tag: "Miedź",
    alt: "Proste włosy w miedzianym blondzie",
  },
  {
    src: "/salon/biz-17.jpg",
    title: "Strzyżenie",
    tag: "Ombre",
    alt: "Krótkie warstwy z ciemnym odrostem i jasnymi końcami",
  },
  {
    src: "/salon/biz-16.jpg",
    title: "Trwała ondulacja",
    tag: "Wałki",
    alt: "Włosy nawinięte na wałki podczas trwałej ondulacji",
  },
  {
    src: "/salon/inspiration-08.jpg",
    title: "Kontrola odrostu",
    tag: "Z brązu na jasny",
    alt: "Kontrola odrostu: brązowe włosy rozjaśnione na blond",
  },
  {
    src: "/salon/biz-04.jpg",
    title: "Strzyżenie",
    tag: "Blond bob",
    alt: "Gładki blond bob",
  },
  {
    src: "/salon/inspiration-02.jpg",
    title: "Strzyżenie damskie",
    tag: "Włosy falowane",
    alt: "Strzyżenie damskie na włosach falowanych",
  },
  {
    src: "/salon/inspiration-07.jpg",
    title: "Koloryzacja",
    tag: "Róż pod spodem",
    alt: "Różowe pasma schowane pod brązowymi włosami",
  },
  {
    src: "/salon/inspiration-03.jpg",
    title: "Kamuflaż siwizny",
    tag: "Skronie",
    alt: "Kamuflaż siwizny na skroniach, przed i po",
  },
  {
    src: "/salon/inspiration-04.jpg",
    title: "Kamuflaż siwych",
    tag: "Blond",
    alt: "Kamuflaż siwych włosów w blondzie",
  },
  {
    src: "/salon/inspiration-05.jpg",
    title: "Kontrola odrostu",
    tag: "Z brązu na jasny",
    alt: "Kontrola odrostu przy przejściu z brązu na jasny blond",
  },
  {
    src: "/salon/inspiration-06.jpg",
    title: "Trwała ondulacja",
    tag: "Wałki i efekt",
    alt: "Trwała męska: wałki na głowie i gotowe loki",
  },
  {
    src: "/salon/biz-12.jpg",
    title: "Blond",
    tag: "Pasma",
    alt: "Blond z jaśniejszymi pasmami, spięty w niski kucyk",
  },
  {
    src: "/salon/biz-09.jpg",
    title: "Koloryzacja",
    tag: "Czerwień",
    alt: "Rude, teksturowane włosy do brody",
  },
  {
    src: "/salon/biz-10.jpg",
    title: "Trwała ondulacja",
    tag: "Męska",
    alt: "Krótkie męskie loki po trwałej ondulacji",
  },
];

export const featuredGallery = salonGallery.slice(0, 8);

export const irynaPhoto = {
  src: "/salon/biz-13.jpg",
  alt: "Pani Iryna miesza farbę w salonie",
};
