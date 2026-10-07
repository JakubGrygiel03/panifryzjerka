export type GuidePoint = { title: string; text: string };

export const FAQ = [
  {
    q: "Kto wykonuje zabiegi?",
    a: "Przy fotelu pracuje Pani Iryna: koloryzacja, szycie siwizny, strzyżenie i afroloki. Przed zabiegiem jest krótka rozmowa o tym, jak nosisz włosy na co dzień.",
  },
  {
    q: "Czy mogę przyjść ze swoim psem?",
    a: "Tak. W salonie mieszka Bella i spokojne psy są tu mile widziane. Jeśli Twój pies denerwuje się w nowym miejscu, daj znać przy zapisie — przygotujemy spokojniejszą godzinę.",
  },
  {
    q: "Czy jest parking?",
    a: "Tak, bezpłatny parking przy salonie na ul. Skarpowej 24 w Gdańsku.",
  },
  {
    q: "Czy salon jest dostępny dla osób niepełnosprawnych?",
    a: "Tak. Wejście jest przygotowane tak, żeby dało się wjechać wózkiem.",
  },
  {
    q: "Jak długo trwa szycie siwizny?",
    a: "Zwykle od około 3 godzin przy krótkich włosach do około 5 godzin przy bardzo długich.",
  },
  {
    q: "Czy muszę zakładać konto, żeby się zapisać?",
    a: "Nie. Wystarczy imię, telefon i e-mail do potwierdzenia wizyty.",
  },
  {
    q: "Co jeśli spóźnię się na wizytę?",
    a: "Zadzwoń pod 880-606-454. Jeśli spóźnisz się więcej niż 15 minut, zabieg może zostać skrócony albo przełożony.",
  },
  {
    q: "Jak odwołać wizytę?",
    a: "Odwołanie zrób telefonicznie najpóźniej poprzedniego dnia, pod numerem 880-606-454.",
  },
  {
    q: "Kiedy salon jest otwarty?",
    a: "Przyjmujemy od poniedziałku do piątku od 9:00 do 20:00 oraz w soboty od 9:00 do 18:00. Niedziela jest wolna.",
  },
  {
    q: "Gdzie płacę?",
    a: "Płatność odbywa się w salonie po zabiegu. Rezerwacja online nie pobiera przedpłaty.",
  },
  {
    q: "Czy dzieci są mile widziane?",
    a: "Tak. Jest strzyżenie dziecięce do 12. roku życia.",
  },
  {
    q: "Co to jest męski czwartek?",
    a: "W czwartki strzyżenie męskie kosztuje 70 zł. Dopisz w notatce: męski czwartek.",
  },
] as const;

export const PREP: GuidePoint[] = [
  { title: "Przyjdź tak, jak nosisz włosy", text: "Do koloryzacji nie trzeba myć ich tuż przed wyjściem. Pani Iryna widzi wtedy naturalny układ i odrost." },
  { title: "Napisz o poprzedniej farbie", text: "Jeśli farbowałaś włosy gdzie indziej, podaj w notatce kiedy i czym. Dzięki temu kolor da się zaplanować bez niespodzianki." },
  { title: "Zostaw czas po długim zabiegu", text: "Szycie siwizny i airtouch trwają kilka godzin. Nie umawiaj nic tuż po wizycie." },
  { title: "Zdejmij biżuterię z szyi", text: "Przy dłuższej pracy przy fotelu łańcuszek i kolczyki lepiej zostawić w torebce." },
  { title: "Miej telefon pod ręką", text: "Zostaw numer, pod którym odbierzesz, gdyby godzinę trzeba było przesunąć." },
];

export const AFTERCARE: GuidePoint[] = [
  { title: "Umyj włosy, kiedy powie Pani Iryna", text: "Po koloryzacji zwykle czekamy do następnego dnia. Dokładną godzinę usłyszysz przy fotelu." },
  { title: "Dwa dni bez basenu i wrzątku", text: "Bardzo gorąca woda i chlor szybciej wypłukują świeży kolor." },
  { title: "Domykaj odrost w umówionym rytmie", text: "Szycie siwizny wygląda naturalnie, gdy wracasz zanim siwizna zrobi szeroką linię." },
  { title: "Afroloków nie rozplataj sama", text: "Korektę umawiamy osobno. Samodzielne rozplatanie niszczy splot i skórę." },
];

export const SZYCIE = [
  "To technika zagęszczania koloru na siwiźnie tak, żeby odrost nie rysował ostrej linii.",
  "Cena rośnie z długością włosów, bo rośnie czas pracy.",
  "Przed zabiegiem jest krótka rozmowa o tym, jak nosisz włosy na co dzień.",
  "Efekt ma wyglądać jak Twój kolor, nie jak farba z pudełka.",
] as const;

export const RULES = [
  "Rezerwacja jest potwierdzona od razu po zapisie. Konto nie jest potrzebne.",
  "Między wizytami jest chwila na przygotowanie stanowiska, więc terminy nie nachodzą na siebie.",
  "Odwołanie zrób telefonicznie najpóźniej poprzedniego dnia.",
  "Spóźnienie powyżej 15 minut może skrócić usługę.",
  "Dane z formularza służą tylko do tej wizyty i kontaktu z salonem.",
] as const;
